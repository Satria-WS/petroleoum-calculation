'use server';

import { db } from '@/lib/db';
import { ActionResponse } from '@/types/action-response';
import { revalidatePath } from 'next/cache';

export async function saveReservoirCaseAction(payload: {
  projectId: string;
  domain: 'RESERVOIR';
  moduleType: 'VOLUMETRIC_MONTE_CARLO' | 'DCA_ARPS' | 'MATERIAL_BALANCE';
  caseName: string;
  unitSystem: 'FIELD' | 'SI';
  inputParams: any;
  outputResults: any;
  chartSeries?: any;
  notes?: string;
  status: 'DRAFT' | 'VERIFIED';
}): Promise<ActionResponse<any>> {
  try {
    // Find or create default user if not logged in yet
    let user = await db.user.findFirst();
    if (!user) {
      user = await db.user.create({
        data: {
          name: 'Lead Petroleum Engineer',
          email: 'engineer@petrocalc.local',
          role: 'ADMIN',
        },
      });
    }

    // Ensure project exists
    let project = await db.project.findUnique({
      where: { id: payload.projectId },
    });

    if (!project) {
      project = await db.project.create({
        data: {
          userId: user.id,
          name: 'Default Field Workspace',
          fieldName: 'Standard Reservoir',
          wellName: 'Well-01',
          wellType: 'OIL',
        },
      });
    }

    const savedCase = await db.calculationCase.create({
      data: {
        projectId: project.id,
        userId: user.id,
        domain: payload.domain,
        moduleType: payload.moduleType,
        caseName: payload.caseName,
        unitSystem: payload.unitSystem,
        inputParams: payload.inputParams,
        outputResults: payload.outputResults,
        chartSeries: payload.chartSeries ?? {},
        notes: payload.notes,
        status: payload.status,
      },
    });

    revalidatePath('/reservoir');
    revalidatePath(`/projects/${project.id}`);
    return {
      success: true,
      message: `Scenario "${savedCase.caseName}" persisted successfully.`,
      data: savedCase,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Failed to persist reservoir scenario.',
    };
  }
}
