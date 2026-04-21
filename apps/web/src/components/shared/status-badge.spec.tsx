import { render, screen } from '@testing-library/react';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it('renders the translated label for a known status', () => {
    render(<StatusBadge status="OPEN" />);

    // Our next-intl test shim echoes keys back, so the status label is "open"
    expect(screen.getByText('open')).toBeInTheDocument();
  });

  it('allows a custom label to override the translated one', () => {
    render(<StatusBadge status="OPEN" label="Custom Label" />);

    expect(screen.getByText('Custom Label')).toBeInTheDocument();
    // The translation key should NOT render when a custom label is set
    expect(screen.queryByText('open')).not.toBeInTheDocument();
  });

  it('renders nothing (and warns) for an unknown status', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const { container } = render(<StatusBadge status={'UNKNOWN_STATE' as any} />);

    expect(container).toBeEmptyDOMElement();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/No config found for status/));

    warnSpy.mockRestore();
  });

  it.each([
    'DRAFT',
    'OPEN',
    'FROZEN',
    'DRAWN',
    'PUBLISHED',
    'CONFIRMED',
    'WAITLISTED',
    'PARTICIPATED',
    'DECLINED',
    'CANCELLED',
    'ACTIVE',
    'INACTIVE',
    'INVITED',
    'PENDING',
    'ACCEPTED',
    'REVOKED',
    'EXPIRED',
  ])('renders for known status %s', (status) => {
    const { container } = render(<StatusBadge status={status as any} />);

    // Every known status should produce non-empty output
    expect(container).not.toBeEmptyDOMElement();
  });

  it('appends a custom className passed by the caller', () => {
    const { container } = render(<StatusBadge status="PUBLISHED" className="custom-class" />);

    const badge = container.querySelector('[class*="custom-class"]');
    expect(badge).toBeInTheDocument();
  });
});
