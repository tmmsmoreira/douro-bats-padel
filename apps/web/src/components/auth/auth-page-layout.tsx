'use client';

import { ThemeToggleButton } from '@/components/shared/theme-toggle-button';
import { LanguageToggleButton } from '@/components/shared/language-toggle-button';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { useSplashOffset } from '@/hooks/use-is-standalone';

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  const locale = useLocale();
  const t = useTranslations('home.hero');
  const splashOffset = useSplashOffset();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between px-4 h-16 border-b border-border/50 bg-background shrink-0">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Image
            src="/icons/logo.png"
            alt="Douro Bats Padel"
            width={36}
            height={36}
            priority
            className="object-contain"
          />
          <span className="font-heading gradient-text text-lg font-bold">Douro Bats Padel</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <LanguageToggleButton />
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Desktop controls */}
        <div className="absolute top-4 right-4 z-20 hidden lg:flex items-center gap-2">
          <ThemeToggleButton />
          <LanguageToggleButton />
        </div>

        {/* Left side — video with branding (desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="https://images.pexels.com/videos/34449200/free-video-34449200.jpg?auto=compress&cs=tinysrgb&w=1280"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src="https://videos.pexels.com/video-files/34449200/14597533_2160_3840_60fps.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-background/20 backdrop-blur-xs" />
          <motion.div
            className="absolute inset-0 bg-linear-to-tr from-primary/20 to-secondary/20"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.3, 0.6, 0.8, 0.3],
              scale: [1, 1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <div className="relative z-10 flex flex-col justify-between w-full p-10">
            {/* Top — logo + name */}
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <Image
                src="/icons/logo.png"
                alt="Douro Bats Padel"
                width={40}
                height={40}
                priority
                className="object-contain"
              />
              <span className="font-heading gradient-text text-xl font-bold">Douro Bats Padel</span>
            </Link>

            {/* Bottom — tagline on a glass card for readability */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: splashOffset, ease: 'easeOut' }}
              className="bg-card/60 backdrop-blur-md rounded-xl p-6 border border-border/50"
            >
              <h1 className="text-3xl xl:text-4xl font-bold font-heading gradient-text">
                {t('title')}
              </h1>
              <p className="text-base text-muted-foreground mt-2">{t('subtitle')}</p>
            </motion.div>
          </div>
        </div>

        {/* Right side — form */}
        <div className="flex-1 flex flex-col items-center justify-center bg-background px-4 py-8">
          {/* Mobile branding text */}
          <motion.div
            className="lg:hidden text-center mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold font-heading gradient-text">
              {t('title')}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">{t('subtitle')}</p>
          </motion.div>

          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
