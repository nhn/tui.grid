export interface ExportOpt {
  includeHeader?: boolean;
  includeHiddenColumns?: boolean;
  onlySelected?: boolean;
  onlyFiltered?: boolean;
  columnNames?: string[];
  delimiter?: ',' | ';' | '\t' | '|';
  fileName?: string;
}
