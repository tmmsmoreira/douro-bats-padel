import { PageLayout } from '@/components/shared';
import { HomeAdaptiveNav } from '@/components/shared/nav/home-adaptive-nav';

export default function EventIdLayout({ children }: { children: React.ReactNode }) {
  return <PageLayout nav={<HomeAdaptiveNav />}>{children}</PageLayout>;
}
