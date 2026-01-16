/**
 * Report Definition Validation Schema
 * Zod schemas for validating custom report definitions
 */

import { z } from 'zod';

// Dimension Type Schema
export const dimensionTypeSchema = z.enum([
  'learner',
  'course',
  'class',
  'department',
  'program',
  'instructor',
  'date',
  'completion-status',
]);

// Measure Type Schema
export const measureTypeSchema = z.enum([
  'count',
  'sum',
  'average',
  'min',
  'max',
  'completion-rate',
  'time-spent',
]);

// Aggregation Function Schema
export const aggregationFunctionSchema = z.enum(['sum', 'avg', 'min', 'max', 'count']);

// Filter Operator Schema
export const filterOperatorSchema = z.enum([
  'eq',
  'ne',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'notIn',
  'contains',
  'startsWith',
  'endsWith',
]);

// Report Dimension Schema
export const reportDimensionSchema = z.object({
  type: dimensionTypeSchema,
  label: z.string().optional(),
  field: z.string().optional(),
  sortBy: z.enum(['asc', 'desc']).optional(),
});

// Report Measure Schema
export const reportMeasureSchema = z.object({
  type: measureTypeSchema,
  label: z.string().optional(),
  field: z.string().optional(),
  aggregation: aggregationFunctionSchema.optional(),
});

// Report Slicer Schema
export const reportSlicerSchema = z.object({
  field: z.string(),
  label: z.string().optional(),
  values: z.array(z.union([z.string(), z.number(), z.boolean()])),
});

// Report Filter Schema
export const reportFilterSchema = z.object({
  field: z.string(),
  operator: filterOperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))]),
});

// Custom Report Definition Schema
export const customReportDefinitionSchema = z
  .object({
    dimensions: z.array(reportDimensionSchema).min(1, 'At least one dimension is required'),
    measures: z.array(reportMeasureSchema).min(1, 'At least one measure is required'),
    slicers: z.array(reportSlicerSchema).optional().default([]),
    groups: z.array(z.string()).optional().default([]),
    filters: z.array(reportFilterSchema).optional().default([]),
  })
  .refine(
    (data) => {
      // Ensure dimension types are unique
      const dimensionTypes = data.dimensions.map((d) => d.type);
      return new Set(dimensionTypes).size === dimensionTypes.length;
    },
    {
      message: 'Dimension types must be unique',
      path: ['dimensions'],
    }
  );

// Export types inferred from schemas
export type DimensionType = z.infer<typeof dimensionTypeSchema>;
export type MeasureType = z.infer<typeof measureTypeSchema>;
export type AggregationFunction = z.infer<typeof aggregationFunctionSchema>;
export type FilterOperator = z.infer<typeof filterOperatorSchema>;
export type ValidatedReportDimension = z.infer<typeof reportDimensionSchema>;
export type ValidatedReportMeasure = z.infer<typeof reportMeasureSchema>;
export type ValidatedReportSlicer = z.infer<typeof reportSlicerSchema>;
export type ValidatedReportFilter = z.infer<typeof reportFilterSchema>;
export type ValidatedCustomReportDefinition = z.infer<typeof customReportDefinitionSchema>;

// Validation helper functions
export function validateReportDefinition(
  definition: unknown
): { success: true; data: ValidatedCustomReportDefinition } | { success: false; errors: string[] } {
  const result = customReportDefinitionSchema.safeParse(definition);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
    return { success: false, errors };
  }
}

export function validateDimension(
  dimension: unknown
): { success: true; data: ValidatedReportDimension } | { success: false; errors: string[] } {
  const result = reportDimensionSchema.safeParse(dimension);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
    return { success: false, errors };
  }
}

export function validateMeasure(
  measure: unknown
): { success: true; data: ValidatedReportMeasure } | { success: false; errors: string[] } {
  const result = reportMeasureSchema.safeParse(measure);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
    return { success: false, errors };
  }
}

export function validateFilter(
  filter: unknown
): { success: true; data: ValidatedReportFilter } | { success: false; errors: string[] } {
  const result = reportFilterSchema.safeParse(filter);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
    return { success: false, errors };
  }
}
