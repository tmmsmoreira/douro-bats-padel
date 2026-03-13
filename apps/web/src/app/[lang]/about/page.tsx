import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react';
import { HomeNavClient } from '@/components/shared/client-nav-wrapper';
import { getTranslations } from 'next-intl/server';
import { PageLayout, SectionHeader } from '@/components/shared';

export default async function AboutPage() {
  const t = await getTranslations('aboutPage');
  return (
    <PageLayout nav={<HomeNavClient />}>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <SectionHeader title={t('title')} description={t('subtitle')} align="center" />

        {/* Mission Statement */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{t('ourMission')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-muted-foreground">{t('missionParagraph1')}</p>
            <p className="text-muted-foreground">{t('missionParagraph2')}</p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('competitiveTournaments')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground">{t('competitiveTournamentsDescription')}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('playerRankings')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground">{t('playerRankingsDescription')}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('communityDriven')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground">{t('communityDrivenDescription')}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('easyEventManagement')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground">{t('easyEventManagementDescription')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Our Story */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{t('ourStory')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-muted-foreground">{t('storyParagraph1')}</p>
            <p className="text-muted-foreground">{t('storyParagraph2')}</p>
            <p className="text-muted-foreground">{t('storyParagraph3')}</p>
          </CardContent>
        </Card>

        {/* Values */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{t('ourValues')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <div>
                  <strong>{t('valueFairPlay')}</strong> {t('valueFairPlayDescription')}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <div>
                  <strong>{t('valueCommunity')}</strong> {t('valueCommunityDescription')}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <div>
                  <strong>{t('valueExcellence')}</strong> {t('valueExcellenceDescription')}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <div>
                  <strong>{t('valueInclusivity')}</strong> {t('valueInclusivityDescription')}
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
