/**
 * Lookup Value types
 */

export interface LookupValue {
  _id: string;
  lookupId: string;
  category: string;
  key: string;
  parentLookupId: string | null;
  displayAs: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  metadata?: {
    isDefault?: boolean;
    icon?: string;
    color?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LookupValuesListResponse {
  values: LookupValue[];
  count: number;
}

export interface LookupValuesFilters {
  category?: string;
  parentLookupId?: string;
  isActive?: boolean;
}
