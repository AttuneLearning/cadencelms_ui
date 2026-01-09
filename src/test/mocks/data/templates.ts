/**
 * Mock template data for testing
 */

import type {
  Template,
  TemplateListItem,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  DuplicateTemplatePayload,
  DuplicateTemplateResponse,
  DeleteTemplateResponse,
  TemplatePreviewData,
  UserRef,
  DepartmentRef,
  CourseRef,
} from '@/entities/template/model/types';

// =====================
// MOCK REFERENCE DATA
// =====================

export const mockCreators: UserRef[] = [
  {
    id: 'user-1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@university.edu',
  },
  {
    id: 'user-2',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@university.edu',
  },
  {
    id: 'user-3',
    firstName: 'Charlie',
    lastName: 'Brown',
    email: 'charlie.brown@university.edu',
  },
];

export const mockDepartments: DepartmentRef[] = [
  { id: 'dept-1', name: 'Computer Science' },
  { id: 'dept-2', name: 'Mathematics' },
  { id: 'dept-3', name: 'Business Administration' },
  { id: 'dept-4', name: 'Engineering' },
];

export const mockCourses: CourseRef[] = [
  { id: 'course-1', title: 'Introduction to Web Development', code: 'WEB101' },
  { id: 'course-2', title: 'Advanced Database Design', code: 'DB301' },
  { id: 'course-3', title: 'Data Structures and Algorithms', code: 'CS201' },
  { id: 'course-4', title: 'Business Analytics', code: 'BUS201' },
];

// =====================
// MOCK CSS AND HTML CONTENT
// =====================

export const mockMasterCSS = `
body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

.course-header {
  background-color: #003366;
  color: white;
  padding: 2rem;
  text-align: center;
}

.course-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.course-footer {
  text-align: center;
  padding: 1rem;
  color: #666;
  font-size: 0.875rem;
}
`;

export const mockMasterHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{courseCode}} - {{courseTitle}}</title>
</head>
<body>
    <header class="course-header">
        <h1>{{courseTitle}}</h1>
        <p class="course-code">{{courseCode}}</p>
        <p class="instructor">Instructor: {{instructorName}}</p>
        <p class="department">{{departmentName}}</p>
    </header>

    <main class="course-content">
        {{content}}
    </main>

    <footer class="course-footer">
        <p>&copy; 2026 University. All rights reserved.</p>
    </footer>
</body>
</html>
`;

export const mockDepartmentCSS = `
.department-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
}

.course-section {
  margin: 1.5rem 0;
  padding: 1.5rem;
  border-left: 4px solid #667eea;
  background-color: #f8f9fa;
}

.instructor-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}
`;

export const mockDepartmentHTML = `
<div class="department-header">
  <h1>{{courseTitle}}</h1>
  <span class="badge">{{departmentName}}</span>
</div>

<div class="course-section">
  <h2>Course Information</h2>
  <p><strong>Code:</strong> {{courseCode}}</p>
  <div class="instructor-info">
    <strong>Instructor:</strong> {{instructorName}}
  </div>
</div>

<div class="course-section">
  {{content}}
</div>
`;

export const mockCustomCSS = `
.custom-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.title-section {
  border-bottom: 2px solid #333;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}
`;

export const mockCustomHTML = `
<div class="custom-wrapper">
  <div class="title-section">
    <h1>{{courseTitle}}</h1>
    <p>{{courseCode}}</p>
  </div>
  <div class="content-section">
    {{content}}
  </div>
</div>
`;

// =====================
// MOCK TEMPLATE LIST ITEMS
// =====================

export const mockTemplateListItems: TemplateListItem[] = [
  {
    id: 'template-1',
    name: 'University Master Template',
    type: 'master',
    status: 'active',
    department: null,
    departmentName: null,
    isGlobal: true,
    createdBy: mockCreators[0],
    usageCount: 45,
    previewUrl: 'https://cdn.example.com/previews/template-1.html',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-11-01T14:30:00Z',
  },
  {
    id: 'template-2',
    name: 'Computer Science Department Template',
    type: 'department',
    status: 'active',
    department: 'dept-1',
    departmentName: 'Computer Science',
    isGlobal: false,
    createdBy: mockCreators[1],
    usageCount: 23,
    previewUrl: 'https://cdn.example.com/previews/template-2.html',
    createdAt: '2025-03-10T09:00:00Z',
    updatedAt: '2025-10-15T16:20:00Z',
  },
  {
    id: 'template-3',
    name: 'Mathematics Department Template',
    type: 'department',
    status: 'active',
    department: 'dept-2',
    departmentName: 'Mathematics',
    isGlobal: false,
    createdBy: mockCreators[0],
    usageCount: 18,
    previewUrl: 'https://cdn.example.com/previews/template-3.html',
    createdAt: '2025-04-05T11:30:00Z',
    updatedAt: '2025-09-20T10:15:00Z',
  },
  {
    id: 'template-4',
    name: 'My Custom Course Template',
    type: 'custom',
    status: 'active',
    department: null,
    departmentName: null,
    isGlobal: false,
    createdBy: mockCreators[2],
    usageCount: 5,
    previewUrl: 'https://cdn.example.com/previews/template-4.html',
    createdAt: '2025-06-12T14:00:00Z',
    updatedAt: '2025-12-01T09:45:00Z',
  },
  {
    id: 'template-5',
    name: 'Draft Custom Template',
    type: 'custom',
    status: 'draft',
    department: null,
    departmentName: null,
    isGlobal: false,
    createdBy: mockCreators[2],
    usageCount: 0,
    previewUrl: null,
    createdAt: '2025-12-20T16:00:00Z',
    updatedAt: '2025-12-20T16:00:00Z',
  },
];

// =====================
// MOCK FULL TEMPLATES
// =====================

export const mockMasterTemplate: Template = {
  id: 'template-1',
  name: 'University Master Template',
  type: 'master',
  status: 'active',
  css: mockMasterCSS,
  html: mockMasterHTML,
  department: null,
  departmentName: null,
  isGlobal: true,
  createdBy: mockCreators[0],
  usageCount: 45,
  usedByCourses: [mockCourses[0], mockCourses[1], mockCourses[2]],
  previewUrl: 'https://cdn.example.com/previews/template-1.html',
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-11-01T14:30:00Z',
};

export const mockDepartmentTemplate: Template = {
  id: 'template-2',
  name: 'Computer Science Department Template',
  type: 'department',
  status: 'active',
  css: mockDepartmentCSS,
  html: mockDepartmentHTML,
  department: 'dept-1',
  departmentName: 'Computer Science',
  isGlobal: false,
  createdBy: mockCreators[1],
  usageCount: 23,
  usedByCourses: [mockCourses[0], mockCourses[2]],
  previewUrl: 'https://cdn.example.com/previews/template-2.html',
  createdAt: '2025-03-10T09:00:00Z',
  updatedAt: '2025-10-15T16:20:00Z',
};

export const mockCustomTemplate: Template = {
  id: 'template-4',
  name: 'My Custom Course Template',
  type: 'custom',
  status: 'active',
  css: mockCustomCSS,
  html: mockCustomHTML,
  department: null,
  departmentName: null,
  isGlobal: false,
  createdBy: mockCreators[2],
  usageCount: 5,
  usedByCourses: [mockCourses[3]],
  previewUrl: 'https://cdn.example.com/previews/template-4.html',
  createdAt: '2025-06-12T14:00:00Z',
  updatedAt: '2025-12-01T09:45:00Z',
};

export const mockDraftTemplate: Template = {
  id: 'template-5',
  name: 'Draft Custom Template',
  type: 'custom',
  status: 'draft',
  css: '.draft { color: red; }',
  html: '<div class="draft">{{content}}</div>',
  department: null,
  departmentName: null,
  isGlobal: false,
  createdBy: mockCreators[2],
  usageCount: 0,
  usedByCourses: [],
  previewUrl: null,
  createdAt: '2025-12-20T16:00:00Z',
  updatedAt: '2025-12-20T16:00:00Z',
};

export const mockMathDepartmentTemplate: Template = {
  id: 'template-3',
  name: 'Mathematics Department Template',
  type: 'department',
  status: 'active',
  css: mockDepartmentCSS,
  html: mockDepartmentHTML,
  department: 'dept-2',
  departmentName: 'Mathematics',
  isGlobal: false,
  createdBy: mockCreators[0],
  usageCount: 18,
  usedByCourses: [],
  previewUrl: 'https://cdn.example.com/previews/template-3.html',
  createdAt: '2025-04-05T11:30:00Z',
  updatedAt: '2025-09-20T10:15:00Z',
};

// =====================
// MOCK FORM PAYLOADS
// =====================

export const mockCreateMasterTemplatePayload: CreateTemplatePayload = {
  name: 'New Master Template',
  type: 'master',
  css: mockMasterCSS,
  html: mockMasterHTML,
  isGlobal: true,
  status: 'active',
};

export const mockCreateDepartmentTemplatePayload: CreateTemplatePayload = {
  name: 'New Department Template',
  type: 'department',
  css: mockDepartmentCSS,
  html: mockDepartmentHTML,
  department: 'dept-1',
  status: 'active',
};

export const mockCreateCustomTemplatePayload: CreateTemplatePayload = {
  name: 'New Custom Template',
  type: 'custom',
  css: mockCustomCSS,
  html: mockCustomHTML,
  status: 'draft',
};

export const mockUpdateTemplatePayload: UpdateTemplatePayload = {
  name: 'Updated Template Name',
  css: '.updated { color: blue; }',
  html: '<div class="updated">{{content}}</div>',
  status: 'active',
};

export const mockDuplicateMasterPayload: DuplicateTemplatePayload = {
  name: 'Duplicated Master Template',
  type: 'department',
  department: 'dept-1',
  status: 'draft',
};

export const mockDuplicateCustomPayload: DuplicateTemplatePayload = {
  name: 'Copy of Custom Template',
  status: 'draft',
};

// =====================
// MOCK API RESPONSES
// =====================

export const mockDuplicateTemplateResponse: DuplicateTemplateResponse = {
  id: 'template-6',
  name: 'Duplicated Master Template',
  type: 'department',
  status: 'draft',
  css: mockMasterCSS,
  html: mockMasterHTML,
  department: 'dept-1',
  departmentName: 'Computer Science',
  isGlobal: false,
  createdBy: mockCreators[0],
  usageCount: 0,
  duplicatedFrom: 'template-1',
  previewUrl: null,
  createdAt: '2026-01-08T10:00:00Z',
  updatedAt: '2026-01-08T10:00:00Z',
};

export const mockDeleteTemplateResponse: DeleteTemplateResponse = {
  deletedId: 'template-5',
  affectedCourses: 0,
  replacedWith: null,
};

export const mockDeleteWithReplacementResponse: DeleteTemplateResponse = {
  deletedId: 'template-2',
  affectedCourses: 23,
  replacedWith: 'template-1',
};

export const mockForceDeleteResponse: DeleteTemplateResponse = {
  deletedId: 'template-4',
  affectedCourses: 5,
  replacedWith: null,
};

// =====================
// MOCK PREVIEW RESPONSES
// =====================

export const mockPreviewDataJSON: TemplatePreviewData = {
  html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WEB101 - Introduction to Web Development</title>
</head>
<body>
    <header class="course-header">
        <h1>Introduction to Web Development</h1>
        <p class="course-code">WEB101</p>
        <p class="instructor">Instructor: John Smith</p>
        <p class="department">Computer Science</p>
    </header>

    <main class="course-content">
        This is sample course content for preview.
    </main>

    <footer class="course-footer">
        <p>&copy; 2026 University. All rights reserved.</p>
    </footer>
</body>
</html>
  `,
  css: mockMasterCSS,
  metadata: {
    templateId: 'template-1',
    templateName: 'University Master Template',
    previewGenerated: '2026-01-08T12:00:00Z',
    placeholders: {
      courseTitle: 'Introduction to Web Development',
      courseCode: 'WEB101',
      instructorName: 'John Smith',
      departmentName: 'Computer Science',
      content: 'This is sample course content for preview.',
    },
  },
};

export const mockPreviewHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WEB101 - Introduction to Web Development</title>
    <style>${mockMasterCSS}</style>
</head>
<body>
    <header class="course-header">
        <h1>Introduction to Web Development</h1>
        <p class="course-code">WEB101</p>
        <p class="instructor">Instructor: John Smith</p>
        <p class="department">Computer Science</p>
    </header>

    <main class="course-content">
        This is sample course content for preview.
    </main>

    <footer class="course-footer">
        <p>&copy; 2026 University. All rights reserved.</p>
    </footer>
</body>
</html>
`;

// =====================
// FACTORY FUNCTIONS
// =====================

export const createMockTemplate = (overrides?: Partial<Template>): Template => ({
  id: `template-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Template',
  type: 'custom',
  status: 'draft',
  css: '.test { color: black; }',
  html: '<div class="test">{{content}}</div>',
  department: null,
  departmentName: null,
  isGlobal: false,
  createdBy: mockCreators[0],
  usageCount: 0,
  usedByCourses: [],
  previewUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockTemplateListItem = (
  overrides?: Partial<TemplateListItem>
): TemplateListItem => ({
  id: `template-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Template',
  type: 'custom',
  status: 'draft',
  department: null,
  departmentName: null,
  isGlobal: false,
  createdBy: mockCreators[0],
  usageCount: 0,
  previewUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});
