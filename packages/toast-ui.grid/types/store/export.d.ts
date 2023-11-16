export interface OptExport {
  includeHeader?: boolean;
  includeHiddenColumns?: boolean;
  onlySelected?: boolean;
  onlyFiltered?: boolean;
  columnNames?: string[];
  delimiter?: ',' | ';' | '\t' | '|';
  fileName?: string;
  useFormattedValue?: boolean;
}

export type ExportFormat = 'txt' | 'csv' | 'xlsx' | 'xls';

export interface Exports {
  excelCompatibilityMode?: boolean;
}
