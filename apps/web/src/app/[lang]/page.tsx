'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { HomeAdaptiveNav } from '@/components/shared/nav/home-adaptive-nav';
import { Footer } from '@/components/public/footer';
import { SkipLinks } from '@/components/shared/nav/skip-links';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { Trophy, Users, TrendingUp, Calendar, ArrowRight, Smartphone, Check } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { HomeUpcomingEvents } from '@/components/home/home-upcoming-events';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { useSplashOffset } from '@/hooks/use-is-standalone';
import { PWAInstallInstructions } from '@/components/shared/pwa/pwa-install-instructions';
import { staggerItem } from '@/lib/animations';
import Image from 'next/image';

export default function HomePage() {
  const { data: session } = useSession();
  const t = useTranslations('home');
  const containerRef = useRef<HTMLDivElement>(null);
  const splashOffset = useSplashOffset();

  // Defer the hero video until after first paint. The MP4 source is ~33MB
  // at 4K/30fps and autoplay would start pulling it during hydration; showing
  // the poster first keeps LCP fast and respects `prefers-reduced-motion`.
  const [showVideo, setShowVideo] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (h: number) => void;
    };

    if (w.requestIdleCallback) {
      const handle = w.requestIdleCallback(() => setShowVideo(true));
      return () => w.cancelIdleCallback?.(handle);
    }

    const handle = window.setTimeout(() => setShowVideo(true), 300);
    return () => window.clearTimeout(handle);
  }, []);

  // Ensure page starts at the top (only if no hash)
  useEffect(() => {
    if (!window.location.hash) {
      // Use requestAnimationFrame to ensure this runs after layout
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Parallax effect for hero section
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  return (
    <div className={cn('min-h-screen bg-background flex flex-col', session && 'pb-20 md:pb-0')}>
      <SkipLinks />
      <HomeAdaptiveNav />
      <div ref={containerRef} className="flex-1">
        {/* Hero Section with Parallax */}
        <motion.section
          style={{ y: heroY }}
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          {/* Background Video with Overlay */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            {showVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="https://images.pexels.com/videos/33444758/free-video-33444758.jpg?auto=compress&cs=tinysrgb&w=1280"
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source
                  src="https://videos.pexels.com/video-files/33444758/14232220_3840_2160_30fps.mp4"
                  type="video/mp4"
                />
              </video>
            ) : (
              <div
                aria-hidden
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    'url(https://images.pexels.com/videos/33444758/free-video-33444758.jpg?auto=compress&cs=tinysrgb&w=1280)',
                }}
              />
            )}
            <div className="absolute inset-0 bg-background/40 backdrop-blur-xs" />
          </motion.div>

          <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-secondary/20" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 px-4">
            <motion.div className="space-y-4">
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold font-heading"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: splashOffset, ease: [0.165, 0.84, 0.44, 1] }}
              >
                <span className="gradient-text">{t('hero.title')}</span>
              </motion.h1>
              <motion.p
                className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: splashOffset + 0.08,
                  ease: [0.165, 0.84, 0.44, 1],
                }}
              >
                {t('hero.subtitle')}
              </motion.p>
            </motion.div>

            <motion.p
              className="text-base sm:text-lg text-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: splashOffset + 0.16,
                ease: [0.165, 0.84, 0.44, 1],
              }}
            >
              {t('hero.description')}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: splashOffset + 0.24,
                ease: [0.165, 0.84, 0.44, 1],
              }}
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

        {/* What is Douro Bats Padel Section */}
        <WhatIsSection t={t} />

        {/* How it Works Section */}
        <HowItWorksSection t={t} />

        {/* Connect with our App Section */}
        <ConnectAppSection t={t} />

        {/* Features Section with Scroll Animations */}
        <FeaturesSection t={t} />

        {/* Upcoming Events Section */}
        <section id="upcoming-events" className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <HomeUpcomingEvents />
          </div>
        </section>

        {/* CTA Section with Parallax */}
        {!session && <CTASection t={t} />}
      </div>
      <Footer />
    </div>
  );
}

// Features Section Component
function FeaturesSection({ t }: { t: (key: string) => string }) {
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
    <section className="py-12 sm:py-16 lg:py-24 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            ease: 'easeOut',
          },
        },
      }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card className="glass-card h-full group hover:shadow-xl transition-shadow duration-200 ease-out">
        <CardHeader>
          <div className={`p-3 rounded-2xl bg-linear-to-br ${feature.gradient} w-fit mb-4`}>
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

// What is Douro Bats Padel Section
function WhatIsSection({ t }: { t: (key: string) => string }) {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="relative h-64 sm:h-96 lg:h-[500px] rounded-3xl overflow-hidden order-2 lg:order-1"
          >
            <Image
              src="https://images.unsplash.com/photo-1613870930431-a09c7139eb33?w=800&q=80"
              alt="Padel community playing together"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/60 to-transparent" />
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="space-y-6 order-1 lg:order-2"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading">
              {t('whatIs.title')}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {t('whatIs.description')}
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t('whatIs.mission')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// How it Works Section
function HowItWorksSection({ t }: { t: (key: string) => string }) {
  const steps = [
    {
      number: t('howItWorks.step1.number'),
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      image: 'https://images.unsplash.com/photo-1651140753772-c12fdcd7077d?w=600&q=80',
    },
    {
      number: t('howItWorks.step2.number'),
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      image: 'https://images.unsplash.com/photo-1567220734778-52aeef6a84e8??w=600&q=80',
    },
    {
      number: t('howItWorks.step3.number'),
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      image: 'https://images.unsplash.com/photo-1728034261584-6adb22b7bb16??w=600&q=80',
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-tr from-primary/30 to-secondary/30" />
      <div className="container mx-auto px-4">
        <div className="relative z-10 space-y-8 sm:space-y-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-center"
          >
            {t('howItWorks.title')}
          </motion.h2>

          <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.3,
                      ease: 'easeOut',
                    },
                  },
                }}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Card className="glass-card h-full overflow-hidden group hover:shadow-xl transition-shadow duration-200 ease-out">
                  {/* Step Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {step.number}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent" />
                  </div>

                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Connect with App Section
function ConnectAppSection({ t }: { t: (key: string) => string }) {
  const { canPromptInstall, isInstalled, installApp, platform } = usePWAInstall();
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  const features = [
    t('connectApp.features.0'),
    t('connectApp.features.1'),
    t('connectApp.features.2'),
    t('connectApp.features.3'),
    t('connectApp.features.4'),
    t('connectApp.features.5'),
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image/Icon Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="relative h-64 sm:h-96 lg:h-[500px] flex items-center justify-center order-2 lg:order-1"
          >
            <div className="relative w-full h-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-secondary/20 rounded-3xl blur-xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48 sm:w-64 sm:h-64">
                  <Image
                    src="/icons/logo.png"
                    alt="Douro Bats Padel App"
                    fill
                    sizes="(max-width: 640px) 192px, 256px"
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="space-y-6 order-1 lg:order-2"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading">
              {t('connectApp.title')}
            </h2>

            <motion.ul
              className="space-y-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.04 } },
              }}
            >
              {features.map((feature, index) => (
                <motion.li key={index} variants={staggerItem} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </motion.li>
              ))}
            </motion.ul>

            <div className="pt-4">
              {isInstalled ? (
                <Button size="lg" variant="outline" disabled animate={false}>
                  <Check className="mr-2 h-4 w-4" />
                  {t('connectApp.installed')}
                </Button>
              ) : canPromptInstall ? (
                <Button size="lg" onClick={installApp}>
                  <Smartphone className="mr-2 h-4 w-4" />
                  {t('connectApp.installButton')}
                </Button>
              ) : (
                <Button size="lg" variant="outline" onClick={() => setInstructionsOpen(true)}>
                  <Smartphone className="mr-2 h-4 w-4" />
                  {t('connectApp.downloadButton')}
                </Button>
              )}
            </div>
            <PWAInstallInstructions
              open={instructionsOpen}
              onOpenChange={setInstructionsOpen}
              platform={platform}
            />
          </motion.div>
        </div>
      </div>
    </section>
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
    <section ref={sectionRef} className="py-12 overflow-hidden sm:py-16 lg:py-24 relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          style={{ y }}
          className="absolute inset-x-0 -inset-y-10 bg-linear-to-r from-primary/10 via-secondary/10 to-primary/10 pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Card className="glass-card border-2 border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-secondary/5" />
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
      </div>
    </section>
  );
}
