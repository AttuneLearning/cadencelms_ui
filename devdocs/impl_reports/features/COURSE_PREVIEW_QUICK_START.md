# Course Preview - Quick Start Guide

## 🚀 Get Started in 30 Seconds

### Step 1: Add a Preview Button
In any course management page, add:

```typescript
import { CoursePreviewButton } from '@/features/courses/ui';

<CoursePreviewButton courseId={course.id} />
```

### Step 2: Navigate to Preview
Staff can now click the button to see the learner experience!

## 📍 Routes

| Route | Purpose |
|-------|---------|
| `/staff/courses/:courseId/preview` | Course overview |
| `/staff/courses/:courseId/preview/:moduleId` | Specific module |

## 🎯 What Staff Will See

1. **Preview Mode Banner** - Clear indication they're in preview mode
2. **Course Overview** - Title, description, instructors, settings
3. **Module List** - Sidebar with all course modules
4. **Content Preview** - SCORM, video, document, and quiz previews
5. **Progress Simulation** - See how learner progress tracking works
6. **Navigation** - Previous/Next buttons, module selection

## 🔧 Components Available

### CoursePreviewButton
```typescript
// Basic usage
<CoursePreviewButton courseId={courseId} />

// Custom styling
<CoursePreviewButton
  courseId={courseId}
  variant="default"
  size="lg"
/>

// Icon only
<CoursePreviewButton
  courseId={courseId}
  size="icon"
>
  <Eye className="h-4 w-4" />
</CoursePreviewButton>
```

### CourseNavigation
```typescript
import { CourseNavigation } from '@/features/courses/ui';

<CourseNavigation
  modules={modules}
  currentModuleId={currentId}
  onModuleClick={handleClick}
  simulatedProgress={progress}
/>
```

### LessonPlayerPreview
```typescript
import { LessonPlayerPreview } from '@/features/courses/ui';

<LessonPlayerPreview
  module={module}
  onPrevious={handlePrev}
  onNext={handleNext}
  hasPrevious={true}
  hasNext={true}
/>
```

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| `COURSE_PREVIEW_README.md` | Complete feature documentation |
| `INTEGRATION_EXAMPLES.md` | 12+ code examples |
| `COURSE_PREVIEW_FEATURE.md` | Technical architecture |
| `COURSE_PREVIEW_COMPLETION.md` | Implementation summary |

## 🎨 Customization

### Change Button Text
```typescript
<CoursePreviewButton courseId={courseId}>
  View as Student
</CoursePreviewButton>
```

### Add to Dropdown Menu
```typescript
<DropdownMenuItem onClick={() => navigate(`/staff/courses/${courseId}/preview`)}>
  <Eye className="h-4 w-4 mr-2" />
  Preview Course
</DropdownMenuItem>
```

### Custom Navigation
```typescript
const navigate = useNavigate();

// Go to course overview
navigate(`/staff/courses/${courseId}/preview`);

// Go to specific module
navigate(`/staff/courses/${courseId}/preview/${moduleId}`);
```

## ✅ Checklist for Integration

- [ ] Import CoursePreviewButton component
- [ ] Add button to course management page
- [ ] Test preview navigation
- [ ] Verify all content types preview correctly
- [ ] Test on mobile devices
- [ ] Add to course editor toolbar (optional)
- [ ] Add analytics tracking (optional)

## 🐛 Troubleshooting

### Preview button not working?
- Check that courseId is valid
- Verify route is configured in routing/index.tsx
- Check browser console for errors

### Module not loading?
- Verify course has modules
- Check API endpoints are working
- Ensure course data is being fetched

### Styling issues?
- Verify Tailwind CSS is configured
- Check shadcn/ui components are installed
- Ensure global styles are imported

## 💡 Tips

1. **Test Early**: Add preview button during course creation
2. **Use in Editor**: Add to course editor toolbar for quick testing
3. **Share with Team**: Show instructors how their course will look
4. **Check Mobile**: Preview is responsive, test on phones
5. **Track Usage**: Add analytics to understand staff needs

## 🎯 Common Use Cases

### 1. Course Management List
```typescript
{courses.map(course => (
  <Card key={course.id}>
    <CardHeader>{course.title}</CardHeader>
    <CardFooter>
      <Button>Edit</Button>
      <CoursePreviewButton courseId={course.id} />
    </CardFooter>
  </Card>
))}
```

### 2. Course Editor Toolbar
```typescript
<div className="flex gap-2">
  <Button onClick={handleSave}>Save</Button>
  <CoursePreviewButton courseId={courseId} />
  <Button>Publish</Button>
</div>
```

### 3. After Publishing
```typescript
const handlePublish = async () => {
  await publishCourse(courseId);
  toast({
    title: "Course Published!",
    action: <CoursePreviewButton courseId={courseId} size="sm" />
  });
};
```

## 📚 Learn More

- Read `COURSE_PREVIEW_README.md` for complete documentation
- Check `INTEGRATION_EXAMPLES.md` for 12+ examples
- Review `COURSE_PREVIEW_FEATURE.md` for technical details

## 🆘 Need Help?

1. Check documentation files
2. Review integration examples
3. Look at component prop types
4. Test with sample course data
5. Check browser console

## 🎉 Ready to Go!

The Course Preview feature is production-ready and waiting for you to integrate it into your course management pages. Start with a simple `CoursePreviewButton` and you're good to go!

---

**Version**: 1.0.0
**Last Updated**: January 9, 2026
**Status**: Production Ready ✅
