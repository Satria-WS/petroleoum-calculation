'use server';

import { db } from '@/lib/db';
import { ActionResponse } from '@/types/action-response';
import { revalidatePath } from 'next/cache';

export async function saveProductionCaseAction(payload: {
  projectId: string;
  domain: 'PRODUCTION';
  moduleType: 'NODAL_ANALYSIS' | 'ARTIFICIAL_LIFT';
  caseName: string;
  unitSystem: 'FIELD' | 'SI';
  inputParams: any;
  outputResults: any;
  chartSeries?: any;
  notes?: string;
  status: 'DRAFT' | 'VERIFIED';
}): Promise<ActionResponse<any>> {
  try {
    let user = await db.user.findFirst();
    if (!user) {
      user = await db.user.create({
        data: {
          name: 'Lead Production Engineer',
          email: 'engineer@petrocalc.local',
          role: 'ADMIN',
        },
      });
    }

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

    revalidatePath('/production');
    revalidatePath(`/projects/${project.id}`);
    return {
      success: true,
      message: `Production case "${savedCase.caseName}" saved successfully.`,
      data: savedCase,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Failed to persist production case.',
    };
  }
}
