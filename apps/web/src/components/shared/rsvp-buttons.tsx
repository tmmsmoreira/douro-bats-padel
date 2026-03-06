import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { EventWithRSVP } from '@padel/types';
import type { Session } from 'next-auth';
import { motion } from 'motion/react';

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
  const userStatus = event.userRSVP?.status;
  const isConfirmed = userStatus === 'CONFIRMED';
  const isWaitlisted = userStatus === 'WAITLISTED';
  const isFull = event.confirmedCount >= event.capacity;
  const canRegister =
    session &&
    new Date() >= new Date(event.rsvpOpensAt) &&
    new Date() <= new Date(event.rsvpClosesAt);

  return (
    <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
      {session ? (
        <>
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
        </>
      ) : (
        <Link href="/login" className="flex-1 sm:flex-none">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button className="w-full rounded-lg">{signInToRegisterText}</Button>
          </motion.div>
        </Link>
      )}
      {showViewDetails && (
        <Link href={`/events/${event.id}`} className="flex-1 sm:flex-none">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" className="w-full rounded-lg">
              {viewDetailsText}
            </Button>
          </motion.div>
        </Link>
      )}
      {showViewDraw && event.state === 'PUBLISHED' && (
        <Link href={`/events/${event.id}/draw`} className="flex-1 sm:flex-none">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" className="w-full rounded-lg">
              {viewDrawText}
            </Button>
          </motion.div>
        </Link>
      )}
    </div>
  );
}
