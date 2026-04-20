'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedNav } from '@/components/shared/unified-nav';
import { PageLayout, PageHeader } from '@/components/shared';
import { staggerContainer, staggerItem } from '@/lib/animations';

const CONTACT_EMAIL = 'dourobats@gmail.com';

export default function CookiesPage() {
  const t = useTranslations('cookiesPage');

  const essentialItems = t.raw('types.essentialItems') as string[];
  const functionalItems = t.raw('types.functionalItems') as string[];
  const analyticsItems = t.raw('types.analyticsItems') as string[];
  const thirdPartyItems = t.raw('thirdParty.items') as string[];
  const persistentItems = t.raw('duration.persistentItems') as string[];
  const browserItems = t.raw('managing.browserItems') as string[];
  const specificItems = t.raw('managing.specificItems') as string[];

  return (
    <PageLayout nav={<UnifiedNav />}>
      <div className="space-y-6 sm:space-y-8">
        <PageHeader title={t('title')} description={t('lastUpdated')} />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-6 sm:space-y-8"
        >
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>{t('whatAreCookies.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('whatAreCookies.body')}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>{t('types.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <h3 className="font-semibold">{t('types.essentialTitle')}</h3>
                <p className="text-muted-foreground">{t('types.essentialBody')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {essentialItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                <h3 className="font-semibold mt-4">{t('types.functionalTitle')}</h3>
                <p className="text-muted-foreground">{t('types.functionalBody')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {functionalItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                <h3 className="font-semibold mt-4">{t('types.analyticsTitle')}</h3>
                <p className="text-muted-foreground">{t('types.analyticsBody')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {analyticsItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                <h3 className="font-semibold mt-4">{t('types.performanceTitle')}</h3>
                <p className="text-muted-foreground">{t('types.performanceBody')}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>{t('thirdParty.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('thirdParty.intro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {thirdPartyItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <p className="text-muted-foreground">{t('thirdParty.footer')}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>{t('duration.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <h3 className="font-semibold">{t('duration.sessionTitle')}</h3>
                <p className="text-muted-foreground">{t('duration.sessionBody')}</p>

                <h3 className="font-semibold mt-4">{t('duration.persistentTitle')}</h3>
                <p className="text-muted-foreground">{t('duration.persistentBody')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {persistentItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>{t('managing.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('managing.intro')}</p>

                <h3 className="font-semibold mt-4">{t('managing.browserTitle')}</h3>
                <p className="text-muted-foreground">{t('managing.browserIntro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {browserItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                <p className="text-muted-foreground mt-4">{t('managing.note')}</p>

                <h3 className="font-semibold mt-4">{t('managing.specificTitle')}</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {specificItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>{t('changes.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('changes.body')}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>{t('contactSection.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">
                  {t('contactSection.prefix')}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                    {CONTACT_EMAIL}
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
