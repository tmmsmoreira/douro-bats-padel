import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './pagination';

// Mock the mobile hook so these tests are deterministic and don't fight jsdom's
// lack of real matchMedia. Each test opts into mobile/desktop via the mock.
jest.mock('@/hooks/use-media-query', () => ({
  useIsMobile: jest.fn(),
}));

const { useIsMobile } = require('@/hooks/use-media-query') as { useIsMobile: jest.Mock };

describe('Pagination — desktop', () => {
  beforeEach(() => useIsMobile.mockReturnValue(false));

  it('returns null when there is only one page', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('disables Previous on the first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />);

    const prev = screen.getByRole('button', { name: /previous/i });
    expect(prev).toBeDisabled();
  });

  it('disables Next on the last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />);

    const next = screen.getByRole('button', { name: /next/i });
    expect(next).toBeDisabled();
  });

  it('calls onPageChange with the clicked page number', () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: '2' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('clicking Previous moves one page back, clamping to 1', () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('clicking Next moves one page forward, clamping to totalPages', () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('shows ellipsis for pages outside the current-page window on desktop', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={jest.fn()} />);

    // First page, last page, and neighbors are shown; gap pages collapse to ...
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
    // Pages far from current should not appear as buttons
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '9' })).not.toBeInTheDocument();
  });

  it('renders optional results text on desktop', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={jest.fn()}
        showResultsText="Showing 1–10 of 30"
      />
    );

    expect(screen.getByText('Showing 1–10 of 30')).toBeInTheDocument();
  });
});

describe('Pagination — mobile', () => {
  beforeEach(() => useIsMobile.mockReturnValue(true));

  it('collapses the page list to "current / total"', () => {
    render(<Pagination currentPage={2} totalPages={10} onPageChange={jest.fn()} />);

    expect(screen.getByText('2 / 10')).toBeInTheDocument();
    // No individual page-number buttons
    expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '10' })).not.toBeInTheDocument();
  });

  it('still shows Previous and Next controls with aria-labels', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={10}
        onPageChange={jest.fn()}
        previousLabel="Prev"
        nextLabel="Next"
      />
    );

    expect(screen.getByLabelText('Prev')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
  });
});
