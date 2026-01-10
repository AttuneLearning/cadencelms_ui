# Content Uploader

A comprehensive content upload system for staff to add SCORM packages, videos, documents, and other media to their courses.

## Overview

The Content Uploader provides a tabbed interface that allows staff members to:

1. **Upload SCORM Packages** - Upload SCORM 1.2 or 2004 packages with optional thumbnails
2. **Upload Video/Audio** - Upload media files (video, audio, images)
3. **Upload Documents** - Upload PDF, Word, PowerPoint, and Excel documents
4. **Browse Content Library** - Select existing content to add to modules

## Features

### FileUploader Component

A reusable drag-and-drop file upload component with:

- Drag-and-drop support with visual feedback
- File type validation based on configuration
- File size validation
- Upload progress tracking
- Multiple file support (configurable)
- Preview for uploaded files
- Error handling and display

**Usage:**

```tsx
import { FileUploader, type FileConfig } from '@/features/content/ui';

const config: FileConfig = {
  accept: ['.zip', 'application/zip'],
  maxSize: 100, // MB
  label: 'SCORM Package (.zip)',
};

<FileUploader
  config={config}
  multiple={false}
  onFilesSelected={handleFilesSelected}
  files={files}
  onRemoveFile={handleRemoveFile}
  disabled={isUploading}
/>
```

### ContentSelector Component

Browse and select existing content from the library:

- Search by title
- Filter by content type (SCORM, media, exercise)
- Filter by department
- Preview content details
- Visual selection feedback

**Usage:**

```tsx
import { ContentSelector } from '@/features/content/ui';

<ContentSelector
  onSelect={handleContentSelection}
  selectedContentId={selectedId}
  filterByType="scorm" // optional
  departmentId="dept-123" // optional
/>
```

### QuickContentUploader Component

A compact version for inline content uploads:

- Dialog-based upload interface
- Minimal configuration required
- Supports all content types
- Progress tracking
- Success/error handling

**Usage:**

```tsx
import { QuickContentUploader } from '@/features/content/ui';

<QuickContentUploader
  type="video"
  departmentId="dept-123"
  onSuccess={(contentId) => console.log('Uploaded:', contentId)}
  trigger={<Button>Upload Video</Button>}
/>
```

## Content Uploader Page

The main page (`ContentUploaderPage.tsx`) provides a complete upload experience with:

### URL Parameters

- `courseId` - Optional course ID to link content to
- `moduleId` - Optional module ID to link content to

**Example:**
```
/staff/courses/content/upload?courseId=course-123&moduleId=module-456
```

### Tabs

#### 1. SCORM Package Upload

Upload SCORM packages with:
- ZIP file upload (max 100MB)
- Optional title override
- Optional description
- Optional department assignment
- Optional thumbnail image
- Automatic manifest parsing

#### 2. Video/Audio Upload

Upload media files with:
- Type selection (video, audio, image)
- File upload with appropriate size limits
- Required title
- Optional description
- Optional department assignment

**File Size Limits:**
- Video: 500MB
- Audio: 100MB
- Image: 10MB

#### 3. Document Upload

Upload documents with:
- Support for PDF, Word, PowerPoint, Excel
- File upload (max 50MB)
- Required title
- Optional description
- Optional department assignment

#### 4. Content Library

Browse existing content:
- Search and filter capabilities
- Visual content cards with thumbnails
- Preview functionality
- Select content to link to modules

## Integration with Course Builder

To integrate with course modules:

```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigate to content uploader from course module
navigate(`/staff/courses/content/upload?courseId=${courseId}&moduleId=${moduleId}`);
```

## API Integration

The content uploader uses the following APIs:

### SCORM Upload
```typescript
useUploadScormPackage({
  onSuccess: (data) => {
    // Handle success
    console.log('Uploaded SCORM:', data.id);
  },
  onError: (error) => {
    // Handle error
  },
});
```

### Media Upload
```typescript
useUploadMediaFile({
  onSuccess: (data) => {
    // Handle success
    console.log('Uploaded Media:', data.id);
  },
  onError: (error) => {
    // Handle error
  },
});
```

### Content Fetching
```typescript
useContents({
  search: 'search term',
  type: 'scorm',
  departmentId: 'dept-123',
  status: 'published',
});
```

## File Type Support

### SCORM Packages
- Extensions: `.zip`
- MIME types: `application/zip`
- Max size: 100MB
- Versions: SCORM 1.2, SCORM 2004

### Video Files
- Extensions: `.mp4`, `.webm`, `.mov`, `.avi`
- MIME types: `video/*`
- Max size: 500MB

### Audio Files
- Extensions: `.mp3`, `.wav`, `.ogg`, `.m4a`
- MIME types: `audio/*`
- Max size: 100MB

### Image Files
- Extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- MIME types: `image/*`
- Max size: 10MB

### Documents
- Extensions: `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.xls`, `.xlsx`
- Max size: 50MB

## Error Handling

The uploader handles various error scenarios:

1. **File Size Exceeded** - Shows error if file exceeds configured limit
2. **Invalid File Type** - Shows error if file type not accepted
3. **Upload Failure** - Shows toast notification with error message
4. **Network Errors** - Displays appropriate error messages

## Upload Progress

Real-time upload progress is displayed:

- Progress bar with percentage
- File status indicators (pending, uploading, success, error)
- Cancel option for pending uploads
- Visual feedback during upload

## Accessibility

The components follow accessibility best practices:

- Keyboard navigation support
- Screen reader friendly labels
- Focus management
- ARIA attributes
- Color contrast compliance

## Styling

Uses shadcn/ui components with Tailwind CSS:

- Responsive design (mobile, tablet, desktop)
- Dark mode support (if configured)
- Consistent with LMS design system
- Customizable through Tailwind utilities

## Future Enhancements

Potential improvements:

1. Batch upload support for multiple files
2. Upload queue management
3. Resume interrupted uploads
4. Thumbnail generation for videos
5. Content preview before upload
6. Metadata extraction from files
7. Content versioning
8. Content duplication/cloning
9. Bulk content operations
10. Upload templates for common scenarios

## Testing

The components should be tested for:

- File upload functionality
- Drag-and-drop behavior
- File validation
- Progress tracking
- Error handling
- API integration
- Responsive design
- Accessibility compliance

## Performance Considerations

- Lazy loading for content library
- Optimized file upload chunks
- Progress throttling
- Image optimization for thumbnails
- Efficient re-rendering with React Query

## Security

- File type validation on client and server
- File size restrictions
- CSRF protection
- Authentication required
- Department-based access control
