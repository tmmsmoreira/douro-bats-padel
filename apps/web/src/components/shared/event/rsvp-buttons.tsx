'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';
import type { EventWithRSVP } from '@padel/types';
import type { Session } from 'next-auth';

interface RSVPButtonsProps {
  event: EventWithRSVP;
  session: Session | null;
  onRSVP: (eventId: string, status: 'IN' | 'OUT') => void;
  isPending: boolean;
  registerText?: string;
  registerToWaitlistText?: string;
  unregisterText?: string;
  signInToRegisterText?: string;
  viewDetailsText?: string;
  viewDrawText?: string;
  showViewDetails?: boolean;
  showViewDraw?: boolean;
}

export function RSVPButtons({
  event,
  session,
  onRSVP,
  isPending,
  registerText = 'Register',
  registerToWaitlistText = 'Register to Waitlist',
  unregisterText = 'Unregister',
  signInToRegisterText = 'Sign in to Register',
  viewDetailsText = 'View Details',
  viewDrawText = 'View Draw',
  showViewDetails = true,
  showViewDraw = true,
}: RSVPButtonsProps) {
  const router = useRouter();
  const [isNavigatingDetails, startDetailsTransition] = useTransition();
  const [isNavigatingDraw, startDrawTransition] = useTransition();
  const [clickedDetails, setClickedDetails] = useState(false);
  const [clickedDraw, setClickedDraw] = useState(false);

  const userStatus = event.userRSVP?.status;
  const isConfirmed = userStatus === 'CONFIRMED';
  const isWaitlisted = userStatus === 'WAITLISTED';
  const isFull = event.confirmedCount >= event.capacity;
  const canRegister =
    session &&
    new Date() >= new Date(event.rsvpOpensAt) &&
    new Date() <= new Date(event.rsvpClosesAt);

  // Don't show any buttons for unauthenticated users
  if (!session) {
    return null;
  }

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setClickedDetails(true);
    startDetailsTransition(() => {
      router.push(`/events/${event.id}`);
    });
  };

  const handleDrawClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setClickedDraw(true);
    startDrawTransition(() => {
      router.push(`/events/${event.id}/draw`);
    });
  };

  const showDetailsLoading = isNavigatingDetails || clickedDetails;
  const showDrawLoading = isNavigatingDraw || clickedDraw;

  return (
    <div className="flex gap-2 w-full sm:w-auto">
      {canRegister && !isConfirmed && !isWaitlisted && (
        <Button
          onClick={() => onRSVP(event.id, 'IN')}
          disabled={isPending}
          className="flex-1 sm:flex-none"
        >
          {isFull ? registerToWaitlistText : registerText}
        </Button>
      )}
      {(isConfirmed || isWaitlisted) && (
        <Button
          variant="outline"
          onClick={() => onRSVP(event.id, 'OUT')}
          disabled={isPending}
          className="flex-1 sm:flex-none"
        >
          {unregisterText}
        </Button>
      )}
      {showViewDetails && (
        <Button
          variant="outline"
          className="rounded-lg"
          onClick={handleDetailsClick}
          disabled={showDetailsLoading}
          animate
        >
          {showDetailsLoading && <Spinner className="mr-2" />}
          {viewDetailsText}
        </Button>
      )}
      {showViewDraw && event.state === 'PUBLISHED' && (
        <Button
          variant="outline"
          className="rounded-lg"
          onClick={handleDrawClick}
          disabled={showDrawLoading}
          animate
        >
          {showDrawLoading && <Spinner className="mr-2" />}
          {viewDrawText}
        </Button>
      )}
    </div>
  );
}
