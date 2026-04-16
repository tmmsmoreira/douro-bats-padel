'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { LOGO_BLUR_DATA_URL } from '@/lib/image-blur';
import { ThemeToggleButton } from '@/components/shared/theme-toggle-button';
import { LanguageToggleButton } from '@/components/shared/language-toggle-button';

/**
 * Wait until the app loading screen has fully exited before starting.
 * Uses a MutationObserver to detect when the loading screen's z-9999 overlay
 * is removed from the DOM by AnimatePresence.
 */
function useLoadingScreenDone() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // If the loading screen is already gone, start immediately
    const overlay = document.querySelector('[class*="z-9999"]');
    if (!overlay) {
      setReady(true);
      return;
    }

    // Watch for removal
    const observer = new MutationObserver(() => {
      if (!document.querySelector('[class*="z-9999"]')) {
        setReady(true);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return ready;
}

function CrackedGlassAnimation({ animate }: { animate: boolean }) {
  const idle = { x: 0, y: 0 };
  const shake = { x: [0, 3, -3, 2, -1, 0], y: [0, -2, 2, -1, 1, 0] };

  // Impact point — ball center lands here, cracks radiate from here
  const cx = 160;
  const cy = 105;
  const ballR = 18;

  return (
    <div className="relative w-64 sm:w-80 mx-auto" style={{ aspectRatio: '320/300' }}>
      <svg viewBox="0 0 320 300" className="w-full h-full overflow-visible" fill="none">
        <defs>
          <radialGradient id="ball-shine" cx="30%" cy="25%" r="40%">
            <stop offset="0%" stopColor="white" stopOpacity="0.45" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glass panel — shakes on impact */}
        <motion.g
          initial={idle}
          animate={animate ? shake : idle}
          transition={{ duration: 0.4, delay: 3.0, ease: 'easeOut' }}
        >
          <rect
            x="40"
            y="10"
            width="240"
            height="190"
            rx="8"
            className="stroke-border fill-card/50"
            strokeWidth="2"
          />
          <line
            x1="60"
            y1="22"
            x2="90"
            y2="22"
            className="stroke-border"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
          <line
            x1="60"
            y1="30"
            x2="72"
            y2="30"
            className="stroke-border"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Cracks from impact center */}
          {[
            `M${cx},${cy} L120,45`,
            `M${cx},${cy} L95,75`,
            `M${cx},${cy} L80,115`,
            `M${cx},${cy} L105,155`,
            `M${cx},${cy} L145,180`,
            `M${cx},${cy} L200,45`,
            `M${cx},${cy} L225,70`,
            `M${cx},${cy} L240,110`,
            `M${cx},${cy} L215,160`,
            `M${cx},${cy} L180,185`,
            `M${cx},${cy} L140,50`,
            `M${cx},${cy} L200,180`,
          ].map((d, i) => (
            <motion.path
              key={i}
              d={d}
              className="stroke-muted-foreground/40"
              strokeWidth="1.2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={animate ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.3, delay: 3.05 + i * 0.03, ease: 'easeOut' }}
            />
          ))}

          {/* Secondary branches */}
          {[
            'M120,45 L105,25',
            'M120,45 L138,22',
            'M95,75 L65,60',
            'M80,115 L50,125',
            'M105,155 L85,178',
            'M200,45 L218,22',
            'M225,70 L255,55',
            'M240,110 L268,100',
            'M215,160 L242,175',
            'M140,50 L130,20',
            'M200,180 L218,198',
            'M180,185 L172,200',
          ].map((d, i) => (
            <motion.path
              key={`b-${i}`}
              d={d}
              className="stroke-muted-foreground/25"
              strokeWidth="0.8"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={animate ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.2, delay: 3.4 + i * 0.03, ease: 'easeOut' }}
            />
          ))}
        </motion.g>

        {/* Impact flash — same SVG coordinates */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={30}
          className="fill-primary/20"
          initial={{ r: 0, opacity: 0 }}
          animate={animate ? { r: [0, 35, 0], opacity: [0, 0.5, 0] } : { r: 0, opacity: 0 }}
          transition={{ duration: 0.4, delay: 3.0, ease: 'easeOut' }}
        />

        {/* Falling shards — inside SVG */}
        {[
          { x: cx - 15, y: cy + 5, delay: 3.2, rotate: 25, w: 6, h: 10 },
          { x: cx + 10, y: cy - 5, delay: 3.3, rotate: -15, w: 5, h: 8 },
          { x: cx - 5, y: cy + 12, delay: 3.35, rotate: 40, w: 5, h: 7 },
          { x: cx + 18, y: cy + 3, delay: 3.25, rotate: -30, w: 4, h: 7 },
          { x: cx - 22, y: cy + 2, delay: 3.4, rotate: 20, w: 4, h: 5 },
        ].map((s, i) => (
          <motion.rect
            key={`shard-${i}`}
            x={s.x}
            y={s.y}
            width={s.w}
            height={s.h}
            rx="1"
            className="fill-border/60"
            initial={{ y: s.y, opacity: 0, rotate: 0 }}
            animate={
              animate
                ? { y: [s.y, s.y + 60 + i * 12], opacity: [0, 0.8, 0], rotate: [0, s.rotate + 90] }
                : { y: s.y, opacity: 0, rotate: 0 }
            }
            transition={{ duration: 1.2, delay: s.delay, ease: 'easeIn' }}
          />
        ))}

        {/* Ball + shadow — bounces in place below glass, then smashes into it */}
        {(() => {
          // Ball bounces centered horizontally, ground at y=290
          const groundY = 290;
          const ballBounceX = cx;
          // Timing: 2 bounces (0-3s) then fly to glass (3-3.5s)
          const totalDur = 3.5;
          // Bounce keyframe times (normalized 0-1)
          // bounce1: 0→0.21→0.43, bounce2: 0.43→0.57→0.71, launch: 0.71→0.86→1.0
          const times = [0, 0.21, 0.43, 0.57, 0.71, 0.86, 1.0];
          const yValues = [
            groundY - ballR, // start at ground
            groundY - ballR - 120, // bounce1 peak
            groundY - ballR, // bounce1 land
            groundY - ballR - 70, // bounce2 peak
            groundY - ballR, // bounce2 land
            cy, // fly to glass
            cy, // stay at glass
          ];

          return (
            <>
              {/* Shadow on ground */}
              <motion.ellipse
                cx={ballBounceX}
                cy={groundY + 5}
                rx={16}
                ry={5}
                className="fill-foreground/10"
                initial={{ opacity: 0 }}
                animate={
                  animate
                    ? {
                        opacity: [0.12, 0.04, 0.12, 0.06, 0.12, 0, 0],
                        rx: [16, 10, 16, 12, 16, 0, 0],
                      }
                    : { opacity: 0 }
                }
                transition={{ duration: totalDur, times, ease: 'linear' }}
              />

              {/* Ball position — translates to bounce Y */}
              <motion.g
                initial={{ y: 0 }}
                animate={
                  animate
                    ? {
                        y: yValues.map((v) => v - (groundY - ballR)),
                      }
                    : { y: 0 }
                }
                transition={{
                  duration: totalDur,
                  times,
                  ease: ['easeOut', 'easeIn', 'easeOut', 'easeIn', 'easeOut', 'linear'],
                }}
              >
                {/* Position at ball center, then rotate — rotation happens around (0,0) which IS the ball center */}
                <g transform={`translate(${ballBounceX}, ${groundY - ballR})`}>
                  <motion.g
                    initial={{ rotate: 0 }}
                    animate={
                      animate ? { rotate: [0, 180, 360, 480, 600, 720, 720] } : { rotate: 0 }
                    }
                    transition={{ duration: totalDur, times, ease: 'linear' }}
                  >
                    {/* Ball body */}
                    <circle cx={0} cy={0} r={ballR} fill="currentColor" className="text-primary" />
                    {/* Seam curves clipped to ball */}
                    <clipPath id="ball-clip">
                      <circle cx={0} cy={0} r={ballR} />
                    </clipPath>
                    <g clipPath="url(#ball-clip)">
                      <path
                        d={`M-4,${-ballR - 3} C-15,-6 -15,6 -4,${ballR + 3}`}
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                        opacity="0.55"
                        strokeLinecap="round"
                      />
                      <path
                        d={`M4,${-ballR - 3} C15,-6 15,6 4,${ballR + 3}`}
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                        opacity="0.55"
                        strokeLinecap="round"
                      />
                    </g>
                    {/* Highlight shine */}
                    <circle cx={0} cy={0} r={ballR} fill="url(#ball-shine)" />
                  </motion.g>
                </g>
              </motion.g>
            </>
          );
        })()}
      </svg>
    </div>
  );
}

export default function NotFound() {
  const t = useTranslations('errors');
  const ready = useLoadingScreenDone();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-background" />
        <motion.div
          className="absolute inset-0 bg-linear-to-tr from-primary/10 to-secondary/10"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.3, 0.5, 0.7, 0.3],
            scale: [1, 1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 h-16 shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/icons/logo.png"
            alt="Douro Bats Padel"
            width={36}
            height={36}
            priority
            placeholder="blur"
            blurDataURL={LOGO_BLUR_DATA_URL}
            className="object-contain"
          />
          <span className="font-heading gradient-text text-lg font-bold">Douro Bats Padel</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <LanguageToggleButton />
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <CrackedGlassAnimation animate={ready} />

          <h1 className="-mt-16 sm:-mt-20 text-7xl sm:text-8xl font-bold font-heading gradient-text">
            404
          </h1>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading">{t('notFound')}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">{t('notFoundDescription')}</p>
          </div>
          <Link href="/">
            <Button size="lg" className="mt-4">
              {t('goHome')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
