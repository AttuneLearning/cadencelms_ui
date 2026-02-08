/**
 * NavLink Component Tests
 * Testing active state detection for ISS-004
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NavLink } from '../NavLink';
import { Home } from 'lucide-react';

describe('NavLink - ISS-004: Sidebar Link Highlighting', () => {
  describe('Learner Dashboard', () => {
    it('should highlight when at /learner/dashboard', () => {
      render(
        <MemoryRouter initialEntries={['/learner/dashboard']}>
          <NavLink label="Dashboard" path="/learner/dashboard" icon={Home} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /Dashboard/i });
      expect(link).toHaveClass('bg-accent');
      expect(link).toHaveClass('text-accent-foreground');
      expect(link).not.toHaveClass('text-muted-foreground');
    });

    it('should not highlight when at different learner route', () => {
      render(
        <MemoryRouter initialEntries={['/learner/profile']}>
          <NavLink label="Dashboard" path="/learner/dashboard" icon={Home} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /Dashboard/i });
      expect(link).not.toHaveClass('bg-accent');
      expect(link).toHaveClass('text-muted-foreground');
    });
  });

  describe('Staff Dashboard', () => {
    it('should highlight when at /staff/dashboard', () => {
      render(
        <MemoryRouter initialEntries={['/staff/dashboard']}>
          <NavLink label="Dashboard" path="/staff/dashboard" icon={Home} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /Dashboard/i });
      expect(link).toHaveClass('bg-accent');
      expect(link).toHaveClass('text-accent-foreground');
      expect(link).not.toHaveClass('text-muted-foreground');
    });

    it('should not highlight when at different staff route', () => {
      render(
        <MemoryRouter initialEntries={['/staff/classes']}>
          <NavLink label="Dashboard" path="/staff/dashboard" icon={Home} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /Dashboard/i });
      expect(link).not.toHaveClass('bg-accent');
      expect(link).toHaveClass('text-muted-foreground');
    });
  });

  describe('Admin Dashboard', () => {
    it('should highlight when at /admin/dashboard', () => {
      render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <NavLink label="Dashboard" path="/admin/dashboard" icon={Home} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /Dashboard/i });
      expect(link).toHaveClass('bg-accent');
      expect(link).toHaveClass('text-accent-foreground');
      expect(link).not.toHaveClass('text-muted-foreground');
    });

    it('should not highlight when at different admin route', () => {
      render(
        <MemoryRouter initialEntries={['/admin/users']}>
          <NavLink label="Dashboard" path="/admin/dashboard" icon={Home} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /Dashboard/i });
      expect(link).not.toHaveClass('bg-accent');
      expect(link).toHaveClass('text-muted-foreground');
    });
  });

  describe('Sub-route highlighting', () => {
    it('should highlight parent route when at sub-route', () => {
      render(
        <MemoryRouter initialEntries={['/staff/classes/class-123']}>
          <NavLink label="My Classes" path="/staff/classes" icon={Home} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /My Classes/i });
      expect(link).toHaveClass('bg-accent');
      expect(link).toHaveClass('text-accent-foreground');
    });

    it('should NOT highlight similar paths incorrectly', () => {
      // /staff/classes should NOT highlight when at /staff/class-management
      render(
        <MemoryRouter initialEntries={['/staff/class-management']}>
          <NavLink label="My Classes" path="/staff/classes" icon={Home} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /My Classes/i });
      expect(link).not.toHaveClass('bg-accent');
      expect(link).toHaveClass('text-muted-foreground');
    });
  });

  describe('Edge cases', () => {
    it('should not highlight dashboard when at root /admin', () => {
      render(
        <MemoryRouter initialEntries={['/admin']}>
          <NavLink label="Dashboard" path="/admin/dashboard" icon={Home} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /Dashboard/i });
      expect(link).not.toHaveClass('bg-accent');
      expect(link).toHaveClass('text-muted-foreground');
    });

    it('should handle root path correctly', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <NavLink label="Home" path="/" icon={Home} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /Home/i });
      expect(link).toHaveClass('bg-accent');
    });
  });
});
