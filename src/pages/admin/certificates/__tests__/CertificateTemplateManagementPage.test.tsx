/**
 * Integration Tests for Certificate Template Management Page
 * TDD approach: Tests written first, implementation follows
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { CertificateTemplateManagementPage } from '../CertificateTemplateManagementPage';

const mockTemplates = [
  {
    id: 'template-1',
    name: 'Default Certificate',
    description: 'Standard certificate template',
    isDefault: true,
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-08').toISOString(),
  },
  {
    id: 'template-2',
    name: 'Honor Roll Certificate',
    description: 'Certificate for honor roll students',
    isDefault: false,
    isActive: true,
    createdAt: new Date('2024-01-02').toISOString(),
    updatedAt: new Date('2024-01-08').toISOString(),
  },
  {
    id: 'template-3',
    name: 'Completion Certificate',
    description: 'Certificate for course completion',
    isDefault: false,
    isActive: false,
    createdAt: new Date('2024-01-03').toISOString(),
    updatedAt: new Date('2024-01-08').toISOString(),
  },
];

const mockTemplateDetail = {
  id: 'template-1',
  name: 'Default Certificate',
  description: 'Standard certificate template',
  htmlTemplate: '<div>Certificate for {{learnerName}}</div>',
  isDefault: true,
  isActive: true,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-08').toISOString(),
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CertificateTemplateManagementPage', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title and description', async () => {
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Certificate Template Management')).toBeInTheDocument();
      expect(screen.getByText(/manage certificate templates/i)).toBeInTheDocument();
    });

    it('should render Create Template button', async () => {
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create template/i })
        ).toBeInTheDocument();
      });
    });

    it('should render data table when templates exist', async () => {
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner while fetching templates', () => {
      server.use(
        http.get(`${baseUrl}/certificate-templates`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({
            templates: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          });
        })
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/loading templates/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no templates exist', async () => {
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/no templates found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Template List Display', () => {
    it('should display list of templates', async () => {
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Default Certificate')).toBeInTheDocument();
        expect(screen.getByText('Honor Roll Certificate')).toBeInTheDocument();
        expect(screen.getByText('Completion Certificate')).toBeInTheDocument();
      });
    });

    it('should display template descriptions', async () => {
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Standard certificate template')).toBeInTheDocument();
        expect(screen.getByText('Certificate for honor roll students')).toBeInTheDocument();
      });
    });

    it('should display default badge for default template', async () => {
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const badges = screen.getAllByText('Default');
        // Should have at least one Default badge in the table
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it('should display active/inactive status badges', async () => {
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const activeBadges = screen.getAllByText('Active');
        const inactiveBadges = screen.getAllByText('Inactive');
        expect(activeBadges.length).toBe(2);
        expect(inactiveBadges.length).toBe(1);
      });
    });

    it('should display created date for each template', async () => {
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/jan 01, 2024/i)).toBeInTheDocument();
        expect(screen.getByText(/jan 02, 2024/i)).toBeInTheDocument();
      });
    });

    it('should display action menu for each template', async () => {
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
        expect(actionButtons.length).toBe(3);
      });
    });
  });

  describe('Create Template', () => {
    it('should open create modal when Create Template button is clicked', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create template/i });
        expect(createButton).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create template/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Create Certificate Template')).toBeInTheDocument();
      });
    });

    it('should display all form fields in create modal', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create template/i });
        expect(createButton).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create template/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/html template/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/set as default/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/active/i)).toBeInTheDocument();
      });
    });

    it('should display available template variables helper', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create template/i });
        expect(createButton).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create template/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/available variables/i)).toBeInTheDocument();
        expect(screen.getByText('{{learnerName}}')).toBeInTheDocument();
        expect(screen.getByText('{{courseName}}')).toBeInTheDocument();
        expect(screen.getByText('{{certificateId}}')).toBeInTheDocument();
      });
    });

    it('should successfully create a new template', async () => {
      const user = userEvent.setup();
      let templateCreated = false;
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          })
        ),
        http.post(`${baseUrl}/certificate-templates`, async ({ request }) => {
          const body = await request.json();
          templateCreated = true;
          return HttpResponse.json({
            id: 'new-template',
            ...(body as object),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        })
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create template/i });
        expect(createButton).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create template/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/template name/i), 'New Template');
      await user.type(screen.getByLabelText(/description/i), 'Test description');
      await user.type(
        screen.getByLabelText(/html template/i),
        '<div>Test template for {{learnerName}}</div>'
      );

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(templateCreated).toBe(true);
      });
    });

    it('should close modal after successful creation', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          })
        ),
        http.post(`${baseUrl}/certificate-templates`, async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({
            id: 'new-template',
            ...(body as object),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        })
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create template/i });
        expect(createButton).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create template/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/template name/i), 'New Template');
      await user.type(screen.getByLabelText(/description/i), 'Test description');
      await user.type(
        screen.getByLabelText(/html template/i),
        '<div>Test template</div>'
      );

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edit Template', () => {
    it('should open edit modal when Edit action is clicked', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        ),
        http.get(`${baseUrl}/certificate-templates/template-1`, () =>
          HttpResponse.json(mockTemplateDetail)
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Default Certificate')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/edit template/i)).toBeInTheDocument();
      });

      const editButton = screen.getByText(/edit template/i);
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Edit Certificate Template')).toBeInTheDocument();
      });
    });

    it('should pre-populate form with existing template data', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        ),
        http.get(`${baseUrl}/certificate-templates/template-1`, () =>
          HttpResponse.json(mockTemplateDetail)
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Default Certificate')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      const editButton = screen.getByText(/edit template/i);
      await user.click(editButton);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/template name/i) as HTMLInputElement;
        expect(nameInput.value).toBe('Default Certificate');
      });
    });

    it('should successfully update template', async () => {
      const user = userEvent.setup();
      let templateUpdated = false;
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        ),
        http.get(`${baseUrl}/certificate-templates/template-1`, () =>
          HttpResponse.json(mockTemplateDetail)
        ),
        http.patch(`${baseUrl}/certificate-templates/template-1`, async ({ request }) => {
          const body = await request.json();
          templateUpdated = true;
          return HttpResponse.json({
            ...mockTemplateDetail,
            ...(body as object),
            updatedAt: new Date().toISOString(),
          });
        })
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Default Certificate')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      const editButton = screen.getByText(/edit template/i);
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/template name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Certificate');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(templateUpdated).toBe(true);
      });
    });
  });

  describe('Delete Template', () => {
    it('should show confirmation dialog when Delete action is clicked', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Default Certificate')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/delete template/i)).toBeInTheDocument();
      });

      const deleteButton = screen.getByText(/delete template/i);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });

    it('should successfully delete template after confirmation', async () => {
      const user = userEvent.setup();
      let templateDeleted = false;
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        ),
        http.delete(`${baseUrl}/certificate-templates/template-1`, () => {
          templateDeleted = true;
          return HttpResponse.json({});
        })
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Default Certificate')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      const deleteButton = screen.getByText(/delete template/i);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /delete/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(templateDeleted).toBe(true);
      });
    });
  });

  describe('Set Default Template', () => {
    it('should show Set as Default option for non-default templates', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Honor Roll Certificate')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[1]); // Second template (non-default)

      await waitFor(() => {
        expect(screen.getByText(/set as default/i)).toBeInTheDocument();
      });
    });

    it('should successfully set template as default', async () => {
      const user = userEvent.setup();
      let defaultSet = false;
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        ),
        http.patch(`${baseUrl}/certificate-templates/template-2/set-default`, () => {
          defaultSet = true;
          return HttpResponse.json({
            ...mockTemplates[1],
            isDefault: true,
          });
        })
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Honor Roll Certificate')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[1]);

      const setDefaultButton = screen.getByText(/set as default/i);
      await user.click(setDefaultButton);

      await waitFor(() => {
        expect(defaultSet).toBe(true);
      });
    });
  });

  describe('Toggle Active Status', () => {
    it('should toggle template active status', async () => {
      const user = userEvent.setup();
      let statusToggled = false;
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        ),
        http.patch(`${baseUrl}/certificate-templates/template-3/toggle-active`, () => {
          statusToggled = true;
          return HttpResponse.json({
            ...mockTemplates[2],
            isActive: true,
          });
        })
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Completion Certificate')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[2]); // Third template (inactive)

      await waitFor(() => {
        expect(screen.getByText(/activate template/i)).toBeInTheDocument();
      });

      const activateButton = screen.getByText(/activate template/i);
      await user.click(activateButton);

      await waitFor(() => {
        expect(statusToggled).toBe(true);
      });
    });
  });

  describe('Preview Template', () => {
    it('should open preview modal when Preview action is clicked', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        ),
        http.get(`${baseUrl}/certificate-templates/template-1`, () =>
          HttpResponse.json(mockTemplateDetail)
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Default Certificate')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/preview template/i)).toBeInTheDocument();
      });

      const previewButton = screen.getByText(/preview template/i);
      await user.click(previewButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/template preview/i)).toBeInTheDocument();
      });
    });

    it('should render template with sample data in preview', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        ),
        http.get(`${baseUrl}/certificate-templates/template-1`, () =>
          HttpResponse.json(mockTemplateDetail)
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Default Certificate')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      const previewButton = screen.getByText(/preview template/i);
      await user.click(previewButton);

      await waitFor(() => {
        // Should render the template with sample data
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetching templates fails', async () => {
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({ message: 'Failed to fetch templates' }, { status: 500 })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error loading templates/i)).toBeInTheDocument();
      });
    });

    it('should keep modal open when template creation fails', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          })
        ),
        http.post(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({ message: 'Failed to create template' }, { status: 400 })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create template/i });
        expect(createButton).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create template/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/template name/i), 'New Template');
      await user.type(screen.getByLabelText(/description/i), 'Test description');
      await user.type(screen.getByLabelText(/html template/i), '<div>Test</div>');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      // Modal should still be open after error
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Create Certificate Template')).toBeInTheDocument();
      });
    });

    it('should keep modal open when template update fails', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        ),
        http.get(`${baseUrl}/certificate-templates/template-1`, () =>
          HttpResponse.json(mockTemplateDetail)
        ),
        http.patch(`${baseUrl}/certificate-templates/template-1`, () =>
          HttpResponse.json({ message: 'Failed to update template' }, { status: 400 })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Default Certificate')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      const editButton = screen.getByText(/edit template/i);
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/template name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Certificate');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      // Modal should still be open after error
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Edit Certificate Template')).toBeInTheDocument();
      });
    });

    it('should keep confirmation dialog open when template deletion fails', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        ),
        http.delete(`${baseUrl}/certificate-templates/template-1`, () =>
          HttpResponse.json({ message: 'Failed to delete template' }, { status: 400 })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Default Certificate')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      const deleteButton = screen.getByText(/delete template/i);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /delete/i });
      await user.click(confirmButton);

      // Confirmation dialog should still be visible after error
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter', () => {
    it('should filter templates by search term', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () =>
          HttpResponse.json({
            templates: mockTemplates,
            pagination: { page: 1, limit: 50, total: 3, totalPages: 1 },
          })
        )
      );

      render(<CertificateTemplateManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Default Certificate')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      await user.type(searchInput, 'Honor');

      // The table should filter results based on the search
      await waitFor(() => {
        expect(screen.getByText('Honor Roll Certificate')).toBeInTheDocument();
      });
    });
  });
});
