'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { PageLayout, PageHeader } from '@/components/shared';
import { staggerContainer, staggerItem } from '@/lib/animations';

const CONTACT_EMAIL = 'dourobats@gmail.com';

export default function PrivacyPage() {
  const t = useTranslations('privacyPage');

  const introParagraphs = t.raw('intro.paragraphs') as string[];
  const personalItems = t.raw('collect.personalItems') as string[];
  const automaticItems = t.raw('collect.automaticItems') as string[];
  const useItems = t.raw('use.items') as string[];
  const legalBasisItems = t.raw('legalBasis.items') as string[];
  const sharingItems = t.raw('sharing.items') as string[];
  const rightsItems = t.raw('rights.items') as string[];

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
                <CardTitle>{t('collect.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <h3 className="font-semibold ">{t('collect.personalTitle')}</h3>
                <p className="text-muted-foreground">{t('collect.personalIntro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {personalItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardContent>
              <CardContent className="pt-0 space-y-4">
                <h3 className="font-semibold mt-4">{t('collect.automaticTitle')}</h3>
                <p className="text-muted-foreground">{t('collect.automaticIntro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {automaticItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('use.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('use.intro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {useItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('legalBasis.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('legalBasis.intro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {legalBasisItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('sharing.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground">{t('sharing.intro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {sharingItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <p className="text-muted-foreground">{t('sharing.footer')}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('security.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">{t('security.body')}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('retention.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">{t('retention.body')}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('rights.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">{t('rights.intro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  {rightsItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <p className="text-muted-foreground">
                  {t('rights.contactPrefix')}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                    {CONTACT_EMAIL}
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('cookies.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">
                  {t('cookies.prefix')}
                  <Link href="/cookies" className="text-primary hover:underline">
                    {t('cookies.link')}
                  </Link>
                  {t('cookies.suffix')}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('thirdParty.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">{t('thirdParty.body')}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('minors.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">{t('minors.body')}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('changes.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
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
