'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { HomeAdaptiveNav } from '@/components/shared/home-adaptive-nav';
import { PageLayout } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { Trophy, Users, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { HomeUpcomingEvents } from '@/components/home/home-upcoming-events';

export default function HomePage() {
  const { data: session } = useSession();
  const t = useTranslations('home');
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Parallax effects for hero section
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <PageLayout nav={<HomeAdaptiveNav />}>
      <div ref={containerRef} className="space-y-0">
        {/* Hero Section with Parallax */}
        <motion.section
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-background to-secondary/20" />

          {/* Animated Overlay - Testing with visible colors */}
          <motion.div
            className="absolute inset-0 bg-linear-to-tr from-primary/30 to-secondary/30"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold font-heading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <span className="gradient-text">{t('hero.title')}</span>
              </motion.h1>
              <motion.p
                className="text-xl sm:text-2xl lg:text-3xl font-semibold text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {t('hero.subtitle')}
              </motion.p>
            </motion.div>

            <motion.p
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {t('hero.description')}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {!session ? (
                <>
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto group">
                      {t('hero.ctaPrimary')}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      {t('hero.ctaSignIn')}
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="#upcoming-events">
                  <Button size="lg" className="w-full sm:w-auto group">
                    {t('hero.ctaSecondary')}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section with Scroll Animations */}
        <FeaturesSection t={t} />

        {/* Upcoming Events Section */}
        <section id="upcoming-events" className="py-12 sm:py-16 lg:py-20">
          <HomeUpcomingEvents />
        </section>

        {/* CTA Section with Parallax */}
        {!session && <CTASection t={t} />}
      </div>
    </PageLayout>
  );
}

// Features Section Component
function FeaturesSection({ t }: { t: (key: string) => string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const features = [
    {
      icon: Trophy,
      title: t('features.tournament.title'),
      description: t('features.tournament.description'),
      gradient: 'from-yellow-500/20 to-orange-500/20',
    },
    {
      icon: Calendar,
      title: t('features.rsvp.title'),
      description: t('features.rsvp.description'),
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      icon: TrendingUp,
      title: t('features.rankings.title'),
      description: t('features.rankings.description'),
      gradient: 'from-green-500/20 to-emerald-500/20',
    },
    {
      icon: Users,
      title: t('features.community.title'),
      description: t('features.community.description'),
      gradient: 'from-purple-500/20 to-pink-500/20',
    },
  ];

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 lg:py-24 relative overflow-hidden">
      <div className="relative z-10 space-y-8 sm:space-y-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 sm:space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading">
            {t('features.title')}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Feature Card Component with Scroll Animations
interface FeatureCardProps {
  feature: {
    icon: React.ElementType;
    title: string;
    description: string;
    gradient: string;
  };
  index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="glass-card h-full group hover:shadow-2xl hover:scale-105 transition-all duration-300">
        <CardHeader>
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${feature.gradient} w-fit mb-4`}>
            <Icon className="h-6 w-6 text-foreground" />
          </div>
          <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{feature.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// CTA Section with Parallax
function CTASection({ t }: { t: (key: string) => string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 lg:py-24 relative overflow-hidden">
      <motion.div
        style={{ y }}
        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <Card className="glass-card border-2 border-primary/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <CardContent className="relative p-8 sm:p-12 lg:p-16 text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading gradient-text">
                {t('ctaSection.title')}
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              {t('ctaSection.description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="/register">
                <Button size="lg" className="group">
                  {t('ctaSection.button')}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
