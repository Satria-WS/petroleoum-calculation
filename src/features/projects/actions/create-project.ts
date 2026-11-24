'use server';

import { db } from '@/lib/db';
import { projectSchema, ProjectInput } from '../schemas/project-schema';
import { ActionResponse } from '@/types/action-response';
import { revalidatePath } from 'next/cache';

export async function createProjectAction(
  input: ProjectInput,
  userId = 'default-user'
): Promise<ActionResponse<any>> {
  try {
    const validated = projectSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        message: 'Invalid project configuration.',
        errors: validated.error.flatten().fieldErrors,
      };
    }

    // Ensure user exists or find first user
    let effectiveUserId = userId;
    const existingUser = await db.user.findFirst();
    if (existingUser) {
      effectiveUserId = existingUser.id;
    } else {
      const newUser = await db.user.create({
        data: {
          name: 'Demo Petroleum Engineer',
          email: 'engineer@petrocalc.local',
          role: 'ENGINEER',
        },
      });
      effectiveUserId = newUser.id;
    }

    const project = await db.project.create({
      data: {
        userId: effectiveUserId,
        name: validated.data.name,
        fieldName: validated.data.fieldName,
        wellName: validated.data.wellName,
        wellType: validated.data.wellType,
        description: validated.data.description,
        status: 'ACTIVE',
      },
    });

    revalidatePath('/projects');
    return {
      success: true,
      message: `Well project "${project.name}" initialized successfully.`,
      data: project,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Failed to initialize project in database.',
    };
  }
}
