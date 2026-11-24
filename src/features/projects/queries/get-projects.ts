import { db } from '@/lib/db';
import { ProjectSummary } from '../types/project.types';

export async function getProjects(userId?: string): Promise<ProjectSummary[]> {
  try {
    const projects = await db.project.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            calculationCases: true,
            productionHistory: true,
          },
        },
      },
    });

    return projects as ProjectSummary[];
  } catch (error) {
    console.error('Error in getProjects query:', error);
    // Return empty array on database disconnection / preview mode
    return [];
  }
}
