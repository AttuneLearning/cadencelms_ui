export interface DataShapeWarningDetails {
  endpoint?: string;
  method?: string;
  component?: string;
  requestId?: string;
  expected?: string;
  received?: unknown;
}
