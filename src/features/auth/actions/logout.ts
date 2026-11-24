'use server';

import { ActionResponse } from '@/types/action-response';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function logoutAction(): Promise<ActionResponse<{ redirectUrl: string }>> {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });

    return {
      success: true,
      message: 'Logged out successfully.',
      data: { redirectUrl: '/login' },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Error occurred while logging out.',
    };
  }
}
