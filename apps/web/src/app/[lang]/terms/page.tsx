'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedNav } from '@/components/shared/unified-nav';
import { PageLayout, PageHeader } from '@/components/shared';
import { staggerContainer, staggerItem } from '@/lib/animations';

const CONTACT_EMAIL = 'dourobats@gmail.com';

export default function TermsPage() {
  const t = useTranslations('termsPage');

  const introParagraphs = t.raw('intro.paragraphs') as string[];
  const accountsItems = t.raw('accounts.items') as string[];
  const tournamentsItems = t.raw('tournaments.items') as string[];
  const rankingItems = t.raw('ranking.items') as string[];
  const conductItems = t.raw('conduct.items') as string[];

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
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('intro.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {introParagraphs.map((p, i) => (
                  <p key={i} className="text-muted-foreground">
                    {p}
                  </p>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('accounts.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('accounts.intro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {accountsItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('tournaments.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('tournaments.intro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {tournamentsItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <p className="text-muted-foreground">{t('tournaments.footer')}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('ranking.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('ranking.intro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {rankingItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('conduct.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('conduct.intro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {conductItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('fees.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('fees.body')}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('ip.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('ip.body')}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('liability.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('liability.body')}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('changes.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('changes.body')}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
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
