/**
 * Example component demonstrating native mobile improvements
 *
 * This file shows how to use:
 * - Haptic feedback
 * - Safe area insets
 * - Touch targets
 * - Native-style components
 */

'use client';

import { useState } from 'react';
import { useHaptic } from '@/hooks/use-haptic';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

export function NativeMobileExample() {
  const haptic = useHaptic();
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with safe area */}
      <header className="safe-top bg-primary text-primary-foreground p-4">
        <h1 className="text-2xl font-bold">Native Mobile Demo</h1>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 space-y-6">
        {/* Haptic Feedback Examples */}
        <section className="card-native p-6 space-y-4">
          <h2 className="text-xl font-semibold">Haptic Feedback</h2>

          <div className="grid grid-cols-2 gap-3">
            <Button haptic animate onClick={() => haptic.light()} className="touch-target">
              Light
            </Button>

            <Button haptic animate onClick={() => haptic.medium()} className="touch-target">
              Medium
            </Button>

            <Button haptic animate onClick={() => haptic.heavy()} className="touch-target">
              Heavy
            </Button>

            <Button
              haptic
              animate
              variant="secondary"
              onClick={() => haptic.success()}
              className="touch-target"
            >
              Success
            </Button>

            <Button
              haptic
              animate
              variant="outline"
              onClick={() => haptic.warning()}
              className="touch-target"
            >
              Warning
            </Button>

            <Button
              haptic
              animate
              variant="destructive"
              onClick={() => haptic.error()}
              className="touch-target"
            >
              Error
            </Button>
          </div>
        </section>

        {/* Native-Style List */}
        <section className="card-native overflow-hidden">
          <h2 className="text-xl font-semibold p-6 pb-4">Native List Items</h2>

          <div className="divide-y">
            {['Option 1', 'Option 2', 'Option 3'].map((item, index) => (
              <button
                key={item}
                onClick={() => {
                  haptic.selection();
                  setCount(index + 1);
                }}
                className="list-item-native w-full text-left"
              >
                <span className="flex-1">{item}</span>
                <span className="text-muted-foreground">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* Counter with Animation */}
        <section className="card-native p-6 space-y-4">
          <h2 className="text-xl font-semibold">Interactive Counter</h2>

          <motion.div
            key={count}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-bold text-center gradient-text py-8"
          >
            {count}
          </motion.div>

          <div className="flex gap-3">
            <Button
              haptic
              animate
              onClick={() => {
                haptic.medium();
                setCount((c) => Math.max(0, c - 1));
              }}
              className="flex-1 touch-target-lg"
            >
              Decrease
            </Button>

            <Button
              haptic
              animate
              variant="secondary"
              onClick={() => {
                haptic.medium();
                setCount((c) => c + 1);
              }}
              className="flex-1 touch-target-lg"
            >
              Increase
            </Button>
          </div>

          <Button
            haptic
            animate
            variant="outline"
            onClick={() => {
              haptic.success();
              setCount(0);
            }}
            className="w-full touch-target"
          >
            Reset
          </Button>
        </section>

        {/* Native Button Styles */}
        <section className="card-native p-6 space-y-4">
          <h2 className="text-xl font-semibold">Native Button Styles</h2>

          <button
            onClick={() => haptic.medium()}
            className="btn-native-ios bg-primary text-primary-foreground px-6 py-3 w-full touch-target"
          >
            iOS Style Button
          </button>

          <button
            onClick={() => haptic.medium()}
            className="btn-native-android bg-secondary text-secondary-foreground px-6 py-3 w-full touch-target"
          >
            Android Style Button
          </button>
        </section>
      </main>

      {/* Footer with safe area */}
      <footer className="safe-bottom bg-muted p-4 text-center text-sm text-muted-foreground">
        <p>Native Mobile Improvements Demo</p>
      </footer>
    </div>
  );
}
