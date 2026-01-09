/**
 * Mock content data for testing
 */

import type {
  Content,
  ContentListItem,
  ContentListResponse,
  ScormPackage,
  ScormPackageListItem,
  ScormPackagesListResponse,
  MediaFile,
  MediaFileListItem,
  MediaFilesListResponse,
  UploadScormPackageResponse,
  UploadMediaFileResponse,
  ScormLaunchResponse,
  PublishScormPackageResponse,
  UnpublishScormPackageResponse,
  ScormManifestData,
  UserReference,
  DepartmentReference,
  Pagination,
} from '@/entities/content/model/types';

// Common references
export const mockDepartments: DepartmentReference[] = [
  { id: 'dept-1', name: 'Business Technology', code: 'BT' },
  { id: 'dept-2', name: 'Computer Science', code: 'CS' },
  { id: 'dept-3', name: 'Healthcare', code: 'HC' },
];

export const mockUsers: UserReference[] = [
  { id: 'user-1', name: 'John Doe', email: 'john.doe@example.com' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane.smith@example.com' },
  { id: 'user-3', name: 'Bob Wilson', email: 'bob.wilson@example.com' },
];

// SCORM manifest data
export const mockScormManifestData: ScormManifestData = {
  schemaVersion: '1.2',
  metadata: {
    title: 'Introduction to Business Technology',
    description: 'A comprehensive introduction to modern business technology',
    duration: '02:30:00',
    keywords: ['business', 'technology', 'fundamentals'],
  },
  organizations: [
    {
      identifier: 'org-1',
      title: 'Main Organization',
      items: [
        { identifier: 'item-1', title: 'Module 1' },
        { identifier: 'item-2', title: 'Module 2' },
      ],
    },
  ],
  resources: [
    {
      identifier: 'res-1',
      type: 'webcontent',
      href: 'index.html',
    },
  ],
};

export const mockScormManifestData2004: ScormManifestData = {
  schemaVersion: '2004',
  metadata: {
    title: 'Advanced Software Engineering',
    description: 'Advanced concepts in software engineering',
    duration: '05:00:00',
    keywords: ['software', 'engineering', 'advanced'],
  },
  organizations: [],
  resources: [],
};

// SCORM Package List Items
export const mockScormPackageListItems: ScormPackageListItem[] = [
  {
    id: 'scorm-1',
    title: 'Introduction to Business Technology',
    identifier: 'com.example.biz-tech-101',
    version: '1.2',
    status: 'published',
    isPublished: true,
    departmentId: 'dept-1',
    department: mockDepartments[0],
    packagePath: '/content/scorm/scorm-1',
    launchUrl: '/content/scorm/scorm-1/index.html',
    thumbnailUrl: 'https://example.com/thumbnails/scorm-1.jpg',
    description: 'A comprehensive introduction to modern business technology',
    fileSize: 52428800, // 50MB
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
  },
  {
    id: 'scorm-2',
    title: 'Advanced Software Engineering',
    identifier: 'com.example.soft-eng-202',
    version: '2004',
    status: 'published',
    isPublished: true,
    departmentId: 'dept-2',
    department: mockDepartments[1],
    packagePath: '/content/scorm/scorm-2',
    launchUrl: '/content/scorm/scorm-2/launch.html',
    thumbnailUrl: 'https://example.com/thumbnails/scorm-2.jpg',
    description: 'Advanced concepts in software engineering',
    fileSize: 104857600, // 100MB
    createdAt: '2025-11-15T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'scorm-3',
    title: 'Healthcare Administration Basics',
    identifier: 'com.example.healthcare-101',
    version: '1.2',
    status: 'draft',
    isPublished: false,
    departmentId: 'dept-3',
    department: mockDepartments[2],
    packagePath: '/content/scorm/scorm-3',
    launchUrl: '/content/scorm/scorm-3/index.html',
    thumbnailUrl: null,
    description: 'Essential healthcare administration concepts',
    fileSize: 31457280, // 30MB
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2026-01-07T10:00:00Z',
  },
];

// SCORM Package Details
export const mockScormPackages: ScormPackage[] = [
  {
    id: 'scorm-1',
    title: 'Introduction to Business Technology',
    identifier: 'com.example.biz-tech-101',
    version: '1.2',
    status: 'published',
    isPublished: true,
    departmentId: 'dept-1',
    department: mockDepartments[0],
    packagePath: '/content/scorm/scorm-1',
    launchUrl: '/content/scorm/scorm-1/index.html',
    thumbnailUrl: 'https://example.com/thumbnails/scorm-1.jpg',
    description: 'A comprehensive introduction to modern business technology',
    manifestData: mockScormManifestData,
    fileSize: 52428800,
    usageCount: 5,
    totalAttempts: 120,
    averageScore: 85.5,
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
    createdBy: mockUsers[0],
    publishedAt: '2025-12-05T10:00:00Z',
    publishedBy: mockUsers[0],
  },
  {
    id: 'scorm-2',
    title: 'Advanced Software Engineering',
    identifier: 'com.example.soft-eng-202',
    version: '2004',
    status: 'published',
    isPublished: true,
    departmentId: 'dept-2',
    department: mockDepartments[1],
    packagePath: '/content/scorm/scorm-2',
    launchUrl: '/content/scorm/scorm-2/launch.html',
    thumbnailUrl: 'https://example.com/thumbnails/scorm-2.jpg',
    description: 'Advanced concepts in software engineering',
    manifestData: mockScormManifestData2004,
    fileSize: 104857600,
    usageCount: 3,
    totalAttempts: 45,
    averageScore: 78.3,
    createdAt: '2025-11-15T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
    createdBy: mockUsers[1],
    publishedAt: '2025-11-20T10:00:00Z',
    publishedBy: mockUsers[1],
  },
  {
    id: 'scorm-3',
    title: 'Healthcare Administration Basics',
    identifier: 'com.example.healthcare-101',
    version: '1.2',
    status: 'draft',
    isPublished: false,
    departmentId: 'dept-3',
    department: mockDepartments[2],
    packagePath: '/content/scorm/scorm-3',
    launchUrl: '/content/scorm/scorm-3/index.html',
    thumbnailUrl: null,
    description: 'Essential healthcare administration concepts',
    manifestData: mockScormManifestData,
    fileSize: 31457280,
    usageCount: 0,
    totalAttempts: 0,
    averageScore: null,
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2026-01-07T10:00:00Z',
    createdBy: mockUsers[2],
    publishedAt: null,
    publishedBy: null,
  },
];

// Media File List Items
export const mockMediaFileListItems: MediaFileListItem[] = [
  {
    id: 'media-1',
    title: 'Introduction to Programming',
    filename: 'intro-programming.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    url: 'https://example.com/media/intro-programming.mp4',
    thumbnailUrl: 'https://example.com/thumbnails/intro-programming.jpg',
    size: 157286400, // 150MB
    duration: 1800, // 30 minutes
    departmentId: 'dept-2',
    department: mockDepartments[1],
    createdAt: '2025-12-01T10:00:00Z',
    createdBy: mockUsers[0],
  },
  {
    id: 'media-2',
    title: 'Business Communication Essentials',
    filename: 'business-comm.mp3',
    type: 'audio',
    mimeType: 'audio/mpeg',
    url: 'https://example.com/media/business-comm.mp3',
    thumbnailUrl: null,
    size: 31457280, // 30MB
    duration: 3600, // 60 minutes
    departmentId: 'dept-1',
    department: mockDepartments[0],
    createdAt: '2025-11-20T10:00:00Z',
    createdBy: mockUsers[1],
  },
  {
    id: 'media-3',
    title: 'Corporate Logo',
    filename: 'corporate-logo.png',
    type: 'image',
    mimeType: 'image/png',
    url: 'https://example.com/media/corporate-logo.png',
    thumbnailUrl: 'https://example.com/thumbnails/corporate-logo.jpg',
    size: 2097152, // 2MB
    duration: null,
    departmentId: 'dept-1',
    department: mockDepartments[0],
    createdAt: '2025-12-15T10:00:00Z',
    createdBy: mockUsers[2],
  },
  {
    id: 'media-4',
    title: 'Employee Handbook',
    filename: 'employee-handbook.pdf',
    type: 'document',
    mimeType: 'application/pdf',
    url: 'https://example.com/media/employee-handbook.pdf',
    thumbnailUrl: 'https://example.com/thumbnails/employee-handbook.jpg',
    size: 10485760, // 10MB
    duration: null,
    departmentId: 'dept-1',
    department: mockDepartments[0],
    createdAt: '2025-11-10T10:00:00Z',
    createdBy: mockUsers[0],
  },
];

// Media File Details
export const mockMediaFiles: MediaFile[] = [
  {
    id: 'media-1',
    title: 'Introduction to Programming',
    filename: 'intro-programming.mp4',
    description: 'A comprehensive introduction to programming concepts',
    type: 'video',
    mimeType: 'video/mp4',
    url: 'https://example.com/media/intro-programming.mp4',
    thumbnailUrl: 'https://example.com/thumbnails/intro-programming.jpg',
    size: 157286400,
    duration: 1800,
    metadata: {
      width: 1920,
      height: 1080,
      bitrate: 5000000,
      codec: 'h264',
    },
    departmentId: 'dept-2',
    department: mockDepartments[1],
    usageCount: 8,
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
    createdBy: mockUsers[0],
  },
  {
    id: 'media-2',
    title: 'Business Communication Essentials',
    filename: 'business-comm.mp3',
    description: 'Essential business communication skills',
    type: 'audio',
    mimeType: 'audio/mpeg',
    url: 'https://example.com/media/business-comm.mp3',
    thumbnailUrl: null,
    size: 31457280,
    duration: 3600,
    metadata: {
      width: null,
      height: null,
      bitrate: 128000,
      codec: 'mp3',
    },
    departmentId: 'dept-1',
    department: mockDepartments[0],
    usageCount: 12,
    createdAt: '2025-11-20T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
    createdBy: mockUsers[1],
  },
  {
    id: 'media-3',
    title: 'Corporate Logo',
    filename: 'corporate-logo.png',
    description: 'Official corporate logo',
    type: 'image',
    mimeType: 'image/png',
    url: 'https://example.com/media/corporate-logo.png',
    thumbnailUrl: 'https://example.com/thumbnails/corporate-logo.jpg',
    size: 2097152,
    duration: null,
    metadata: {
      width: 2048,
      height: 2048,
      bitrate: null,
      codec: null,
    },
    departmentId: 'dept-1',
    department: mockDepartments[0],
    usageCount: 25,
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2026-01-07T10:00:00Z',
    createdBy: mockUsers[2],
  },
  {
    id: 'media-4',
    title: 'Employee Handbook',
    filename: 'employee-handbook.pdf',
    description: 'Complete employee handbook and policies',
    type: 'document',
    mimeType: 'application/pdf',
    url: 'https://example.com/media/employee-handbook.pdf',
    thumbnailUrl: 'https://example.com/thumbnails/employee-handbook.jpg',
    size: 10485760,
    duration: null,
    metadata: {
      width: null,
      height: null,
      bitrate: null,
      codec: null,
    },
    departmentId: 'dept-1',
    department: mockDepartments[0],
    usageCount: 45,
    createdAt: '2025-11-10T10:00:00Z',
    updatedAt: '2026-01-03T10:00:00Z',
    createdBy: mockUsers[0],
  },
];

// Content List Items (combined view)
export const mockContentListItems: ContentListItem[] = [
  {
    id: 'content-1',
    title: 'Introduction to Business Technology',
    type: 'scorm',
    status: 'published',
    departmentId: 'dept-1',
    department: mockDepartments[0],
    thumbnailUrl: 'https://example.com/thumbnails/scorm-1.jpg',
    description: 'A comprehensive introduction to modern business technology',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
    createdBy: mockUsers[0],
  },
  {
    id: 'content-2',
    title: 'Introduction to Programming',
    type: 'media',
    status: 'published',
    departmentId: 'dept-2',
    department: mockDepartments[1],
    thumbnailUrl: 'https://example.com/thumbnails/intro-programming.jpg',
    description: 'A comprehensive introduction to programming concepts',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
    createdBy: mockUsers[0],
  },
  {
    id: 'content-3',
    title: 'Business Communication Essentials',
    type: 'media',
    status: 'published',
    departmentId: 'dept-1',
    department: mockDepartments[0],
    thumbnailUrl: null,
    description: 'Essential business communication skills',
    createdAt: '2025-11-20T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
    createdBy: mockUsers[1],
  },
  {
    id: 'content-4',
    title: 'Healthcare Administration Basics',
    type: 'scorm',
    status: 'draft',
    departmentId: 'dept-3',
    department: mockDepartments[2],
    thumbnailUrl: null,
    description: 'Essential healthcare administration concepts',
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2026-01-07T10:00:00Z',
    createdBy: mockUsers[2],
  },
  {
    id: 'content-5',
    title: 'Advanced Software Engineering',
    type: 'scorm',
    status: 'published',
    departmentId: 'dept-2',
    department: mockDepartments[1],
    thumbnailUrl: 'https://example.com/thumbnails/scorm-2.jpg',
    description: 'Advanced concepts in software engineering',
    createdAt: '2025-11-15T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
    createdBy: mockUsers[1],
  },
];

// Content Details (combined view)
export const mockContents: Content[] = [
  {
    id: 'content-1',
    title: 'Introduction to Business Technology',
    type: 'scorm',
    status: 'published',
    departmentId: 'dept-1',
    department: mockDepartments[0],
    description: 'A comprehensive introduction to modern business technology',
    thumbnailUrl: 'https://example.com/thumbnails/scorm-1.jpg',
    metadata: {
      scormVersion: '1.2',
      identifier: 'com.example.biz-tech-101',
    },
    usageCount: 5,
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
    createdBy: mockUsers[0],
    updatedBy: mockUsers[0],
  },
  {
    id: 'content-2',
    title: 'Introduction to Programming',
    type: 'media',
    status: 'published',
    departmentId: 'dept-2',
    department: mockDepartments[1],
    description: 'A comprehensive introduction to programming concepts',
    thumbnailUrl: 'https://example.com/thumbnails/intro-programming.jpg',
    metadata: {
      mediaType: 'video',
      duration: 1800,
      mimeType: 'video/mp4',
    },
    usageCount: 8,
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
    createdBy: mockUsers[0],
    updatedBy: mockUsers[0],
  },
];

// Pagination
export const mockPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 5,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

// Response objects
export const mockContentListResponse: ContentListResponse = {
  content: mockContentListItems,
  pagination: mockPagination,
};

export const mockScormPackagesListResponse: ScormPackagesListResponse = {
  packages: mockScormPackageListItems,
  pagination: mockPagination,
};

export const mockMediaFilesListResponse: MediaFilesListResponse = {
  media: mockMediaFileListItems,
  pagination: mockPagination,
};

// Upload responses
export const mockUploadScormPackageResponse: UploadScormPackageResponse = {
  id: 'scorm-new',
  title: 'New SCORM Package',
  identifier: 'com.example.new-package',
  version: '1.2',
  status: 'draft',
  isPublished: false,
  departmentId: 'dept-1',
  packagePath: '/content/scorm/scorm-new',
  launchUrl: '/content/scorm/scorm-new/index.html',
  manifestData: mockScormManifestData,
  fileSize: 52428800,
  createdAt: '2026-01-08T10:00:00Z',
};

export const mockUploadMediaFileResponse: UploadMediaFileResponse = {
  id: 'media-new',
  title: 'New Media File',
  filename: 'new-media.mp4',
  type: 'video',
  mimeType: 'video/mp4',
  url: 'https://example.com/media/new-media.mp4',
  thumbnailUrl: 'https://example.com/thumbnails/new-media.jpg',
  size: 157286400,
  duration: 1800,
  departmentId: 'dept-2',
  createdAt: '2026-01-08T10:00:00Z',
};

// SCORM Launch Response
export const mockScormLaunchResponse: ScormLaunchResponse = {
  playerUrl: 'https://example.com/player/scorm-1',
  attemptId: 'attempt-123',
  sessionToken: 'session-token-abc123',
  isResumed: false,
  scormVersion: '1.2',
  launchData: {
    entryPoint: '/content/scorm/scorm-1/index.html',
    parameters: {
      learnerName: 'John Doe',
      learnerId: 'user-1',
    },
  },
  expiresAt: '2026-01-08T18:00:00Z',
};

// Publish/Unpublish responses
export const mockPublishScormPackageResponse: PublishScormPackageResponse = {
  id: 'scorm-3',
  status: 'published',
  isPublished: true,
  publishedAt: '2026-01-08T10:00:00Z',
  publishedBy: mockUsers[0],
};

export const mockUnpublishScormPackageResponse: UnpublishScormPackageResponse = {
  id: 'scorm-1',
  status: 'draft',
  isPublished: false,
  unpublishedAt: '2026-01-08T10:00:00Z',
  unpublishedBy: mockUsers[0],
};

// Factory functions
export const createMockScormPackage = (
  overrides?: Partial<ScormPackage>
): ScormPackage => ({
  id: `scorm-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test SCORM Package',
  identifier: `com.example.test-${Math.floor(Math.random() * 1000)}`,
  version: '1.2',
  status: 'draft',
  isPublished: false,
  departmentId: 'dept-1',
  department: mockDepartments[0],
  packagePath: '/content/scorm/test',
  launchUrl: '/content/scorm/test/index.html',
  thumbnailUrl: null,
  description: 'Test SCORM package description',
  manifestData: mockScormManifestData,
  fileSize: 52428800,
  usageCount: 0,
  totalAttempts: 0,
  averageScore: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: mockUsers[0],
  publishedAt: null,
  publishedBy: null,
  ...overrides,
});

export const createMockMediaFile = (
  overrides?: Partial<MediaFile>
): MediaFile => ({
  id: `media-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Media File',
  filename: 'test-media.mp4',
  description: 'Test media file description',
  type: 'video',
  mimeType: 'video/mp4',
  url: 'https://example.com/media/test-media.mp4',
  thumbnailUrl: 'https://example.com/thumbnails/test-media.jpg',
  size: 157286400,
  duration: 1800,
  metadata: {
    width: 1920,
    height: 1080,
    bitrate: 5000000,
    codec: 'h264',
  },
  departmentId: 'dept-1',
  department: mockDepartments[0],
  usageCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: mockUsers[0],
  ...overrides,
});

export const createMockContentListItem = (
  overrides?: Partial<ContentListItem>
): ContentListItem => ({
  id: `content-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Content',
  type: 'scorm',
  status: 'draft',
  departmentId: 'dept-1',
  department: mockDepartments[0],
  thumbnailUrl: null,
  description: 'Test content description',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: mockUsers[0],
  ...overrides,
});

// Mock File objects for testing
export const createMockFile = (
  name: string = 'test-file.zip',
  size: number = 1024,
  type: string = 'application/zip'
): File => {
  const file = new File(['mock file content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

export const createMockImageFile = (
  name: string = 'test-image.jpg',
  size: number = 1024
): File => {
  return createMockFile(name, size, 'image/jpeg');
};

export const createMockVideoFile = (
  name: string = 'test-video.mp4',
  size: number = 1024 * 1024 * 10 // 10MB
): File => {
  return createMockFile(name, size, 'video/mp4');
};

export const createMockScormFile = (
  name: string = 'scorm-package.zip',
  size: number = 1024 * 1024 * 50 // 50MB
): File => {
  return createMockFile(name, size, 'application/zip');
};
