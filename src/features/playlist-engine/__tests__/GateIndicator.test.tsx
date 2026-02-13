import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GateIndicator } from '../ui/GateIndicator';

describe('GateIndicator', () => {
  it('renders pending state', () => {
    render(<GateIndicator status="pending" />);
    const icon = screen.getByLabelText('Gate: pending');
    expect(icon).toBeInTheDocument();
  });

  it('renders passed state', () => {
    render(<GateIndicator status="passed" />);
    const icon = screen.getByLabelText('Gate: passed');
    expect(icon).toBeInTheDocument();
  });

  it('renders failed state', () => {
    render(<GateIndicator status="failed" />);
    const icon = screen.getByLabelText('Gate: failed');
    expect(icon).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<GateIndicator status="pending" className="custom-class" />);
    const svg = container.querySelector('svg');
    expect(svg?.className.baseVal || svg?.getAttribute('class')).toContain('custom-class');
  });
});
