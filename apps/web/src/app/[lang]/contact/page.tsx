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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { UnifiedNav } from '@/components/shared/unified-nav';
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
                      href="mailto:info@dourobatspadel.com"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      info@dourobatspadel.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('phone')}</h3>
                    <a
                      href="tel:+351123456789"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      +351 123 456 789
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('businessHours')}</h3>
                    <p className="text-sm text-muted-foreground">{t('businessHoursWeekdays')}</p>
                    <p className="text-sm text-muted-foreground">{t('businessHoursWeekends')}</p>
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
              <CardContent className="pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('name')} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder={t('namePlaceholder')}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('email')} *</Label>
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
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('subject')} *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      placeholder={t('subjectPlaceholder')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('message')} *</Label>
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
                  </div>

                  {submitted && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-700 dark:text-green-400">
                      {t('successMessage')}
                    </div>
                  )}
                </form>
              </CardContent>
              <CardFooter className="pt-0 justify-end">
                <Button type="submit" disabled={isSubmitting} animate>
                  {isSubmitting ? t('sending') : t('sendMessageButton')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
