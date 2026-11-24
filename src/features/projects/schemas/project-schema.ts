import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(3, 'Project title must be at least 3 characters'),
  fieldName: z.string().min(2, 'Field name is required (e.g. Gullfaks, Permian, Ghawar)'),
  wellName: z.string().min(2, 'Well identifier is required (e.g. A-12H, Well-04)'),
  wellType: z.enum(['OIL', 'GAS', 'CONDENSATE']).default('OIL'),
  description: z.string().optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const updateProjectSchema = projectSchema.extend({
  status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
