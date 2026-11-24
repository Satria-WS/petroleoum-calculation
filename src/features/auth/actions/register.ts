'use server';

import { registerSchema, RegisterInput } from '../schemas/auth-schema';
import { ActionResponse } from '@/types/action-response';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function registerAction(input: RegisterInput): Promise<ActionResponse<{ redirectUrl: string }>> {
  try {
    const validated = registerSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        message: 'Validation failed. Please check input parameters.',
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const res = await auth.api.signUpEmail({
      body: {
        name: validated.data.name,
        email: validated.data.email,
        password: validated.data.password,
        role: validated.data.role,
        preferredUnitSystem: validated.data.preferredUnitSystem,
      },
      headers: await headers(),
    });

    if (!res) {
      return {
        success: false,
        message: 'Failed to create engineer profile.',
      };
    }

    return {
      success: true,
      message: 'Account successfully created. Redirecting to workspace...',
      data: { redirectUrl: '/projects' },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Registration failed due to server error.',
    };
  }
}
