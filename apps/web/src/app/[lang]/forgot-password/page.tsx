import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { CenteredAuthLayout } from '@/components/auth';

export default function ForgotPasswordPage() {
  return (
    <CenteredAuthLayout>
      <ForgotPasswordForm />
    </CenteredAuthLayout>
  );
}
