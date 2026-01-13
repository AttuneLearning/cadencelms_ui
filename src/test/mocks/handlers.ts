/**
 * MSW Request Handlers
 * Centralized mock API handlers for all entity endpoints
 *
 * These handlers provide default responses for API endpoints during testing.
 * Individual tests can override these using server.use() for specific scenarios.
 */

import { http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';

// Import mock data
import {
  mockClasses,
  mockFullClass,
  mockClassRoster,
  mockClassProgress,
  mockClassEnrollmentsResponse,
  mockEnrollmentResult,
  mockDeleteClassResponse,
  mockDropEnrollmentResponse,
  createMockClass,
} from './data/classes';

import {
  mockContentListResponse,
  mockContents,
  mockScormPackagesListResponse,
  mockScormPackages,
  mockMediaFilesListResponse,
  mockMediaFiles,
  mockUploadScormPackageResponse,
  mockUploadMediaFileResponse,
  mockScormLaunchResponse,
  mockPublishScormPackageResponse,
  mockUnpublishScormPackageResponse,
} from './data/content';

import {
  mockCourseSegmentsList,
  mockFullCourseSegment,
  createMockCourseSegment,
} from './data/courseSegments';

import {
  mockPersonResponse,
  mockPersonExtendedLearnerResponse,
  mockDemographicsResponse,
} from '../fixtures/person.fixtures';

const baseUrl = env.apiBaseUrl;

/**
 * MSW Request Handlers
 */
export const handlers = [
  // ==================== CLASS API HANDLERS ====================

  // GET /classes - List classes
  http.get(`${baseUrl}/classes`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const course = url.searchParams.get('course');
    const instructor = url.searchParams.get('instructor');
    const term = url.searchParams.get('term');
    const search = url.searchParams.get('search');

    let filteredClasses = [...mockClasses];

    // Apply filters
    if (status) {
      filteredClasses = filteredClasses.filter((c) => c.status === status);
    }
    if (course) {
      filteredClasses = filteredClasses.filter((c) => c.course.id === course);
    }
    if (instructor) {
      filteredClasses = filteredClasses.filter((c) =>
        c.instructors.some((i) => i.id === instructor)
      );
    }
    if (term) {
      filteredClasses = filteredClasses.filter((c) => c.academicTerm?.id === term);
    }
    if (search) {
      filteredClasses = filteredClasses.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const total = filteredClasses.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedClasses = filteredClasses.slice(start, end);

    return HttpResponse.json({
      data: {
        data: {
          classes: paginatedClasses,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      },
    });
  }),

  // GET /classes/:id - Get single class
  http.get(`${baseUrl}/classes/:id`, ({ params }) => {
    const { id } = params;

    if (id === mockFullClass.id) {
      return HttpResponse.json({
        data: { data: mockFullClass },
      });
    }

    return HttpResponse.json(
      { message: 'Class not found' },
      { status: 404 }
    );
  }),

  // POST /classes - Create class
  http.post(`${baseUrl}/classes`, async ({ request }) => {
    const body = await request.json();
    const newClass = createMockClass({
      name: (body as any).name,
    });

    return HttpResponse.json(
      {
        data: {
          data: newClass,
          message: 'Class created successfully',
        },
      },
      { status: 201 }
    );
  }),

  // PUT /classes/:id - Update class
  http.put(`${baseUrl}/classes/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();

    const updatedClass = {
      ...mockFullClass,
      id: id as string,
      ...body,
    };

    return HttpResponse.json({
      data: {
        data: updatedClass,
        message: 'Class updated successfully',
      },
    });
  }),

  // DELETE /classes/:id - Delete class
  http.delete(`${baseUrl}/classes/:id`, ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      data: {
        data: {
          ...mockDeleteClassResponse,
          id: id as string,
        },
        message: 'Class deleted successfully',
      },
    });
  }),

  // GET /classes/:id/roster - Get class roster
  http.get(`${baseUrl}/classes/:id/roster`, ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      data: {
        data: {
          ...mockClassRoster,
          classId: id as string,
        },
      },
    });
  }),

  // POST /classes/:id/enrollments - Add learners to class
  http.post(`${baseUrl}/classes/:id/enrollments`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();

    return HttpResponse.json({
      data: {
        data: {
          ...mockEnrollmentResult,
          classId: id as string,
        },
        message: 'Learners enrolled successfully',
      },
    });
  }),

  // DELETE /classes/:classId/enrollments/:enrollmentId - Remove learner from class
  http.delete(
    `${baseUrl}/classes/:classId/enrollments/:enrollmentId`,
    ({ params }) => {
      const { enrollmentId } = params;

      return HttpResponse.json({
        data: {
          data: {
            ...mockDropEnrollmentResponse,
            enrollmentId: enrollmentId as string,
          },
          message: 'Learner removed successfully',
        },
      });
    }
  ),

  // GET /classes/:id/progress - Get class progress
  http.get(`${baseUrl}/classes/:id/progress`, ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      data: {
        data: {
          ...mockClassProgress,
          classId: id as string,
        },
      },
    });
  }),

  // GET /classes/:id/enrollments - Get class enrollments
  http.get(`${baseUrl}/classes/:id/enrollments`, ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');

    let enrollments = [...mockClassEnrollmentsResponse.enrollments];

    if (status) {
      enrollments = enrollments.filter((e) => e.status === status);
    }

    return HttpResponse.json({
      data: {
        data: {
          classId: id as string,
          enrollments,
          pagination: {
            page,
            limit,
            total: enrollments.length,
            totalPages: Math.ceil(enrollments.length / limit),
            hasNext: false,
            hasPrev: false,
          },
        },
      },
    });
  }),

  // ==================== CONTENT API HANDLERS ====================

  // GET /content - List all content
  http.get(`${baseUrl}/content`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const departmentId = url.searchParams.get('departmentId');

    let filteredContent = [...mockContentListResponse.content];

    if (type) {
      filteredContent = filteredContent.filter((c) => c.type === type);
    }
    if (status) {
      filteredContent = filteredContent.filter((c) => c.status === status);
    }
    if (departmentId) {
      filteredContent = filteredContent.filter((c) => c.departmentId === departmentId);
    }

    const total = filteredContent.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedContent = filteredContent.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        content: paginatedContent,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  }),

  // GET /content/:id - Get single content item
  http.get(`${baseUrl}/content/:id`, ({ params }) => {
    const { id } = params;
    const content = mockContents.find((c) => c.id === id);

    if (content) {
      return HttpResponse.json({
        success: true,
        data: content,
      });
    }

    return HttpResponse.json(
      { message: 'Content not found' },
      { status: 404 }
    );
  }),

  // ==================== SCORM PACKAGE HANDLERS ====================

  // GET /content/scorm - List SCORM packages
  http.get(`${baseUrl}/content/scorm`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const version = url.searchParams.get('version');
    const status = url.searchParams.get('status');

    let filteredPackages = [...mockScormPackagesListResponse.packages];

    if (version) {
      filteredPackages = filteredPackages.filter((p) => p.version === version);
    }
    if (status) {
      filteredPackages = filteredPackages.filter((p) => p.status === status);
    }

    const total = filteredPackages.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPackages = filteredPackages.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        packages: paginatedPackages,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  }),

  // POST /content/scorm - Upload SCORM package
  http.post(`${baseUrl}/content/scorm`, async ({ request }) => {
    await request.formData(); // Consume form data

    return HttpResponse.json(
      {
        success: true,
        data: mockUploadScormPackageResponse,
      },
      { status: 201 }
    );
  }),

  // GET /content/scorm/:id - Get SCORM package
  http.get(`${baseUrl}/content/scorm/:id`, ({ params }) => {
    const { id } = params;
    const scormPackage = mockScormPackages.find((p) => p.id === id);

    if (scormPackage) {
      return HttpResponse.json({
        success: true,
        data: scormPackage,
      });
    }

    return HttpResponse.json(
      { message: 'SCORM package not found' },
      { status: 404 }
    );
  }),

  // PUT /content/scorm/:id - Update SCORM package
  http.put(`${baseUrl}/content/scorm/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const scormPackage = mockScormPackages.find((p) => p.id === id);

    if (scormPackage) {
      const updatedPackage = {
        ...scormPackage,
        ...body,
      };

      return HttpResponse.json({
        success: true,
        data: updatedPackage,
      });
    }

    return HttpResponse.json(
      { message: 'SCORM package not found' },
      { status: 404 }
    );
  }),

  // DELETE /content/scorm/:id - Delete SCORM package
  http.delete(`${baseUrl}/content/scorm/:id`, ({ params }) => {
    const { id } = params;

    return HttpResponse.json({}, { status: 204 });
  }),

  // POST /content/scorm/:id/launch - Launch SCORM package
  http.post(`${baseUrl}/content/scorm/:id/launch`, async ({ params, request }) => {
    const { id } = params;

    return HttpResponse.json({
      success: true,
      data: mockScormLaunchResponse,
    });
  }),

  // POST /content/scorm/:id/publish - Publish SCORM package
  http.post(`${baseUrl}/content/scorm/:id/publish`, async ({ params, request }) => {
    const { id } = params;

    return HttpResponse.json({
      success: true,
      data: {
        ...mockPublishScormPackageResponse,
        id: id as string,
      },
    });
  }),

  // POST /content/scorm/:id/unpublish - Unpublish SCORM package
  http.post(`${baseUrl}/content/scorm/:id/unpublish`, async ({ params, request }) => {
    const { id } = params;

    return HttpResponse.json({
      success: true,
      data: {
        ...mockUnpublishScormPackageResponse,
        id: id as string,
      },
    });
  }),

  // ==================== MEDIA FILE HANDLERS ====================

  // GET /content/media - List media files
  http.get(`${baseUrl}/content/media`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type');
    const departmentId = url.searchParams.get('departmentId');

    let filteredMedia = [...mockMediaFilesListResponse.media];

    if (type) {
      filteredMedia = filteredMedia.filter((m) => m.type === type);
    }
    if (departmentId) {
      filteredMedia = filteredMedia.filter((m) => m.departmentId === departmentId);
    }

    const total = filteredMedia.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedMedia = filteredMedia.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        media: paginatedMedia,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  }),

  // POST /content/media - Upload media file
  http.post(`${baseUrl}/content/media`, async ({ request }) => {
    await request.formData(); // Consume form data

    return HttpResponse.json(
      {
        success: true,
        data: mockUploadMediaFileResponse,
      },
      { status: 201 }
    );
  }),

  // GET /content/media/:id - Get media file
  http.get(`${baseUrl}/content/media/:id`, ({ params }) => {
    const { id } = params;
    const mediaFile = mockMediaFiles.find((m) => m.id === id);

    if (mediaFile) {
      return HttpResponse.json({
        success: true,
        data: mediaFile,
      });
    }

    return HttpResponse.json(
      { message: 'Media file not found' },
      { status: 404 }
    );
  }),

  // PUT /content/media/:id - Update media file
  http.put(`${baseUrl}/content/media/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const mediaFile = mockMediaFiles.find((m) => m.id === id);

    if (mediaFile) {
      const updatedMedia = {
        ...mediaFile,
        ...body,
      };

      return HttpResponse.json({
        success: true,
        data: updatedMedia,
      });
    }

    return HttpResponse.json(
      { message: 'Media file not found' },
      { status: 404 }
    );
  }),

  // DELETE /content/media/:id - Delete media file
  http.delete(`${baseUrl}/content/media/:id`, ({ params }) => {
    const { id } = params;

    return HttpResponse.json({}, { status: 204 });
  }),

  // ==================== COURSE SEGMENT HANDLERS ====================

  // GET /courses/:courseId/modules - List course segments
  http.get(`${baseUrl}/courses/:courseId/modules`, ({ params, request }) => {
    const { courseId } = params;
    const url = new URL(request.url);
    const includeUnpublished = url.searchParams.get('includeUnpublished') === 'true';

    let modules = [...mockCourseSegmentsList];

    if (!includeUnpublished) {
      modules = modules.filter((m) => m.isPublished);
    }

    return HttpResponse.json({
      data: {
        courseId: courseId as string,
        courseTitle: 'Advanced Web Development',
        modules,
        totalModules: modules.length,
      },
    });
  }),

  // GET /courses/:courseId/modules/:moduleId - Get course segment
  http.get(`${baseUrl}/courses/:courseId/modules/:moduleId`, ({ params }) => {
    const { courseId, moduleId } = params;

    return HttpResponse.json({
      data: {
        ...mockFullCourseSegment,
        id: moduleId as string,
        courseId: courseId as string,
      },
    });
  }),

  // POST /courses/:courseId/modules - Create course segment
  http.post(`${baseUrl}/courses/:courseId/modules`, async ({ params, request }) => {
    const { courseId } = params;
    const body = await request.json();

    const newSegment = createMockCourseSegment({
      courseId: courseId as string,
      title: (body as any).title,
      type: (body as any).type,
      order: (body as any).order,
    });

    return HttpResponse.json(
      {
        data: newSegment,
      },
      { status: 201 }
    );
  }),

  // PUT /courses/:courseId/modules/:moduleId - Update course segment
  http.put(
    `${baseUrl}/courses/:courseId/modules/:moduleId`,
    async ({ params, request }) => {
      const { courseId, moduleId } = params;
      const body = await request.json();

      const updatedSegment = {
        ...mockFullCourseSegment,
        id: moduleId as string,
        courseId: courseId as string,
        ...body,
      };

      return HttpResponse.json({
        data: updatedSegment,
      });
    }
  ),

  // DELETE /courses/:courseId/modules/:moduleId - Delete course segment
  http.delete(`${baseUrl}/courses/:courseId/modules/:moduleId`, ({ params }) => {
    const { courseId, moduleId } = params;

    return HttpResponse.json({
      data: {
        id: moduleId as string,
        title: 'Introduction to TypeScript',
        deletedAt: new Date().toISOString(),
        affectedModules: 0,
        reorderedModules: [],
      },
    });
  }),

  // PATCH /courses/:courseId/modules/reorder - Reorder course segments
  http.patch(
    `${baseUrl}/courses/:courseId/modules/reorder`,
    async ({ params, request }) => {
      const { courseId } = params;
      const body = await request.json();
      const { moduleIds } = body as any;

      const modules = moduleIds.map((id: string, index: number) => ({
        id,
        title: `Module ${index + 1}`,
        oldOrder: parseInt(id.split('-')[1] || '1'),
        newOrder: index + 1,
      }));

      return HttpResponse.json({
        data: {
          courseId: courseId as string,
          modules,
          totalReordered: modules.length,
        },
      });
    }
  ),

  // POST /courses/:courseId/modules/:moduleId/link-content - Link content to module
  http.post(
    `${baseUrl}/courses/:courseId/modules/:moduleId/link-content`,
    async ({ params, request }) => {
      const { courseId, moduleId } = params;
      const body = await request.json();
      const { contentId, contentType } = body as any;

      return HttpResponse.json({
        data: {
          moduleId: moduleId as string,
          contentId,
          contentType: contentType || 'scorm',
          linkedAt: new Date().toISOString(),
          message: 'Content linked successfully',
        },
      });
    }
  ),

  // ==================== PERSON API V2.0 HANDLERS ====================

  // GET /api/v2/users/me/person - Get person data
  http.get(`${baseUrl}/api/v2/users/me/person`, () => {
    return HttpResponse.json(mockPersonResponse);
  }),

  // PUT /api/v2/users/me/person - Update person data
  http.put(`${baseUrl}/api/v2/users/me/person`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      message: 'Person data updated successfully',
      data: {
        ...mockPersonResponse.data,
        ...body,
      },
    });
  }),

  // GET /api/v2/users/me/person/extended - Get extended person data
  http.get(`${baseUrl}/api/v2/users/me/person/extended`, () => {
    return HttpResponse.json(mockPersonExtendedLearnerResponse);
  }),

  // PUT /api/v2/users/me/person/extended - Update extended person data
  http.put(`${baseUrl}/api/v2/users/me/person/extended`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      message: 'Extended person data updated successfully',
      data: {
        ...mockPersonExtendedLearnerResponse.data,
        ...(mockPersonExtendedLearnerResponse.data.role === 'learner'
          ? { learner: { ...mockPersonExtendedLearnerResponse.data.learner, ...body } }
          : {}),
      },
    });
  }),

  // ==================== DEMOGRAPHICS API V2.0 HANDLERS ====================

  // GET /api/v2/users/me/demographics - Get demographics data
  http.get(`${baseUrl}/api/v2/users/me/demographics`, () => {
    return HttpResponse.json(mockDemographicsResponse);
  }),

  // PUT /api/v2/users/me/demographics - Update demographics data
  http.put(`${baseUrl}/api/v2/users/me/demographics`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      message: 'Demographics data updated successfully',
      data: {
        ...mockDemographicsResponse.data,
        ...body,
      },
    });
  }),

  // ==================== PASSWORD CHANGE HANDLERS (PHASE 6) ====================

  // POST /api/v2/users/me/password - Change user password
  http.post(`${baseUrl}/api/v2/users/me/password`, async ({ request }) => {
    const body = (await request.json()) as { currentPassword: string; newPassword: string };

    // Simulate validation
    if (!body.currentPassword || !body.newPassword) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Current password and new password are required',
        },
        { status: 400 }
      );
    }

    // Simulate wrong current password
    if (body.currentPassword === 'wrongpassword') {
      return HttpResponse.json(
        {
          success: false,
          message: 'Current password is incorrect',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  }),

  // POST /api/v2/admin/me/password - Change admin password
  http.post(`${baseUrl}/api/v2/admin/me/password`, async ({ request }) => {
    const body = (await request.json()) as { currentPassword: string; newPassword: string };

    // Simulate validation
    if (!body.currentPassword || !body.newPassword) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Current password and new password are required',
        },
        { status: 400 }
      );
    }

    // Simulate wrong current password
    if (body.currentPassword === 'wrongpassword') {
      return HttpResponse.json(
        {
          success: false,
          message: 'Current password is incorrect',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Admin password changed successfully',
    });
  }),

  // ==================== DEFAULT HANDLERS ====================

  // Health check endpoint
  http.get(`${baseUrl}/health`, () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
