/**
 * Department-scoped course creation page
 * Wraps CourseEditorPage with department pre-filled from URL
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { useDepartmentContext } from '@/shared/hooks/useDepartmentContext';
import { CourseEditorPage } from '@/pages/staff/courses/CourseEditorPage';

export const DepartmentCreateCoursePage: React.FC = () => {
  const { deptId } = useParams<{ deptId: string }>();
  const { currentDepartmentId, switchDepartment, isSwitching } = useDepartmentContext();

  // Track if this is initial mount to distinguish from user clearing selection
  const isInitialMountRef = React.useRef(true);

  // Ensure we're in the right department context
  React.useEffect(() => {
    if (deptId && currentDepartmentId !== deptId && !isSwitching) {
      // Don't auto-switch if user explicitly cleared selection (currentDepartmentId is null)
      if (currentDepartmentId === null && !isInitialMountRef.current) {
        return;
      }
      switchDepartment(deptId);
    }
    isInitialMountRef.current = false;
  }, [deptId, currentDepartmentId, switchDepartment, isSwitching]);

  // Pass deptId to CourseEditorPage for pre-filling
  return <CourseEditorPage defaultDepartmentId={deptId} />;
};

export default DepartmentCreateCoursePage;
