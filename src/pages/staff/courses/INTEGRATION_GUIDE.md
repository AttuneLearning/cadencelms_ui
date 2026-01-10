# Content Uploader Integration Guide

## Quick Start

### 1. Add Route to Router Configuration

Add the content uploader route to your staff routes:

```typescript
// src/app/router.tsx or similar
import { ContentUploaderPage } from '@/pages/staff/courses/ContentUploaderPage';

// Add to staff routes
{
  path: '/staff/courses/content/upload',
  element: <ContentUploaderPage />,
}
```

### 2. Navigate to Content Uploader

From any component, navigate to the uploader:

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Simple navigation
navigate('/staff/courses/content/upload');

// With course context
navigate(`/staff/courses/content/upload?courseId=${courseId}&moduleId=${moduleId}`);
```

### 3. Use Individual Components

Import and use components directly:

```typescript
import { FileUploader, ContentSelector, QuickContentUploader } from '@/features/content/ui';
```

## Integration Scenarios

### Scenario 1: Course Builder Integration

Add a button to course modules to upload content:

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Upload } from 'lucide-react';

const CourseModuleEditor: React.FC<{ courseId: string; moduleId: string }> = ({
  courseId,
  moduleId
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h2>Module Content</h2>

      <Button
        onClick={() => navigate(`/staff/courses/content/upload?courseId=${courseId}&moduleId=${moduleId}`)}
      >
        <Upload className="h-4 w-4 mr-2" />
        Add Content
      </Button>

      {/* Rest of module editor */}
    </div>
  );
};
```

### Scenario 2: Inline Quick Upload

Add quick upload capability to any form:

```tsx
import React from 'react';
import { QuickContentUploader } from '@/features/content/ui';
import { Button } from '@/shared/ui/button';

const LessonForm: React.FC = () => {
  const [contentId, setContentId] = React.useState<string | null>(null);

  return (
    <form>
      {/* Other form fields */}

      <div className="space-y-2">
        <label>Video Content</label>
        <QuickContentUploader
          type="video"
          onSuccess={(id) => {
            setContentId(id);
            console.log('Video uploaded:', id);
          }}
          trigger={<Button type="button">Upload Video</Button>}
        />
      </div>
    </form>
  );
};
```

### Scenario 3: Content Library Browser

Add content selection to any component:

```tsx
import React from 'react';
import { ContentSelector } from '@/features/content/ui';
import { Dialog, DialogContent } from '@/shared/ui/dialog';

const ContentPicker: React.FC<{
  onSelect: (contentId: string) => void;
}> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Browse Content Library
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <ContentSelector
            onSelect={(content) => {
              onSelect(content.id);
              setIsOpen(false);
            }}
            filterByType="scorm"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
```

### Scenario 4: Custom Upload Form

Build a custom upload form with FileUploader:

```tsx
import React from 'react';
import { FileUploader, type FileConfig } from '@/features/content/ui';
import { useUploadMediaFile } from '@/entities/content';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

const CustomVideoUploader: React.FC = () => {
  const [files, setFiles] = React.useState<any[]>([]);
  const [title, setTitle] = React.useState('');

  const uploadMedia = useUploadMediaFile({
    onSuccess: (data) => {
      console.log('Uploaded:', data);
      setFiles([]);
      setTitle('');
    },
  });

  const videoConfig: FileConfig = {
    accept: ['video/*', '.mp4'],
    maxSize: 500,
    label: 'Video files',
  };

  const handleUpload = () => {
    if (files.length > 0 && title) {
      uploadMedia.mutate({
        payload: {
          file: files[0].file,
          title,
          type: 'video',
        },
        onProgress: (progress) => {
          setFiles(prev => prev.map(f => ({ ...f, progress })));
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <FileUploader
        config={videoConfig}
        onFilesSelected={(selectedFiles) => {
          setFiles(selectedFiles.map(file => ({
            file,
            status: 'pending',
            progress: 0,
          })));
        }}
        files={files}
        onRemoveFile={(index) => setFiles(prev => prev.filter((_, i) => i !== index))}
      />

      <Button onClick={handleUpload} disabled={!files.length || !title}>
        Upload Video
      </Button>
    </div>
  );
};
```

## API Integration Examples

### Link Content to Module

After upload, link content to a course module:

```typescript
// API endpoint to implement
async function linkContentToModule(contentId: string, moduleId: string) {
  const response = await client.post(`/api/v2/modules/${moduleId}/content`, {
    contentId,
  });
  return response.data;
}

// Usage
const handleContentUpload = async (contentId: string) => {
  if (moduleId) {
    await linkContentToModule(contentId, moduleId);
    toast({
      title: 'Content linked',
      description: 'Content has been added to the module',
    });
  }
};
```

### Update Lesson with Content

Update a lesson with newly uploaded content:

```typescript
import { useUpdateLesson } from '@/entities/lesson';

const updateLesson = useUpdateLesson();

const handleContentUpload = (contentId: string) => {
  updateLesson.mutate({
    id: lessonId,
    payload: {
      contentId,
      type: 'scorm', // or 'video', 'document'
    },
  });
};
```

## Navigation Patterns

### Pattern 1: Upload and Return

Navigate to uploader, then return to previous page:

```typescript
// From course page
const navigate = useNavigate();

<Button onClick={() => {
  // Store return URL in state or session storage
  sessionStorage.setItem('returnUrl', `/staff/courses/${courseId}`);
  navigate('/staff/courses/content/upload');
}}>
  Add Content
</Button>

// In ContentUploaderPage, after successful upload
const returnUrl = sessionStorage.getItem('returnUrl');
if (returnUrl) {
  navigate(returnUrl);
  sessionStorage.removeItem('returnUrl');
}
```

### Pattern 2: Modal Upload

Show uploader in a modal dialog:

```tsx
import { Dialog } from '@/shared/ui/dialog';
import { QuickContentUploader } from '@/features/content/ui';

const [isUploading, setIsUploading] = React.useState(false);

<Dialog open={isUploading} onOpenChange={setIsUploading}>
  <DialogContent>
    <QuickContentUploader
      type="video"
      onSuccess={(id) => {
        handleContentUploaded(id);
        setIsUploading(false);
      }}
      onCancel={() => setIsUploading(false)}
    />
  </DialogContent>
</Dialog>
```

### Pattern 3: Inline Upload

Embed uploader directly in page:

```tsx
import { FileUploader } from '@/features/content/ui';

<div className="mt-6 border-t pt-6">
  <h3>Upload New Content</h3>
  <FileUploader
    config={scormConfig}
    onFilesSelected={handleFiles}
    files={files}
    onRemoveFile={handleRemove}
  />
</div>
```

## Permissions and Access Control

Check user permissions before showing upload UI:

```typescript
import { useAuth } from '@/entities/user';

const { user, hasPermission } = useAuth();

// Check if user can upload content
const canUploadContent = hasPermission('content:create');

// Conditionally show upload button
{canUploadContent && (
  <Button onClick={() => navigate('/staff/courses/content/upload')}>
    Upload Content
  </Button>
)}
```

## Error Handling

Handle upload errors gracefully:

```typescript
const uploadMedia = useUploadMediaFile({
  onSuccess: (data) => {
    toast({
      title: 'Success',
      description: 'Content uploaded successfully',
    });
  },
  onError: (error) => {
    // Log error for debugging
    console.error('Upload failed:', error);

    // Show user-friendly message
    toast({
      title: 'Upload failed',
      description: error.message || 'Please try again',
      variant: 'destructive',
    });

    // Track error for monitoring
    trackError('content_upload_failed', {
      error: error.message,
      type: 'video',
    });
  },
});
```

## Loading States

Show loading indicators during upload:

```tsx
const [isUploading, setIsUploading] = React.useState(false);

const handleUpload = async () => {
  setIsUploading(true);
  try {
    await uploadContent();
  } finally {
    setIsUploading(false);
  }
};

// Disable UI during upload
<Button disabled={isUploading}>
  {isUploading ? 'Uploading...' : 'Upload'}
</Button>
```

## Best Practices

### 1. Validate Before Upload

```typescript
const validateFile = (file: File) => {
  if (file.size > 100 * 1024 * 1024) {
    toast({
      title: 'File too large',
      description: 'Maximum file size is 100MB',
      variant: 'destructive',
    });
    return false;
  }
  return true;
};
```

### 2. Show Progress Feedback

```typescript
const [progress, setProgress] = React.useState(0);

uploadMedia.mutate({
  payload: { file, title, type },
  onProgress: (percent) => {
    setProgress(percent);
  },
});
```

### 3. Handle Cleanup

```typescript
React.useEffect(() => {
  // Cleanup on unmount
  return () => {
    // Cancel pending uploads
    // Clear temporary data
    // Revoke object URLs
  };
}, []);
```

### 4. Provide User Feedback

```typescript
// Success feedback
toast({
  title: 'Upload complete',
  description: 'Your content has been uploaded',
});

// Error feedback
toast({
  title: 'Upload failed',
  description: 'Please try again',
  variant: 'destructive',
});
```

## Testing Integration

### Test Upload Flow

```typescript
describe('Content Upload Integration', () => {
  it('should navigate to uploader', () => {
    const { getByText } = render(<CourseModule />);
    fireEvent.click(getByText('Add Content'));
    expect(mockNavigate).toHaveBeenCalledWith('/staff/courses/content/upload');
  });

  it('should upload content', async () => {
    const { getByLabelText, getByText } = render(<ContentUploaderPage />);

    const file = new File(['content'], 'test.zip', { type: 'application/zip' });
    const input = getByLabelText('File');

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(getByText('Upload'));

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled();
    });
  });
});
```

## Troubleshooting

### Issue: Upload Not Working

Check:
1. API endpoints are correct
2. Authentication token is valid
3. File size is within limits
4. File type is supported
5. Network connection is stable

### Issue: Progress Not Updating

Check:
1. `onProgress` callback is provided
2. Progress state is updated correctly
3. Progress component receives updated value

### Issue: Content Not Showing in Library

Check:
1. Content status is 'published'
2. Filters are not excluding content
3. API is returning correct data
4. Cache is invalidated after upload

## Support

For issues or questions:
1. Check the README.md in `/src/pages/staff/courses/`
2. Review examples in `/src/features/content/ui/examples.tsx`
3. Check API documentation
4. Contact development team
