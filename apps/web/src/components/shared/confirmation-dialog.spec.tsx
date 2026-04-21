import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationDialog } from './confirmation-dialog';

describe('ConfirmationDialog', () => {
  const baseProps = {
    open: true,
    onOpenChange: jest.fn(),
    title: 'Delete event?',
    description: 'This cannot be undone.',
    onConfirm: jest.fn(),
  };

  beforeEach(() => {
    baseProps.onOpenChange.mockClear();
    baseProps.onConfirm.mockClear();
  });

  it('renders the title and description when open', () => {
    render(<ConfirmationDialog {...baseProps} />);

    expect(screen.getByText('Delete event?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('renders default Confirm / Cancel labels when none are provided', () => {
    render(<ConfirmationDialog {...baseProps} />);

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('uses custom confirm/cancel labels when provided', () => {
    render(<ConfirmationDialog {...baseProps} confirmText="Yes, delete" cancelText="Keep it" />);

    expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep it' })).toBeInTheDocument();
  });

  it('fires onConfirm when the confirm button is clicked', () => {
    render(<ConfirmationDialog {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows the loading label and disables both buttons while isLoading', () => {
    render(<ConfirmationDialog {...baseProps} isLoading confirmingText="Deleting…" />);

    expect(screen.getByText('Deleting…')).toBeInTheDocument();
    // Both Cancel and the (now "Deleting…") confirm button are disabled
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Deleting/ })).toBeDisabled();
  });

  it('does not render dialog content when open=false', () => {
    render(<ConfirmationDialog {...baseProps} open={false} />);

    expect(screen.queryByText('Delete event?')).not.toBeInTheDocument();
  });

  it('accepts a ReactNode description (not just a string)', () => {
    render(
      <ConfirmationDialog
        {...baseProps}
        description={<span data-testid="rich-desc">Rich description</span>}
      />
    );

    expect(screen.getByTestId('rich-desc')).toBeInTheDocument();
  });
});
