import { LoginForm } from '@/features/auth/components/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | PetroCalc Suite',
  description: 'Sign in to access your petroleum engineering projects and simulations',
};

export default function LoginPage() {
  return <LoginForm />;
}
