/**
 * Tests for ExpiryBadge Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExpiryBadge, ExpiryWarning } from '../ExpiryBadge';
import * as expiryUtils from '../../lib/expiryUtils';

// Mock the expiry utils
vi.mock('../../lib/expiryUtils', async () => {
  const actual = await vi.importActual('../../lib/expiryUtils');
  return {
    ...actual,
    getExpiryStatus: vi.fn(),
  };
});

describe('ExpiryBadge', () => {
  const mockGetExpiryStatus = vi.mocked(expiryUtils.getExpiryStatus);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when status is no_expiry', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'no_expiry',
      daysRemaining: null,
      label: 'No expiry',
    });

    const { container } = render(<ExpiryBadge expiresAt={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render active status with green styling', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'active',
      daysRemaining: 45,
      label: 'Expires in 1 month',
    });

    const { container } = render(<ExpiryBadge expiresAt="2026-03-25T00:00:00Z" />);
    const badge = screen.getByText('Expires in 1 month');
    expect(badge).toBeInTheDocument();

    const badgeElement = container.querySelector('.bg-green-100');
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveClass('text-green-800');
  });

  it('should render expiring_soon status with amber styling', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'expiring_soon',
      daysRemaining: 5,
      label: 'Expires in 5 days',
    });

    const { container } = render(<ExpiryBadge expiresAt="2026-02-13T00:00:00Z" />);
    const badge = screen.getByText('Expires in 5 days');
    expect(badge).toBeInTheDocument();

    const badgeElement = container.querySelector('.bg-amber-100');
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveClass('text-amber-800');
  });

  it('should render expired status with red styling', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'expired',
      daysRemaining: -3,
      label: 'Expired 3 days ago',
    });

    const { container } = render(<ExpiryBadge expiresAt="2026-02-05T00:00:00Z" />);
    const badge = screen.getByText('Expired 3 days ago');
    expect(badge).toBeInTheDocument();

    const badgeElement = container.querySelector('.bg-red-100');
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveClass('text-red-800');
  });

  it('should render with icon by default', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'expiring_soon',
      daysRemaining: 5,
      label: 'Expires in 5 days',
    });

    const { container } = render(<ExpiryBadge expiresAt="2026-02-13T00:00:00Z" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should not render icon when showIcon is false', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'expiring_soon',
      daysRemaining: 5,
      label: 'Expires in 5 days',
    });

    const { container } = render(
      <ExpiryBadge expiresAt="2026-02-13T00:00:00Z" showIcon={false} />
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('should render compact variant with days remaining', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'expiring_soon',
      daysRemaining: 5,
      label: 'Expires in 5 days',
    });

    render(<ExpiryBadge expiresAt="2026-02-13T00:00:00Z" variant="compact" />);
    expect(screen.getByText('5d')).toBeInTheDocument();
    expect(screen.queryByText('Expires in 5 days')).not.toBeInTheDocument();
  });

  it('should render compact variant with absolute days for expired', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'expired',
      daysRemaining: -3,
      label: 'Expired 3 days ago',
    });

    render(<ExpiryBadge expiresAt="2026-02-05T00:00:00Z" variant="compact" />);
    expect(screen.getByText('3d')).toBeInTheDocument(); // Shows absolute value
  });

  it('should apply custom className', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'expiring_soon',
      daysRemaining: 5,
      label: 'Expires in 5 days',
    });

    const { container } = render(
      <ExpiryBadge expiresAt="2026-02-13T00:00:00Z" className="custom-class" />
    );
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
  });

  it('should handle undefined expiresAt', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'no_expiry',
      daysRemaining: null,
      label: 'No expiry',
    });

    const { container } = render(<ExpiryBadge expiresAt={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('ExpiryWarning', () => {
  const mockGetExpiryStatus = vi.mocked(expiryUtils.getExpiryStatus);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render for active status', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'active',
      daysRemaining: 45,
      label: 'Expires in 1 month',
    });

    const { container } = render(<ExpiryWarning expiresAt="2026-03-25T00:00:00Z" />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render for no_expiry status', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'no_expiry',
      daysRemaining: null,
      label: 'No expiry',
    });

    const { container } = render(<ExpiryWarning expiresAt={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render amber warning for expiring_soon status', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'expiring_soon',
      daysRemaining: 5,
      label: 'Expires in 5 days',
    });

    render(<ExpiryWarning expiresAt="2026-02-13T00:00:00Z" />);
    const warning = screen.getByText('Expires in 5 days');
    expect(warning).toBeInTheDocument();
    expect(warning.parentElement).toHaveClass('border-amber-200', 'bg-amber-50', 'text-amber-800');
  });

  it('should render red warning for expired status', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'expired',
      daysRemaining: -3,
      label: 'Expired 3 days ago',
    });

    render(<ExpiryWarning expiresAt="2026-02-05T00:00:00Z" />);
    const warning = screen.getByText('Expired 3 days ago');
    expect(warning).toBeInTheDocument();
    expect(warning.parentElement).toHaveClass('border-red-200', 'bg-red-50', 'text-red-800');
  });

  it('should render with icon', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'expiring_soon',
      daysRemaining: 5,
      label: 'Expires in 5 days',
    });

    const { container } = render(<ExpiryWarning expiresAt="2026-02-13T00:00:00Z" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    mockGetExpiryStatus.mockReturnValue({
      status: 'expiring_soon',
      daysRemaining: 5,
      label: 'Expires in 5 days',
    });

    const { container } = render(
      <ExpiryWarning expiresAt="2026-02-13T00:00:00Z" className="custom-warning" />
    );
    const warning = container.querySelector('.custom-warning');
    expect(warning).toBeInTheDocument();
  });
});
