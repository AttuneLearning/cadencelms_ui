/**
 * PasswordField Component Tests
 * Phase 6: Password change functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordField } from '../PasswordField';

describe('PasswordField', () => {
  const defaultProps = {
    id: 'test-password',
    label: 'Password',
    value: '',
    onChange: vi.fn(),
  };

  it('should render password input with label', () => {
    render(<PasswordField {...defaultProps} />);

    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
  });

  it('should render as password type by default', () => {
    render(<PasswordField {...defaultProps} />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should toggle password visibility when show/hide button clicked', () => {
    render(<PasswordField {...defaultProps} value="test123" />);

    const input = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    // Initially hidden
    expect(input).toHaveAttribute('type', 'password');

    // Click to show
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

    // Click to hide again
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should call onChange when input value changes', () => {
    const onChange = vi.fn();
    render(<PasswordField {...defaultProps} onChange={onChange} />);

    const input = screen.getByLabelText('Password');
    fireEvent.change(input, { target: { value: 'newpassword' } });

    expect(onChange).toHaveBeenCalledWith('newpassword');
  });

  it('should call onBlur when input loses focus', () => {
    const onBlur = vi.fn();
    render(<PasswordField {...defaultProps} onBlur={onBlur} />);

    const input = screen.getByLabelText('Password');
    fireEvent.blur(input);

    expect(onBlur).toHaveBeenCalled();
  });

  it('should display error message when provided', () => {
    render(<PasswordField {...defaultProps} error="Password is required" />);

    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('should apply error styling when error is provided', () => {
    render(<PasswordField {...defaultProps} error="Password is required" />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveClass('border-red-500');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<PasswordField {...defaultProps} disabled={true} />);

    const input = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(input).toBeDisabled();
    expect(toggleButton).toBeDisabled();
  });

  it('should use custom placeholder when provided', () => {
    render(<PasswordField {...defaultProps} placeholder="Enter your secret" />);

    expect(screen.getByPlaceholderText('Enter your secret')).toBeInTheDocument();
  });

  describe('Password Strength Indicator', () => {
    it('should show strength indicator when showStrength is true', () => {
      render(<PasswordField {...defaultProps} value="Test123!" showStrength={true} />);

      expect(screen.getByText(/Strong/i)).toBeInTheDocument();
    });

    it('should not show strength indicator when showStrength is false', () => {
      render(<PasswordField {...defaultProps} value="Test123!" showStrength={false} />);

      expect(screen.queryByText(/Strong/i)).not.toBeInTheDocument();
    });

    it('should not show strength indicator when value is empty', () => {
      render(<PasswordField {...defaultProps} value="" showStrength={true} />);

      expect(screen.queryByText(/Strong/i)).not.toBeInTheDocument();
    });

    it('should display correct strength label for weak password', () => {
      render(<PasswordField {...defaultProps} value="abc" showStrength={true} />);

      expect(screen.getByText('Weak')).toBeInTheDocument();
    });

    it('should display correct strength label for fair password', () => {
      render(<PasswordField {...defaultProps} value="Abc123" showStrength={true} />);

      expect(screen.getByText('Fair')).toBeInTheDocument();
    });

    it('should display correct strength label for good password', () => {
      // Password with exactly 4 requirements: length, upper, lower, number (no special char)
      render(<PasswordField {...defaultProps} value="Abc12345" showStrength={true} />);

      expect(screen.getByText('Good')).toBeInTheDocument();
    });

    it('should display correct strength label for strong password', () => {
      render(<PasswordField {...defaultProps} value="Abc123!@#" showStrength={true} />);

      expect(screen.getByText('Strong')).toBeInTheDocument();
    });
  });

  describe('Password Requirements Checklist', () => {
    it('should show requirements checklist when showRequirements is true', () => {
      render(<PasswordField {...defaultProps} value="T" showRequirements={true} />);

      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
      expect(screen.getByText('One uppercase letter (A-Z)')).toBeInTheDocument();
      expect(screen.getByText('One lowercase letter (a-z)')).toBeInTheDocument();
      expect(screen.getByText('One number (0-9)')).toBeInTheDocument();
      expect(screen.getByText(/One special character/i)).toBeInTheDocument();
    });

    it('should not show requirements when showRequirements is false', () => {
      render(<PasswordField {...defaultProps} value="Test123!" showRequirements={false} />);

      expect(screen.queryByText('At least 8 characters')).not.toBeInTheDocument();
    });

    it('should not show requirements when value is empty', () => {
      render(<PasswordField {...defaultProps} value="" showRequirements={true} />);

      expect(screen.queryByText('At least 8 characters')).not.toBeInTheDocument();
    });

    it('should show green text for met requirements', () => {
      render(<PasswordField {...defaultProps} value="Test123!@#" showRequirements={true} />);

      // All requirements should be met for this strong password
      const minLengthText = screen.getByText('At least 8 characters');
      expect(minLengthText).toHaveClass('text-green-700');
    });

    it('should show gray text for unmet requirements', () => {
      render(<PasswordField {...defaultProps} value="abc" showRequirements={true} />);

      // Most requirements should be unmet for this weak password
      const uppercaseText = screen.getByText(/One uppercase letter/i);
      expect(uppercaseText).toHaveClass('text-gray-600');
    });
  });

  describe('Integration', () => {
    it('should work together: strength indicator + requirements', () => {
      render(
        <PasswordField
          {...defaultProps}
          value="Test123!@#"
          showStrength={true}
          showRequirements={true}
        />
      );

      // Should show both strength indicator and requirements
      expect(screen.getByText('Strong')).toBeInTheDocument();
      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    });

    it('should update strength in real-time as user types', () => {
      const { rerender } = render(
        <PasswordField {...defaultProps} value="" showStrength={true} />
      );

      // No strength initially
      expect(screen.queryByText(/Strong|Good|Fair|Weak/i)).not.toBeInTheDocument();

      // Weak password
      rerender(<PasswordField {...defaultProps} value="abc" showStrength={true} />);
      expect(screen.getByText('Weak')).toBeInTheDocument();

      // Strong password
      rerender(<PasswordField {...defaultProps} value="Test123!@#" showStrength={true} />);
      expect(screen.getByText('Strong')).toBeInTheDocument();
    });
  });
});
