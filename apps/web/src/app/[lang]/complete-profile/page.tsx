import { CompleteProfileForm } from '@/components/auth/complete-profile-form';
import { AuthPageLayout } from '@/components/auth';

export default function CompleteProfilePage() {
  return (
    <AuthPageLayout>
      <CompleteProfileForm />
    </AuthPageLayout>
  );
}
