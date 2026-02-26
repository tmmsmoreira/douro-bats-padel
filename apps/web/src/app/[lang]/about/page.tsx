import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react';
import { Footer } from '@/components/footer';
import { HomeNavClient } from '@/components/client-nav-wrapper';
import { getTranslations } from 'next-intl/server';

export default async function AboutPage() {
  const t = await getTranslations('aboutPage');
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNavClient />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 max-w-4xl flex-1 min-h-[500px]">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{t('title')}</h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">{t('subtitle')}</p>
          </div>

          {/* Mission Statement */}
          <Card>
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
            <Card>
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

            <Card>
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

            <Card>
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

            <Card>
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
          <Card>
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
          <Card>
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
      </main>
      <Footer />
    </div>
  );
}
