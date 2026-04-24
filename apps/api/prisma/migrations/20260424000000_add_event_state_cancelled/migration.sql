-- Extend EventState with CANCELLED so admins can mark events that did not
-- take place (e.g. past sessions with no draw) without deleting them. Keeps
-- RSVPs and history intact; terminal state, transitioned only by explicit
-- admin action to match the rest of the EventState state machine.
ALTER TYPE "EventState" ADD VALUE 'CANCELLED';
