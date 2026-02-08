import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LearnerSettingsPage } from '../SettingsPage';

// Mock theme store
const mockSetTheme = vi.fn();
vi.mock('@/features/theme', () => ({
  useThemeStore: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
  }),
}));

// Mock auth hook
vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    displayName: 'Test User',
    primaryEmail: 'test@example.com',
    isAuthenticated: true,
    isLoading: false,
    user: null,
    person: null,
    primaryPhone: null,
  }),
}));

describe('LearnerSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render the page header', () => {
    render(<LearnerSettingsPage />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText(/manage your notification/i)).toBeInTheDocument();
  });

  it('should render notification preferences section', () => {
    render(<LearnerSettingsPage />);

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Email notifications')).toBeInTheDocument();
    expect(screen.getByText('Course updates')).toBeInTheDocument();
    expect(screen.getByText('Grade and feedback alerts')).toBeInTheDocument();
    expect(screen.getByText('Deadline reminders')).toBeInTheDocument();
  });

  it('should render display preferences section', () => {
    render(<LearnerSettingsPage />);

    expect(screen.getByText('Display')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('should render privacy section', () => {
    render(<LearnerSettingsPage />);

    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Show my profile to other learners')).toBeInTheDocument();
    expect(screen.getByText('Show progress to instructors')).toBeInTheDocument();
  });

  it('should render account section with user info', () => {
    render(<LearnerSettingsPage />);

    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should render Edit Profile link', () => {
    render(<LearnerSettingsPage />);

    const editLink = screen.getByRole('link', { name: /edit profile/i });
    expect(editLink).toBeInTheDocument();
    expect(editLink).toHaveAttribute('href', '/learner/profile');
  });

  it('should toggle notification switches', () => {
    render(<LearnerSettingsPage />);

    const emailSwitch = screen.getByRole('switch', { name: /email notifications/i });
    expect(emailSwitch).toBeChecked();

    fireEvent.click(emailSwitch);
    expect(emailSwitch).not.toBeChecked();
  });

  it('should toggle privacy switches', () => {
    render(<LearnerSettingsPage />);

    const profileSwitch = screen.getByRole('switch', { name: /show my profile/i });
    expect(profileSwitch).toBeChecked();

    fireEvent.click(profileSwitch);
    expect(profileSwitch).not.toBeChecked();
  });

  it('should persist notification preferences to localStorage', () => {
    render(<LearnerSettingsPage />);

    const emailSwitch = screen.getByRole('switch', { name: /email notifications/i });
    fireEvent.click(emailSwitch);

    const stored = localStorage.getItem('cadence-notification-prefs');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.emailNotifications).toBe(false);
  });

  it('should persist privacy preferences to localStorage', () => {
    render(<LearnerSettingsPage />);

    const profileSwitch = screen.getByRole('switch', { name: /show my profile/i });
    fireEvent.click(profileSwitch);

    const stored = localStorage.getItem('cadence-privacy-prefs');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.showProfile).toBe(false);
  });

  it('should load persisted preferences from localStorage', () => {
    localStorage.setItem(
      'cadence-notification-prefs',
      JSON.stringify({ emailNotifications: false, courseUpdates: true, gradeFeedback: false, deadlineReminders: true })
    );

    render(<LearnerSettingsPage />);

    const emailSwitch = screen.getByRole('switch', { name: /email notifications/i });
    expect(emailSwitch).not.toBeChecked();

    const gradeSwitch = screen.getByRole('switch', { name: /grade and feedback/i });
    expect(gradeSwitch).not.toBeChecked();
  });
});
