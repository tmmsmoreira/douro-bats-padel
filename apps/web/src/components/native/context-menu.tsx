'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export interface ContextMenuItem {
  /**
   * Unique identifier
   */
  id: string;
  /**
   * Label to display
   */
  label: string;
  /**
   * Optional icon
   */
  icon?: React.ReactNode;
  /**
   * Click handler
   */
  onClick: () => void;
  /**
   * Whether the item is destructive (red)
   */
  destructive?: boolean;
  /**
   * Whether the item is disabled
   */
  disabled?: boolean;
  /**
   * Optional divider after this item
   */
  divider?: boolean;
}

export interface ContextMenuProps {
  /**
   * Whether the menu is open
   */
  isOpen: boolean;
  /**
   * Callback when menu should close
   */
  onClose: () => void;
  /**
   * Menu items
   */
  items: ContextMenuItem[];
  /**
   * Position of the menu
   */
  position?: { x: number; y: number };
  /**
   * Title of the menu
   */
  title?: string;
  /**
   * Additional className
   */
  className?: string;
}

/**
 * Context Menu component
 * Works with useLongPress hook for contextual actions
 *
 * @example
 * ```tsx
 * const [menuOpen, setMenuOpen] = useState(false);
 * const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
 *
 * const { handlers } = useLongPress({
 *   onLongPress: (e) => {
 *     const touch = 'touches' in e ? e.touches[0] : e;
 *     setMenuPosition({ x: touch.clientX, y: touch.clientY });
 *     setMenuOpen(true);
 *   },
 * });
 *
 * <div {...handlers}>Long press me</div>
 *
 * <ContextMenu
 *   isOpen={menuOpen}
 *   onClose={() => setMenuOpen(false)}
 *   position={menuPosition}
 *   items={[
 *     { id: 'edit', label: 'Edit', icon: <EditIcon />, onClick: () => {} },
 *     { id: 'delete', label: 'Delete', destructive: true, onClick: () => {} },
 *   ]}
 * />
 * ```
 */
export function ContextMenu({
  isOpen,
  onClose,
  items,
  position,
  title,
  className,
}: ContextMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleItemClick = React.useCallback(
    (item: ContextMenuItem) => {
      if (item.disabled) return;

      item.onClick();
      onClose();
    },
    [onClose]
  );

  // Calculate menu position to keep it on screen
  const getMenuStyle = (): React.CSSProperties => {
    if (!position) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    return {
      top: position.y,
      left: position.x,
      transform: 'translate(-50%, -100%) translateY(-8px)',
    };
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-100"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            style={getMenuStyle()}
            className={cn(
              'fixed z-101',
              'min-w-[200px] max-w-[280px]',
              'bg-card rounded-2xl shadow-2xl',
              'border border-border',
              'overflow-hidden',
              className
            )}
            role="menu"
          >
            {/* Title */}
            {title && (
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              </div>
            )}

            {/* Menu Items */}
            <div className="py-2">
              {items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <button
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3',
                      'text-left text-sm font-medium',
                      'transition-colors touch-target no-tap-highlight',
                      'disabled:opacity-40 disabled:cursor-not-allowed',
                      item.destructive
                        ? 'text-destructive hover:bg-destructive/10 active:bg-destructive/20'
                        : 'text-foreground hover:bg-accent active:bg-accent/80',
                      !item.disabled && 'active:scale-[0.96]'
                    )}
                    role="menuitem"
                  >
                    {item.icon && <span className="shrink-0 [&_svg]:size-5">{item.icon}</span>}
                    <span className="flex-1">{item.label}</span>
                  </button>

                  {/* Divider */}
                  {item.divider && index < items.length - 1 && (
                    <div className="my-1 border-t border-border" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
