import { db } from '@/lib/db';
import { ProjectDetail } from '../types/project.types';

export async function getProjectById(projectId: string, userId?: string): Promise<ProjectDetail | null> {
  try {
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        ...(userId ? { userId } : {}),
      },
      include: {
        calculationCases: {
          orderBy: { createdAt: 'desc' },
        },
        productionHistory: {
          orderBy: { recordDate: 'asc' },
        },
        _count: {
          select: {
            calculationCases: true,
            productionHistory: true,
          },
        },
      },
    });

    return project as ProjectDetail | null;
  } catch (error) {
    console.error('Error in getProjectById query:', error);
    return null;
  }
}
