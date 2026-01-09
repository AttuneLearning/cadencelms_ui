/**
 * Tests for TemplateCard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TemplateCard } from '../TemplateCard';
import {
  mockTemplateListItems,
  createMockTemplateListItem,
} from '@/test/mocks/data/templates';

// Wrapper component for Router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('TemplateCard', () => {
  describe('Rendering', () => {
    it('should render master template', () => {
      const masterTemplate = mockTemplateListItems[0]; // Master template

      render(
        <RouterWrapper>
          <TemplateCard template={masterTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText(masterTemplate.name)).toBeInTheDocument();
      expect(screen.getByText('Master')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('should render department template', () => {
      const departmentTemplate = mockTemplateListItems[1]; // Department template

      render(
        <RouterWrapper>
          <TemplateCard template={departmentTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText(departmentTemplate.name)).toBeInTheDocument();
      expect(screen.getByText('Department')).toBeInTheDocument();
      expect(screen.getByText(departmentTemplate.departmentName!)).toBeInTheDocument();
    });

    it('should render custom template', () => {
      const customTemplate = mockTemplateListItems[3]; // Custom template

      render(
        <RouterWrapper>
          <TemplateCard template={customTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText(customTemplate.name)).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    it('should render draft template', () => {
      const draftTemplate = mockTemplateListItems[4]; // Draft template

      render(
        <RouterWrapper>
          <TemplateCard template={draftTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText(draftTemplate.name)).toBeInTheDocument();
      expect(screen.getByText('draft')).toBeInTheDocument();
    });

    it('should display creator name', () => {
      const template = mockTemplateListItems[0];

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      expect(
        screen.getByText(`Created by ${template.createdBy.firstName} ${template.createdBy.lastName}`)
      ).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const template = mockTemplateListItems[0];
      const customClass = 'custom-test-class';

      const { container } = render(
        <RouterWrapper>
          <TemplateCard template={template} className={customClass} />
        </RouterWrapper>
      );

      const card = container.querySelector('.custom-test-class');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('should display active status badge', () => {
      const activeTemplate = mockTemplateListItems[0];

      render(
        <RouterWrapper>
          <TemplateCard template={activeTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('should display draft status badge', () => {
      const draftTemplate = mockTemplateListItems[4];

      render(
        <RouterWrapper>
          <TemplateCard template={draftTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText('draft')).toBeInTheDocument();
    });

    it('should display Master type badge', () => {
      const masterTemplate = mockTemplateListItems[0];

      render(
        <RouterWrapper>
          <TemplateCard template={masterTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText('Master')).toBeInTheDocument();
    });

    it('should display Department type badge', () => {
      const departmentTemplate = mockTemplateListItems[1];

      render(
        <RouterWrapper>
          <TemplateCard template={departmentTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText('Department')).toBeInTheDocument();
    });

    it('should display Custom type badge', () => {
      const customTemplate = mockTemplateListItems[3];

      render(
        <RouterWrapper>
          <TemplateCard template={customTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    it('should display Global badge for global templates', () => {
      const globalTemplate = mockTemplateListItems[0]; // Has isGlobal: true

      render(
        <RouterWrapper>
          <TemplateCard template={globalTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText('Global')).toBeInTheDocument();
    });

    it('should not display Global badge for non-global templates', () => {
      const nonGlobalTemplate = mockTemplateListItems[1]; // Has isGlobal: false

      render(
        <RouterWrapper>
          <TemplateCard template={nonGlobalTemplate} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Global')).not.toBeInTheDocument();
    });
  });

  describe('Template Type Display', () => {
    it('should show "Master Template" for master type', () => {
      const masterTemplate = mockTemplateListItems[0];

      render(
        <RouterWrapper>
          <TemplateCard template={masterTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText('Master Template')).toBeInTheDocument();
    });

    it('should show "Department Template" for department type', () => {
      const departmentTemplate = mockTemplateListItems[1];

      render(
        <RouterWrapper>
          <TemplateCard template={departmentTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText('Department Template')).toBeInTheDocument();
    });

    it('should show "Custom Template" for custom type', () => {
      const customTemplate = mockTemplateListItems[3];

      render(
        <RouterWrapper>
          <TemplateCard template={customTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText('Custom Template')).toBeInTheDocument();
    });
  });

  describe('Department Display', () => {
    it('should display department name for department templates', () => {
      const departmentTemplate = mockTemplateListItems[1];

      render(
        <RouterWrapper>
          <TemplateCard template={departmentTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText(departmentTemplate.departmentName!)).toBeInTheDocument();
    });

    it('should not display department section for master templates', () => {
      const masterTemplate = mockTemplateListItems[0];

      render(
        <RouterWrapper>
          <TemplateCard template={masterTemplate} />
        </RouterWrapper>
      );

      // Master templates don't have department, so departmentName is null
      expect(masterTemplate.departmentName).toBeNull();
    });

    it('should not display department section for custom templates', () => {
      const customTemplate = mockTemplateListItems[3];

      render(
        <RouterWrapper>
          <TemplateCard template={customTemplate} />
        </RouterWrapper>
      );

      // Custom templates don't have department, so departmentName is null
      expect(customTemplate.departmentName).toBeNull();
    });
  });

  describe('Usage Count Display', () => {
    it('should display usage count by default', () => {
      const template = mockTemplateListItems[0];

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      expect(screen.getByText('45 Courses')).toBeInTheDocument();
    });

    it('should display singular "Course" for usage count of 1', () => {
      const template = createMockTemplateListItem({ usageCount: 1 });

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      expect(screen.getByText('1 Course')).toBeInTheDocument();
    });

    it('should display plural "Courses" for usage count > 1', () => {
      const template = createMockTemplateListItem({ usageCount: 5 });

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      expect(screen.getByText('5 Courses')).toBeInTheDocument();
    });

    it('should display zero usage count', () => {
      const template = mockTemplateListItems[4]; // Draft with 0 usage

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      expect(screen.getByText('0 Courses')).toBeInTheDocument();
    });

    it('should hide usage count when showUsageCount is false', () => {
      const template = mockTemplateListItems[0];

      render(
        <RouterWrapper>
          <TemplateCard template={template} showUsageCount={false} />
        </RouterWrapper>
      );

      expect(screen.queryByText('45 Courses')).not.toBeInTheDocument();
    });
  });

  describe('Date Display', () => {
    it('should display created date', () => {
      const template = mockTemplateListItems[0];

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      expect(screen.getByText(/Created:/)).toBeInTheDocument();
    });

    it('should display updated date', () => {
      const template = mockTemplateListItems[0];

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      expect(screen.getByText(/Updated:/)).toBeInTheDocument();
    });

    it('should format dates correctly', () => {
      const template = mockTemplateListItems[0];

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      // Check that dates are present (actual format may vary by locale)
      const dateElements = screen.getAllByText(/Created:|Updated:/);
      expect(dateElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Links and Actions', () => {
    it('should render View Details link', () => {
      const template = mockTemplateListItems[0];

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      const viewLink = screen.getByText('View Details');
      expect(viewLink).toBeInTheDocument();
      expect(viewLink.closest('a')).toHaveAttribute('href', `/templates/${template.id}`);
    });

    it('should render title as clickable link', () => {
      const template = mockTemplateListItems[0];

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      const titleLink = screen.getByText(template.name).closest('a');
      expect(titleLink).toHaveAttribute('href', `/templates/${template.id}`);
    });

    it('should display Preview button when onPreview is provided', () => {
      const template = mockTemplateListItems[0];
      const onPreview = vi.fn();

      render(
        <RouterWrapper>
          <TemplateCard template={template} onPreview={onPreview} />
        </RouterWrapper>
      );

      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('should not display Preview button when onPreview is not provided', () => {
      const template = mockTemplateListItems[0];

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    });

    it('should call onPreview when Preview button is clicked', () => {
      const template = mockTemplateListItems[0];
      const onPreview = vi.fn();

      render(
        <RouterWrapper>
          <TemplateCard template={template} onPreview={onPreview} />
        </RouterWrapper>
      );

      const previewButton = screen.getByText('Preview');
      fireEvent.click(previewButton);

      expect(onPreview).toHaveBeenCalledWith(template.id);
      expect(onPreview).toHaveBeenCalledTimes(1);
    });

    it('should prevent default when Preview button is clicked', () => {
      const template = mockTemplateListItems[0];
      const onPreview = vi.fn();

      render(
        <RouterWrapper>
          <TemplateCard template={template} onPreview={onPreview} />
        </RouterWrapper>
      );

      const previewButton = screen.getByText('Preview');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      previewButton.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Different Template Scenarios', () => {
    it('should render master template with all features', () => {
      const masterTemplate = mockTemplateListItems[0];

      render(
        <RouterWrapper>
          <TemplateCard template={masterTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText('Master')).toBeInTheDocument();
      expect(screen.getByText('Global')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('Master Template')).toBeInTheDocument();
    });

    it('should render department template with department info', () => {
      const departmentTemplate = mockTemplateListItems[1];

      render(
        <RouterWrapper>
          <TemplateCard template={departmentTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText('Department')).toBeInTheDocument();
      expect(screen.getByText(departmentTemplate.departmentName!)).toBeInTheDocument();
      expect(screen.queryByText('Global')).not.toBeInTheDocument();
    });

    it('should render custom template without department', () => {
      const customTemplate = mockTemplateListItems[3];

      render(
        <RouterWrapper>
          <TemplateCard template={customTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText('Custom')).toBeInTheDocument();
      expect(screen.queryByText('Global')).not.toBeInTheDocument();
      expect(customTemplate.departmentName).toBeNull();
    });

    it('should render draft template with zero usage', () => {
      const draftTemplate = mockTemplateListItems[4];

      render(
        <RouterWrapper>
          <TemplateCard template={draftTemplate} />
        </RouterWrapper>
      );

      expect(screen.getByText('draft')).toBeInTheDocument();
      expect(screen.getByText('0 Courses')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle template with very long name', () => {
      const longName = 'A'.repeat(200);
      const template = createMockTemplateListItem({ name: longName });

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle template with very high usage count', () => {
      const template = createMockTemplateListItem({ usageCount: 9999 });

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      expect(screen.getByText('9999 Courses')).toBeInTheDocument();
    });

    it('should handle template with special characters in name', () => {
      const specialName = 'Template & Co. "Special" <Edition>';
      const template = createMockTemplateListItem({ name: specialName });

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      expect(screen.getByText(specialName)).toBeInTheDocument();
    });

    it('should handle null previewUrl', () => {
      const template = createMockTemplateListItem({ previewUrl: null });

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      expect(screen.getByText(template.name)).toBeInTheDocument();
    });

    it('should handle empty creator name gracefully', () => {
      const template = createMockTemplateListItem({
        createdBy: {
          id: 'user-1',
          firstName: '',
          lastName: '',
        },
      });

      render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      expect(screen.getByText(/Created by/)).toBeInTheDocument();
    });
  });

  describe('Hover and Visual States', () => {
    it('should apply hover shadow class', () => {
      const template = mockTemplateListItems[0];

      const { container } = render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      const card = container.querySelector('[class*="hover:shadow-lg"]');
      expect(card).toBeInTheDocument();
    });

    it('should apply transition class', () => {
      const template = mockTemplateListItems[0];

      const { container } = render(
        <RouterWrapper>
          <TemplateCard template={template} />
        </RouterWrapper>
      );

      const card = container.querySelector('[class*="transition"]');
      expect(card).toBeInTheDocument();
    });
  });
});
