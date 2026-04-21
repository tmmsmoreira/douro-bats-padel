import { render, screen } from '@testing-library/react';
import { EventStats } from './event-stats';
import type { EventWithRSVP } from '@padel/types';

const buildEvent = (overrides: Partial<EventWithRSVP> = {}): EventWithRSVP =>
  ({
    id: 'e1',
    title: 'Night Session',
    date: new Date('2026-06-10'),
    startsAt: new Date('2026-06-10T20:00:00Z'),
    endsAt: new Date('2026-06-10T22:00:00Z'),
    capacity: 16,
    confirmedCount: 8,
    waitlistCount: 0,
    state: 'OPEN',
    rsvpOpensAt: new Date(),
    rsvpClosesAt: new Date(),
    ...overrides,
  }) as unknown as EventWithRSVP;

describe('EventStats', () => {
  it('renders "confirmed / capacity" text', () => {
    render(<EventStats event={buildEvent({ confirmedCount: 8, capacity: 16 })} />);

    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText(/\/ 16 confirmed/)).toBeInTheDocument();
  });

  it('hides the waitlist line when waitlistCount is 0', () => {
    render(<EventStats event={buildEvent({ waitlistCount: 0 })} />);

    expect(screen.queryByText(/waitlisted/)).not.toBeInTheDocument();
  });

  it('shows the waitlist line when waitlistCount > 0', () => {
    render(<EventStats event={buildEvent({ waitlistCount: 3 })} />);

    expect(screen.getByText(/3 waitlisted/)).toBeInTheDocument();
  });

  it('accepts custom labels for confirmed and waitlisted', () => {
    render(
      <EventStats
        event={buildEvent({ waitlistCount: 2 })}
        confirmedLabel="Confirmados"
        waitlistedLabel="em espera"
      />
    );

    expect(screen.getByText(/\/ 16 Confirmados/)).toBeInTheDocument();
    expect(screen.getByText(/2 em espera/)).toBeInTheDocument();
  });

  it('omits the progress bar when showProgressBar=false', () => {
    const { container } = render(<EventStats event={buildEvent()} showProgressBar={false} />);

    // The progress bar is the element containing gradient-primary
    expect(container.querySelector('.gradient-primary')).not.toBeInTheDocument();
  });

  it('renders the progress bar by default', () => {
    const { container } = render(<EventStats event={buildEvent()} />);

    expect(container.querySelector('.gradient-primary')).toBeInTheDocument();
  });
});
