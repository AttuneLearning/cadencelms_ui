/**
 * useReportBuilder Hook
 * State management for custom report builder
 */

import { useState, useCallback } from 'react';
import type {
  ReportDefinition,
  DimensionConfig,
  MeasureConfig,
  SlicerConfig,
  GroupConfig,
  ReportFilter,
  ReportOutputFormat,
} from '@/shared/types/report-builder';

// Extended report definition for builder that includes filters
interface BuilderReportDefinition extends ReportDefinition {
  filters?: ReportFilter[];
}

export interface ReportBuilderState {
  definition: BuilderReportDefinition;
  outputFormat: ReportOutputFormat;
  templateName: string;
  templateDescription: string;
  isValid: boolean;
  errors: string[];
}

export interface ReportBuilderActions {
  addDimension: (dimension: DimensionConfig) => void;
  removeDimension: (index: number) => void;
  updateDimension: (index: number, dimension: DimensionConfig) => void;
  addMeasure: (measure: MeasureConfig) => void;
  removeMeasure: (index: number) => void;
  updateMeasure: (index: number, measure: MeasureConfig) => void;
  addSlicer: (slicer: SlicerConfig) => void;
  removeSlicer: (index: number) => void;
  updateSlicer: (index: number, slicer: SlicerConfig) => void;
  addGroup: (group: GroupConfig) => void;
  removeGroup: (index: number) => void;
  addFilter: (filter: ReportFilter) => void;
  removeFilter: (index: number) => void;
  updateFilter: (index: number, filter: ReportFilter) => void;
  setOutputFormat: (format: ReportOutputFormat) => void;
  setTemplateName: (name: string) => void;
  setTemplateDescription: (description: string) => void;
  reset: () => void;
  loadDefinition: (definition: BuilderReportDefinition) => void;
  validate: () => boolean;
}

const initialState: ReportBuilderState = {
  definition: {
    dimensions: [],
    measures: [],
    slicers: [],
    groups: [],
    filters: [],
  },
  outputFormat: 'excel',
  templateName: '',
  templateDescription: '',
  isValid: false,
  errors: [],
};

export function useReportBuilder(): ReportBuilderState & ReportBuilderActions {
  const [state, setState] = useState<ReportBuilderState>(initialState);

  const validate = useCallback((): boolean => {
    const errors: string[] = [];
    const { definition } = state;

    // Must have at least one dimension
    if (definition.dimensions.length === 0) {
      errors.push('At least one dimension is required');
    }

    // Must have at least one measure
    if (definition.measures.length === 0) {
      errors.push('At least one measure is required');
    }

    // Validate dimension types
    definition.dimensions.forEach((dim: DimensionConfig, index: number) => {
      if (!dim.type) {
        errors.push(`Dimension ${index + 1} is missing a type`);
      }
    });

    // Validate measure types
    definition.measures.forEach((measure: MeasureConfig, index: number) => {
      if (!measure.type) {
        errors.push(`Measure ${index + 1} is missing a type`);
      }
    });

    // Validate filters
    definition.filters?.forEach((filter: ReportFilter, index: number) => {
      if (!filter.field) {
        errors.push(`Filter ${index + 1} is missing a field`);
      }
      if (!filter.operator) {
        errors.push(`Filter ${index + 1} is missing an operator`);
      }
      if (filter.value === undefined || filter.value === null) {
        errors.push(`Filter ${index + 1} is missing a value`);
      }
    });

    const isValid = errors.length === 0;

    setState((prev) => ({
      ...prev,
      isValid,
      errors,
    }));

    return isValid;
  }, [state]);

  const addDimension = useCallback((dimension: DimensionConfig) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        dimensions: [...prev.definition.dimensions, dimension],
      },
    }));
  }, []);

  const removeDimension = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        dimensions: prev.definition.dimensions.filter((_: DimensionConfig, i: number) => i !== index),
      },
    }));
  }, []);

  const updateDimension = useCallback((index: number, dimension: DimensionConfig) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        dimensions: prev.definition.dimensions.map((d: DimensionConfig, i: number) => (i === index ? dimension : d)),
      },
    }));
  }, []);

  const addMeasure = useCallback((measure: MeasureConfig) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        measures: [...prev.definition.measures, measure],
      },
    }));
  }, []);

  const removeMeasure = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        measures: prev.definition.measures.filter((_: MeasureConfig, i: number) => i !== index),
      },
    }));
  }, []);

  const updateMeasure = useCallback((index: number, measure: MeasureConfig) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        measures: prev.definition.measures.map((m: MeasureConfig, i: number) => (i === index ? measure : m)),
      },
    }));
  }, []);

  const addSlicer = useCallback((slicer: SlicerConfig) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        slicers: [...(prev.definition.slicers || []), slicer],
      },
    }));
  }, []);

  const removeSlicer = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        slicers: (prev.definition.slicers || []).filter((_: SlicerConfig, i: number) => i !== index),
      },
    }));
  }, []);

  const updateSlicer = useCallback((index: number, slicer: SlicerConfig) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        slicers: (prev.definition.slicers || []).map((s: SlicerConfig, i: number) => (i === index ? slicer : s)),
      },
    }));
  }, []);

  const addGroup = useCallback((group: GroupConfig) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        groups: [...(prev.definition.groups || []), group],
      },
    }));
  }, []);

  const removeGroup = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        groups: (prev.definition.groups || []).filter((_: GroupConfig, i: number) => i !== index),
      },
    }));
  }, []);

  const addFilter = useCallback((filter: ReportFilter) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        filters: [...(prev.definition.filters || []), filter],
      },
    }));
  }, []);

  const removeFilter = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        filters: (prev.definition.filters || []).filter((_: ReportFilter, i: number) => i !== index),
      },
    }));
  }, []);

  const updateFilter = useCallback((index: number, filter: ReportFilter) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        filters: (prev.definition.filters || []).map((f: ReportFilter, i: number) => (i === index ? filter : f)),
      },
    }));
  }, []);

  const setOutputFormat = useCallback((format: ReportOutputFormat) => {
    setState((prev) => ({
      ...prev,
      outputFormat: format,
    }));
  }, []);

  const setTemplateName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      templateName: name,
    }));
  }, []);

  const setTemplateDescription = useCallback((description: string) => {
    setState((prev) => ({
      ...prev,
      templateDescription: description,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const loadDefinition = useCallback((definition: BuilderReportDefinition) => {
    setState((prev) => ({
      ...prev,
      definition,
    }));
  }, []);

  return {
    ...state,
    addDimension,
    removeDimension,
    updateDimension,
    addMeasure,
    removeMeasure,
    updateMeasure,
    addSlicer,
    removeSlicer,
    updateSlicer,
    addGroup,
    removeGroup,
    addFilter,
    removeFilter,
    updateFilter,
    setOutputFormat,
    setTemplateName,
    setTemplateDescription,
    reset,
    loadDefinition,
    validate,
  };
}
