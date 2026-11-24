'use server';

import { db } from '@/lib/db';
import { ActionResponse } from '@/types/action-response';
import { revalidatePath } from 'next/cache';

export async function deleteProjectAction(projectId: string): Promise<ActionResponse<null>> {
  try {
    await db.project.delete({
      where: { id: projectId },
    });

    revalidatePath('/projects');
    return {
      success: true,
      message: 'Project and all associated calculation cases deleted.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Failed to delete project.',
    };
  }
}
