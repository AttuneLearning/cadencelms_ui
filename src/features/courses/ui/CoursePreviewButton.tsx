/**
 * Course Preview Button Component
 * Reusable button to navigate to course preview mode
 * Can be used in course management pages, course editors, etc.
 */

import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Eye } from 'lucide-react';

interface CoursePreviewButtonProps {
  courseId: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function CoursePreviewButton({
  courseId,
  variant = 'outline',
  size = 'default',
  showIcon = true,
  children = 'Preview as Learner',
}: CoursePreviewButtonProps) {
  const navigate = useNavigate();

  const handlePreview = () => {
    navigate(`/staff/courses/${courseId}/preview`);
  };

  return (
    <Button variant={variant} size={size} onClick={handlePreview} className="gap-2">
      {showIcon && <Eye className="h-4 w-4" />}
      {children}
    </Button>
  );
}

/**
 * Usage Examples:
 *
 * // Basic usage
 * <CoursePreviewButton courseId={course.id} />
 *
 * // Custom styling
 * <CoursePreviewButton
 *   courseId={course.id}
 *   variant="default"
 *   size="lg"
 * />
 *
 * // Custom text without icon
 * <CoursePreviewButton
 *   courseId={course.id}
 *   showIcon={false}
 * >
 *   View Course
 * </CoursePreviewButton>
 *
 * // As icon button
 * <CoursePreviewButton
 *   courseId={course.id}
 *   size="icon"
 *   variant="ghost"
 * >
 *   <Eye className="h-4 w-4" />
 * </CoursePreviewButton>
 */
