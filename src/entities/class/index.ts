/**
 * Class Entity
 * Public exports for the class entity
 */

// Types
export type {
  Class,
  ClassListItem,
  CreateClassPayload,
  UpdateClassPayload,
  ClassFilters,
  ClassStatus,
  InstructorRole,
  EnrollmentStatus,
  ClassInstructor,
  InstructorAssignment,
  ClassCourse,
  ClassProgram,
  ClassProgramLevel,
  ClassAcademicTerm,
  ClassDepartment,
  ClassLearner,
  ClassesListResponse,
  ClassEnrollment,
  EnrollLearnersPayload,
  EnrollmentResult,
  ClassRoster,
  RosterItem,
  LearnerProgress,
  LearnerAttendance,
  ClassProgress,
  ModuleProgress,
  ProgressDistribution,
  ScoreDistribution,
  ClassStats,
  ClassPagination,
  ClassEnrollmentsResponse,
  DeleteClassResponse,
  DropEnrollmentResponse,
} from './model/types';

// Query Keys
export { classKeys } from './model/classKeys';

// Hooks
export {
  useClasses,
  useClass,
  useClassRoster,
  useClassEnrollments,
  useClassProgress,
  useClassStats,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
  useEnrollLearners,
  useDropLearner,
} from './model/useClass';

// API Functions
export {
  listClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  getClassRoster,
  addLearnersToClass,
  removeLearnerFromClass,
  getClassProgress,
  getClassEnrollments,
  getClassStats,
} from './api/classApi';

// UI Components
export { ClassCard } from './ui/ClassCard';
export { ClassList } from './ui/ClassList';
export { ClassForm } from './ui/ClassForm';
