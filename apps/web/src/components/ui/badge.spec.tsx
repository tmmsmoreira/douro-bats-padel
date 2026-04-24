import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders children inside a <span> by default', () => {
    render(<Badge>Hello</Badge>);

    const badge = screen.getByText('Hello');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveAttribute('data-slot', 'badge');
  });

  it('exposes the selected variant via data-variant', () => {
    render(<Badge variant="destructive">Danger</Badge>);

    expect(screen.getByText('Danger')).toHaveAttribute('data-variant', 'destructive');
  });

  it('falls back to the default variant when none is specified', () => {
    render(<Badge>Default</Badge>);

    expect(screen.getByText('Default')).toHaveAttribute('data-variant', 'default');
  });

  it('appends custom className alongside the variant classes', () => {
    render(<Badge className="my-custom-class">Tagged</Badge>);

    expect(screen.getByText('Tagged')).toHaveClass('my-custom-class');
  });

  it('renders as a child element when asChild is true (composition pattern)', () => {
    render(
      <Badge asChild>
        <a href="https://example.com">Linked</a>
      </Badge>
    );

    const link = screen.getByRole('link', { name: 'Linked' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('data-slot', 'badge');
  });

  it('forwards arbitrary HTML attributes to the underlying element', () => {
    render(
      <Badge aria-label="status indicator" id="badge-1">
        X
      </Badge>
    );

    const badge = screen.getByLabelText('status indicator');
    expect(badge).toHaveAttribute('id', 'badge-1');
  });
});
