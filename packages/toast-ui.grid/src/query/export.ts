import { GridEventProps } from '@t/event';
import { Column, ColumnInfo, ComplexColumnInfo } from '@t/store/column';
import { ExportFormat, OptExport } from '@t/store/export';
import { SelectionRange } from '@t/store/selection';
import { Store } from '@t/store';
import { Row } from '@t/store/data';
import { isCheckboxColumn, isDragColumn, isRowNumColumn } from '../helper/column';
import { includes } from '../helper/common';
import GridEvent from '../event/gridEvent';
import { convertHierarchyToData, getComplexColumnsHierarchy } from './column';
import { createFormattedValue } from '../store/helper/data';
import { Dictionary } from '@t/options';

export type EventType = 'beforeExport' | 'afterExport';

export interface EventParams {
  exportFormat: ExportFormat;
  exportOptions: OptExport;
  data: string[][];
  exportFn?: (data: string[][]) => void;
  complexHeaderData: string[][] | null;
}

function getColumnInfoDictionary(store: Store, columnNames: string[]) {
  const columnInfos: Dictionary<ColumnInfo> = {};

  store.column.allColumns.forEach((columnInfo) => {
    if (includes(columnNames, columnInfo.name)) {
      columnInfos[columnInfo.name] = columnInfo;
    }
  });

  return columnInfos;
}

function getValue(
  row: Row,
  columnInfos: Dictionary<ColumnInfo>,
  columName: string,
  useFormattedValue: boolean,
  index?: number
) {
  if (isRowNumColumn(columName)) {
    return `No.${index! + 1}`;
  }

  const originalValue = row[columName];
  const formattedValue = createFormattedValue(row, columnInfos[columName]);

  return useFormattedValue && String(originalValue) !== formattedValue
    ? formattedValue
    : (originalValue as string);
}

export function createExportEvent(eventType: EventType, eventParams: EventParams) {
  const { exportFormat, exportOptions, data, complexHeaderData, exportFn } = eventParams;
  let props: GridEventProps = {};

  switch (eventType) {
    /**
     * Occurs before export
     * @event Grid#beforeExport
     * @property {'txt' | 'csv' | 'xlsx' | 'xls'} exportFormat - Export format
     * @property {Object} exportOptions - Used export options
     *    @property {boolean} exportOptions.includeHeader - Whether to include headers
     *    @property {boolean} exportOptions.includeHiddenColumns - Whether to include hidden columns
     *    @property {string[]} exportOptions.columnNames - Columns names to export
     *    @property {boolean} exportOptions.onlySelected - Whether to export only the selected range
     *    @property {boolean} exportOptions.onlyFiltered - Whether to export only the filtered data
     *    @property {','|';'|'\t'|'|'} exportOptions.delimiter - Delimiter to export CSV
     *    @property {string} exportOptions.fileName - File name to export
     * @property {string[][]} data - Data to be finally exported
     * @property {string[][] | null} complexHeaderData - Complex header data. If you don't use complexHeader, it'll be null.
     * @property {function} exportFn - Callback function to export modified data
     * @property {Grid} instance - Current grid instance
     */
    case 'beforeExport':
      props = { exportFormat, exportOptions, data, complexHeaderData, exportFn };
      break;
    /**
     * Occurs after export
     * @event Grid#afterExport
     * @property {'txt' | 'csv' | 'xlsx' | 'xls'} exportFormat - Export format
     * @property {Object} exportOptions - Used export options
     *    @property {boolean} exportOptions.includeHeader - Whether to include headers
     *    @property {boolean} exportOptions.includeHiddenColumns - Whether to include hidden columns
     *    @property {string[]} exportOptions.columnNames - Columns names to export
     *    @property {boolean} exportOptions.onlySelected - Whether to export only the selected range
     *    @property {boolean} exportOptions.onlyFiltered - Whether to export only the filtered data
     *    @property {','|';'|'\t'|'|'} exportOptions.delimiter - Delimiter to export CSV
     *    @property {string} exportOptions.fileName - File name to export
     * @property {string[][]} data - Data to be finally exported
     * @property {string[][] | null} complexHeaderData - Complex header data. If you don't use complexHeader, it'll be null.
     * @property {Grid} instance - Current grid instance
     */
    case 'afterExport':
      props = { exportFormat, exportOptions, data, complexHeaderData };
      break;
    default: // do nothing
  }

  return new GridEvent(props);
}

export function getNamesAndHeadersOfColumnsByOptions(
  column: Column,
  columnNames: string[],
  includeHiddenColumns: boolean,
  onlySelected: boolean,
  originalRange: SelectionRange | null
) {
  const regSort = /\(desc\)|\(asc\)/;
  const { allColumns } = column;

  let targetColumnNames: string[] = [];
  let targetColumnHeaders: string[] = [];

  if (onlySelected && originalRange) {
    const [start, end] = originalRange.column;

    allColumns
      .filter((colInfo) => includeHiddenColumns || !colInfo.hidden)
      .slice(start, end + 1)
      .forEach((colInfo) => {
        targetColumnNames.push(colInfo.name);
        targetColumnHeaders.push(colInfo.header);
      });
  } else if (columnNames.length === 0) {
    allColumns
      .filter(
        (colInfo) =>
          (includeHiddenColumns || !colInfo.hidden) &&
          !(isCheckboxColumn(colInfo.name) || isDragColumn(colInfo.name))
      )
      .forEach((colInfo) => {
        targetColumnNames.push(colInfo.name);
        targetColumnHeaders.push(colInfo.header);
      });
  } else {
    targetColumnNames = columnNames.slice(0);

    targetColumnHeaders = allColumns
      .filter((colInfo) => includes(targetColumnNames, colInfo.name))
      .map((colInfo) => colInfo.header.replace(regSort, ''));
  }

  return { targetColumnNames, targetColumnHeaders };
}

export function removeUnnecessaryColumns(
  hierarchy: (ColumnInfo | ComplexColumnInfo)[][],
  columnNames: string[]
) {
  return hierarchy.filter((colInfos) => includes(columnNames, colInfos[colInfos.length - 1].name));
}

export function getHeaderDataFromComplexColumn(column: Column, columnNames: string[]) {
  const hierarchy = getComplexColumnsHierarchy(column.allColumns, column.complexColumnHeaders);
  const filteredHierarchy = removeUnnecessaryColumns(hierarchy, columnNames);

  return convertHierarchyToData(filteredHierarchy);
}

export function getTargetData(
  store: Store,
  rows: Row[],
  columnNames: string[],
  onlySelected: boolean,
  useFormattedValue: boolean
) {
  const columnInfoDictionary = getColumnInfoDictionary(store, columnNames);
  const {
    selection: { originalRange },
  } = store;

  let targetRows = rows;

  if (onlySelected && originalRange) {
    const [rowStart, rowEnd] = originalRange.row;
    targetRows = rows.slice(rowStart, rowEnd + 1);
  }

  return targetRows.map((row, index) =>
    columnNames.map((colName) =>
      getValue(row, columnInfoDictionary, colName, useFormattedValue, index)
    )
  );
}
