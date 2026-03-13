import { ResendVerificationForm } from '@/components/auth/resend-verification-form';
import { CenteredAuthLayout } from '@/components/auth';

export default function ResendVerificationPage() {
  return (
    <CenteredAuthLayout>
      <ResendVerificationForm />
    </CenteredAuthLayout>
  );
}
