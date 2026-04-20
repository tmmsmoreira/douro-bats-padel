'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel } from '@/components/ui/field';
import { Mail, Instagram, MapPin, Globe } from 'lucide-react';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { useTranslations } from 'next-intl';
import { PageLayout, PageHeader } from '@/components/shared';
import { TIMINGS } from '@/lib/constants';

export default function ContactPage() {
  const t = useTranslations('contactPage');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, TIMINGS.MOCK_SUBMIT_MS));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    setTimeout(() => setSubmitted(false), TIMINGS.FORM_SUCCESS_MS);
  };

  return (
    <PageLayout nav={<UnifiedNav />} maxWidth="6xl">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <PageHeader title={t('title')} description={t('subtitle')} />

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle>{t('getInTouch')}</CardTitle>
                <CardDescription>{t('getInTouchDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('address')}</h3>
                    <p className="text-sm text-muted-foreground">{t('addressValue')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('email')}</h3>
                    <a
                      href="mailto:dourobats@gmail.com"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      dourobats@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Instagram className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('instagram')}</h3>
                    <a
                      href="https://www.instagram.com/dourobats"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      @dourobats
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('website')}</h3>
                    <a
                      href="https://www.dourobats.pt"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      www.dourobats.pt
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('sendMessage')}</CardTitle>
                <CardDescription>{t('sendMessageDescription')}</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="name">{t('name')} *</FieldLabel>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder={t('namePlaceholder')}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="email">{t('email')} *</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder={t('emailPlaceholder')}
                        required
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="subject">{t('subject')} *</FieldLabel>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      placeholder={t('subjectPlaceholder')}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="message">{t('message')} *</FieldLabel>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, message: e.target.value }))
                      }
                      placeholder={t('messagePlaceholder')}
                      rows={6}
                      required
                    />
                  </Field>

                  {submitted && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-700 dark:text-green-400">
                      {t('successMessage')}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 justify-end">
                  <LoadingButton
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText={t('sending')}
                    animate
                  >
                    {t('sendMessageButton')}
                  </LoadingButton>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
