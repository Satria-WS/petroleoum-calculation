import { RegisterForm } from '@/features/auth/components/register-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engineer Registration | PetroCalc Suite',
  description: 'Create an engineer account for petroleum simulation and reservoir modeling',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
