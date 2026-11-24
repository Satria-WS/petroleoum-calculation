import { z } from 'zod';

export const volumetricCaseSchema = z.object({
  projectId: z.string().min(1, 'Project selection is required'),
  caseName: z.string().min(2, 'Case name is required'),
  area: z.number().positive('Drainage area must be positive'),
  thickness: z.number().positive('Net pay thickness must be positive'),
  porosity: z.number().min(0.01).max(0.99, 'Porosity must be between 0 and 1'),
  waterSaturation: z.number().min(0.0).max(0.99, 'Water saturation must be between 0 and 1'),
  formationVolumeFactor: z.number().positive('Formation volume factor must be positive'),
  recoveryFactor: z.number().min(0.01).max(1.0, 'Recovery factor must be between 0 and 1'),
  fluidType: z.enum(['OIL', 'GAS']).default('OIL'),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'VERIFIED']).default('DRAFT'),
});

export type VolumetricCaseInput = z.infer<typeof volumetricCaseSchema>;

export const dcaCaseSchema = z.object({
  projectId: z.string().min(1, 'Project selection is required'),
  caseName: z.string().min(2, 'Case name is required'),
  initialRate: z.number().positive('Initial rate must be positive'),
  initialDeclineNominal: z.number().positive('Nominal decline must be positive'),
  bFactor: z.number().min(0).max(2.0, 'b-factor must be between 0 and 2'),
  economicLimitRate: z.number().positive('Economic limit must be positive'),
  forecastYears: z.number().int().min(1).max(50).default(10),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'VERIFIED']).default('DRAFT'),
});

export type DcaCaseInput = z.infer<typeof dcaCaseSchema>;
