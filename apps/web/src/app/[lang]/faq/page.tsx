'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { PageLayout, PageHeader } from '@/components/shared';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

export default function FAQPage() {
  const t = useTranslations('faqPage');
  const tCategories = useTranslations('faqPage.categories');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = t.raw('items') as FAQItem[];
  const categoryKeys = Array.from(new Set(faqs.map((faq) => faq.category)));

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PageLayout nav={<UnifiedNav />}>
      <div className="space-y-6 sm:space-y-8">
        <PageHeader title={t('title')} description={t('subtitle')} />

        {categoryKeys.map((categoryKey) => (
          <motion.div
            key={categoryKey}
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-3 sm:space-y-4"
          >
            <h2 className="text-xl sm:text-2xl font-bold">{tCategories(categoryKey)}</h2>
            <div className="space-y-2 sm:space-y-3">
              {faqs
                .filter((faq) => faq.category === categoryKey)
                .map((faq) => {
                  const globalIndex = faqs.indexOf(faq);
                  const isOpen = openIndex === globalIndex;

                  return (
                    <motion.div key={globalIndex} variants={staggerItem}>
                      <Card className="overflow-hidden glass-card">
                        <CardHeader
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleFAQ(globalIndex)}
                        >
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-medium">{faq.question}</CardTitle>
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                            )}
                          </div>
                        </CardHeader>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <CardContent className="pt-0">
                                <p className="text-muted-foreground">{faq.answer}</p>
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        ))}

        <motion.div {...staggerItem}>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>{t('stillHaveQuestions')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-4">{t('stillHaveQuestionsText')}</p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {t('contactUs')}
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
}
