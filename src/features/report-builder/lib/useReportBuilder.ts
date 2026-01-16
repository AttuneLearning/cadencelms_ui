/**
 * useReportBuilder Hook
 * State management for custom report builder
 */

import { useState, useCallback } from 'react';
import type {
  CustomReportDefinition,
  ReportDimension,
  ReportMeasure,
  ReportSlicer,
  ReportFilter,
} from '@/shared/types/report-builder';
import type { ReportOutputFormat } from '@/shared/types/report-builder';

export interface ReportBuilderState {
  definition: CustomReportDefinition;
  outputFormat: ReportOutputFormat;
  templateName: string;
  templateDescription: string;
  isValid: boolean;
  errors: string[];
}

export interface ReportBuilderActions {
  addDimension: (dimension: ReportDimension) => void;
  removeDimension: (index: number) => void;
  updateDimension: (index: number, dimension: ReportDimension) => void;
  addMeasure: (measure: ReportMeasure) => void;
  removeMeasure: (index: number) => void;
  updateMeasure: (index: number, measure: ReportMeasure) => void;
  addSlicer: (slicer: ReportSlicer) => void;
  removeSlicer: (index: number) => void;
  updateSlicer: (index: number, slicer: ReportSlicer) => void;
  addGroup: (group: string) => void;
  removeGroup: (index: number) => void;
  addFilter: (filter: ReportFilter) => void;
  removeFilter: (index: number) => void;
  updateFilter: (index: number, filter: ReportFilter) => void;
  setOutputFormat: (format: ReportOutputFormat) => void;
  setTemplateName: (name: string) => void;
  setTemplateDescription: (description: string) => void;
  reset: () => void;
  loadDefinition: (definition: CustomReportDefinition) => void;
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
    definition.dimensions.forEach((dim, index) => {
      if (!dim.type) {
        errors.push(`Dimension ${index + 1} is missing a type`);
      }
    });

    // Validate measure types
    definition.measures.forEach((measure, index) => {
      if (!measure.type) {
        errors.push(`Measure ${index + 1} is missing a type`);
      }
    });

    // Validate filters
    definition.filters?.forEach((filter, index) => {
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

  const addDimension = useCallback((dimension: ReportDimension) => {
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
        dimensions: prev.definition.dimensions.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const updateDimension = useCallback((index: number, dimension: ReportDimension) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        dimensions: prev.definition.dimensions.map((d, i) => (i === index ? dimension : d)),
      },
    }));
  }, []);

  const addMeasure = useCallback((measure: ReportMeasure) => {
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
        measures: prev.definition.measures.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const updateMeasure = useCallback((index: number, measure: ReportMeasure) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        measures: prev.definition.measures.map((m, i) => (i === index ? measure : m)),
      },
    }));
  }, []);

  const addSlicer = useCallback((slicer: ReportSlicer) => {
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
        slicers: (prev.definition.slicers || []).filter((_, i) => i !== index),
      },
    }));
  }, []);

  const updateSlicer = useCallback((index: number, slicer: ReportSlicer) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        slicers: (prev.definition.slicers || []).map((s, i) => (i === index ? slicer : s)),
      },
    }));
  }, []);

  const addGroup = useCallback((group: string) => {
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
        groups: (prev.definition.groups || []).filter((_, i) => i !== index),
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
        filters: (prev.definition.filters || []).filter((_, i) => i !== index),
      },
    }));
  }, []);

  const updateFilter = useCallback((index: number, filter: ReportFilter) => {
    setState((prev) => ({
      ...prev,
      definition: {
        ...prev.definition,
        filters: (prev.definition.filters || []).map((f, i) => (i === index ? filter : f)),
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

  const loadDefinition = useCallback((definition: CustomReportDefinition) => {
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
