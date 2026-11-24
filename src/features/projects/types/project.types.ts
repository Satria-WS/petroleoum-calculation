export type WellType = 'OIL' | 'GAS' | 'CONDENSATE';
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';

export interface ProjectSummary {
  id: string;
  userId: string;
  name: string;
  fieldName: string;
  wellName: string;
  wellType: WellType;
  description: string | null;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    calculationCases: number;
    productionHistory: number;
  };
}

export interface ProjectDetail extends ProjectSummary {
  calculationCases: any[];
  productionHistory: any[];
}
