/**
 * Content Hooks
 * Barrel export for all content hooks
 */

export {
  // Content overview hooks
  useContents,
  useContent,
  // SCORM package hooks
  useScormPackages,
  useScormPackage,
  useUploadScormPackage,
  useUpdateScormPackage,
  useDeleteScormPackage,
  useLaunchScormPackage,
  usePublishScormPackage,
  useUnpublishScormPackage,
  // Media library hooks
  useMediaFiles,
  useMediaFile,
  useUploadMediaFile,
  useUpdateMediaFile,
  useDeleteMediaFile,
} from '../model/useContent';
