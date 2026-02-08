/**
 * Tests for MyClassesPage
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MyClassesPage } from '../MyClassesPage';

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <MyClassesPage />
    </MemoryRouter>
  );
}

describe('MyClassesPage', () => {
  describe('Rendering', () => {
    it('should render page title and description', () => {
      renderWithRouter();

      expect(screen.getByText('My Classes')).toBeInTheDocument();
      expect(
        screen.getByText('View your enrolled class schedules and sessions')
      ).toBeInTheDocument();
    });

    it('should render class cards with placeholder data', () => {
      renderWithRouter();

      expect(screen.getByText('Safety Fundamentals - Section A')).toBeInTheDocument();
      expect(screen.getByText('Compliance 101 - Section B')).toBeInTheDocument();
      expect(screen.getByText('Leadership Workshop')).toBeInTheDocument();
    });

    it('should display course codes and names', () => {
      renderWithRouter();

      expect(screen.getByText('SAF-101 - Safety Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('CMP-101 - Compliance Essentials')).toBeInTheDocument();
      expect(screen.getByText('LDR-200 - Leadership Development')).toBeInTheDocument();
    });

    it('should display instructors', () => {
      renderWithRouter();

      expect(screen.getByText('Instructor: Dr. Sarah Chen')).toBeInTheDocument();
      expect(screen.getByText('Instructor: Prof. James Wilson')).toBeInTheDocument();
      expect(screen.getByText('Instructor: Maria Rodriguez')).toBeInTheDocument();
    });

    it('should display schedules', () => {
      renderWithRouter();

      expect(screen.getByText('Mon, Wed 9:00 AM - 10:30 AM')).toBeInTheDocument();
      expect(screen.getByText('Tue, Thu 1:00 PM - 2:30 PM')).toBeInTheDocument();
      expect(screen.getByText('Fri 2:00 PM - 4:00 PM')).toBeInTheDocument();
    });

    it('should display locations', () => {
      renderWithRouter();

      expect(screen.getByText('Room 201, Building A')).toBeInTheDocument();
      expect(screen.getByText('Room 305, Building B')).toBeInTheDocument();
      expect(screen.getByText('Conference Room C')).toBeInTheDocument();
    });

    it('should display status badges', () => {
      renderWithRouter();

      // Two "active" badges and one "upcoming"
      const activeBadges = screen.getAllByText('active');
      expect(activeBadges).toHaveLength(2);
      expect(screen.getByText('upcoming')).toBeInTheDocument();
    });

    it('should display progress percentages', () => {
      renderWithRouter();

      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should display next session info', () => {
      renderWithRouter();

      // Each card should have a "Next session:" label
      const nextSessionLabels = screen.getAllByText('Next session:');
      expect(nextSessionLabels).toHaveLength(3);
    });

    it('should render View Class links', () => {
      renderWithRouter();

      const viewClassLinks = screen.getAllByRole('link', { name: 'View Class' });
      expect(viewClassLinks).toHaveLength(3);
      expect(viewClassLinks[0]).toHaveAttribute('href', '/learner/classes/cls-1');
      expect(viewClassLinks[1]).toHaveAttribute('href', '/learner/classes/cls-2');
      expect(viewClassLinks[2]).toHaveAttribute('href', '/learner/classes/cls-3');
    });
  });
});
