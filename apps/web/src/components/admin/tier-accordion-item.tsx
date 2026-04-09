'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Clock, ChevronDown } from 'lucide-react';
import type { TierTimeSlot } from '@/components/shared/draw';
import { cn } from '@/lib/utils';

interface TierCollapsibleItemProps {
  defaultOpen?: boolean;
  tierName: string;
  tierColor?: string;
  timeSlot?: TierTimeSlot;
  badges: string[];
  children: React.ReactNode;
}

export function TierCollapsibleItem({
  defaultOpen = false,
  tierName,
  tierColor,
  timeSlot,
  badges,
  children,
}: TierCollapsibleItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg glass-card">
      <CollapsibleTrigger className="flex w-full items-start justify-between gap-4 px-6 py-4 text-left outline-none transition-colors hover:bg-muted/50">
        <div className="flex flex-col gap-3 w-full pr-2">
          {/* Row 1: Tier Title + Time Slot */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {tierColor && <div className={`w-2 h-6 ${tierColor} rounded-full`} />}
              <h2 className="text-xl sm:text-2xl font-bold">{tierName}</h2>
            </div>
            {timeSlot && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="font-medium whitespace-nowrap">
                  {timeSlot.startsAt} - {timeSlot.endsAt}
                </span>
              </div>
            )}
          </div>

          {/* Row 2: Badges */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pl-5">
            {badges.map((label) => (
              <Badge key={label} variant="secondary">
                {label}
              </Badge>
            ))}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="text-sm">
        <div className="p-6">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
