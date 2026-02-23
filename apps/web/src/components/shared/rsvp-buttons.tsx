import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { EventWithRSVP } from '@padel/types';

interface RSVPButtonsProps {
  event: EventWithRSVP;
  session: any;
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
  const userStatus = event.userRSVP?.status;
  const isConfirmed = userStatus === 'CONFIRMED';
  const isWaitlisted = userStatus === 'WAITLISTED';
  const isFull = event.confirmedCount >= event.capacity;
  const canRegister =
    session &&
    new Date() >= new Date(event.rsvpOpensAt) &&
    new Date() <= new Date(event.rsvpClosesAt);

  return (
    <div className="flex flex-wrap gap-2">
      {session ? (
        <>
          {canRegister && !isConfirmed && !isWaitlisted && (
            <Button
              size="sm"
              onClick={() => onRSVP(event.id, 'IN')}
              disabled={isPending}
              className="flex-1 sm:flex-none"
            >
              {isFull ? registerToWaitlistText : registerText}
            </Button>
          )}
          {(isConfirmed || isWaitlisted) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRSVP(event.id, 'OUT')}
              disabled={isPending}
              className="flex-1 sm:flex-none"
            >
              {unregisterText}
            </Button>
          )}
        </>
      ) : (
        <Link href="/login" className="flex-1 sm:flex-none">
          <Button size="sm" className="w-full">
            {signInToRegisterText}
          </Button>
        </Link>
      )}
      {showViewDetails && (
        <Link href={`/events/${event.id}`} className="flex-1 sm:flex-none">
          <Button size="sm" variant="outline" className="w-full">
            {viewDetailsText}
          </Button>
        </Link>
      )}
      {showViewDraw && event.state === 'PUBLISHED' && (
        <Link href={`/events/${event.id}/draw`} className="flex-1 sm:flex-none">
          <Button size="sm" variant="outline" className="w-full">
            {viewDrawText}
          </Button>
        </Link>
      )}
    </div>
  );
}
