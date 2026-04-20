'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface TabBarItem {
  /**
   * Unique identifier for the tab
   */
  id: string;
  /**
   * Label to display
   */
  label: string;
  /**
   * Icon component
   */
  icon: React.ReactNode;
  /**
   * Optional badge count
   */
  badge?: number;
  /**
   * Whether the tab is disabled
   */
  disabled?: boolean;
  /**
   * Click handler
   */
  onClick?: () => void;
}

export interface TabBarProps {
  /**
   * Array of tab items
   */
  items: TabBarItem[];
  /**
   * Currently active tab ID
   */
  activeTab: string;
  /**
   * Callback when tab changes
   */
  onTabChange?: (tabId: string) => void;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Variant style
   * @default 'ios'
   */
  variant?: 'ios' | 'android';
}

/**
 * Tab Bar Navigation component
 * iOS/Android style bottom navigation
 *
 * @example
 * ```tsx
 * const tabs = [
 *   { id: 'home', label: 'Home', icon: <HomeIcon /> },
 *   { id: 'search', label: 'Search', icon: <SearchIcon /> },
 *   { id: 'profile', label: 'Profile', icon: <UserIcon />, badge: 3 },
 * ];
 *
 * <TabBar
 *   items={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 * ```
 */
export function TabBar({ items, activeTab, onTabChange, className, variant = 'ios' }: TabBarProps) {
  const handleTabClick = React.useCallback(
    (item: TabBarItem) => {
      if (item.disabled) return;

      item.onClick?.();
      onTabChange?.(item.id);
    },
    [onTabChange]
  );

  const isIOS = variant === 'ios';

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-background/95 backdrop-blur-lg border-t border-border',
        'safe-bottom',
        className
      )}
      role="tablist"
    >
      <div className="flex items-center justify-around px-2 py-1">
        {items.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              aria-disabled={item.disabled}
              disabled={item.disabled}
              onClick={() => handleTabClick(item)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1',
                'min-w-16 flex-1 py-2 px-3',
                'touch-target no-tap-highlight',
                'transition-colors duration-200',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                !item.disabled && 'active:scale-95'
              )}
            >
              {/* Icon */}
              <div className="relative">
                <motion.div
                  animate={{
                    scale: isActive ? (isIOS ? 1.1 : 1) : 1,
                    y: isActive && isIOS ? -2 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 17,
                  }}
                  className={cn(
                    'flex items-center justify-center',
                    '[&_svg]:size-6',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.icon}
                </motion.div>

                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1',
                      'min-w-[18px] h-[18px] px-1',
                      'flex items-center justify-center',
                      'bg-destructive text-destructive-foreground',
                      'text-[10px] font-bold rounded-full',
                      'border-2 border-background'
                    )}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[11px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>

              {/* Active indicator (Android style) */}
              {!isIOS && isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
