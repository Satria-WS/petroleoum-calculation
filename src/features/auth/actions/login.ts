'use server';

import { loginSchema, LoginInput } from '../schemas/auth-schema';
import { ActionResponse } from '@/types/action-response';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function loginAction(input: LoginInput): Promise<ActionResponse<{ redirectUrl: string }>> {
  try {
    const validated = loginSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        message: 'Validation failed. Please check input parameters.',
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const res = await auth.api.signInEmail({
      body: {
        email: validated.data.email,
        password: validated.data.password,
      },
      headers: await headers(),
    });

    if (!res) {
      return {
        success: false,
        message: 'Invalid email or password credentials.',
      };
    }

    return {
      success: true,
      message: 'Authentication successful. Redirecting to projects workspace...',
      data: { redirectUrl: '/projects' },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Authentication failed due to server error.',
    };
  }
}
