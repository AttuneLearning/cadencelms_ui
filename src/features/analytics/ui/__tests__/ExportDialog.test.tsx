/**
 * Tests for ExportDialog Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportDialog } from '../ExportDialog';

describe('ExportDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockMetrics = {
    totalStudents: 150,
    avgCompletion: 68.5,
    avgScore: 82.3,
    avgSessionDuration: 35,
  };

  it('should not render when closed', () => {
    render(
      <ExportDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        filters={{}}
        metrics={mockMetrics}
      />
    );

    expect(screen.queryByText(/export report/i)).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        filters={{}}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText(/export analytics report/i)).toBeInTheDocument();
  });

  it('should display export format options', () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        filters={{}}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText(/csv/i)).toBeInTheDocument();
    expect(screen.getByText(/pdf/i)).toBeInTheDocument();
  });

  it('should have export button', () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        filters={{}}
        metrics={mockMetrics}
      />
    );

    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('should call onOpenChange when canceled', () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        filters={{}}
        metrics={mockMetrics}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
