/**
 * Report Builder Feature Exports
 */

// State management
export { useReportBuilder } from './lib/useReportBuilder';
export type { ReportBuilderState, ReportBuilderActions } from './lib/useReportBuilder';

// Validation
export {
  validateReportDefinition,
  validateDimension,
  validateMeasure,
  validateFilter,
  dimensionTypeSchema,
  measureTypeSchema,
  aggregationFunctionSchema,
  filterOperatorSchema,
  customReportDefinitionSchema,
} from './lib/reportDefinitionSchema';

export type {
  ValidatedReportDimension,
  ValidatedReportMeasure,
  ValidatedReportSlicer,
  ValidatedReportFilter,
  ValidatedCustomReportDefinition,
} from './lib/reportDefinitionSchema';

// UI Components
export * from './ui';
