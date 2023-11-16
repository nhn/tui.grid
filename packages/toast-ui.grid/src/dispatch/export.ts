import * as XLSX from 'xlsx';
import { Store } from '@t/store';
import { ExportFormat, OptExport } from '@t/store/export';
import { convertDataToText } from '../helper/common';
import {
  createExportEvent,
  EventParams,
  EventType,
  getHeaderDataFromComplexColumn,
  getNamesAndHeadersOfColumnsByOptions,
  getTargetData,
} from '../query/export';
import { getEventBus } from '../event/eventBus';
import { downloadBlob } from '../helper/browser';

interface Merge {
  // The interface of xlsx library.
  // s: start, e: end, r: row, c: column
  s: {
    r: number;
    c: number;
  };
  e: {
    r: number;
    c: number;
  };
}

function getExportDataAndColumnsAndOptions(store: Store, options?: OptExport) {
  const {
    includeHeader = true,
    includeHiddenColumns = false,
    onlySelected = false,
    onlyFiltered = true,
    delimiter = ',',
    fileName = 'grid-export',
    useFormattedValue = false,
  } = options || {};

  const {
    data: { rawData, filteredRawData },
    column,
    selection: { originalRange },
    exports: { excelCompatibilityMode },
  } = store;

  const {
    targetColumnHeaders: columnHeaders,
    targetColumnNames: columnNames,
  } = getNamesAndHeadersOfColumnsByOptions(
    column,
    options?.columnNames || [],
    includeHiddenColumns,
    onlySelected,
    originalRange
  );

  const data: string[][] = getTargetData(
    store,
    onlyFiltered ? filteredRawData : rawData,
    columnNames,
    onlySelected,
    useFormattedValue
  );

  const exportOptions = {
    includeHeader,
    includeHiddenColumns,
    onlySelected,
    onlyFiltered,
    delimiter,
    fileName,
    columnNames,
  };

  return { data, columnHeaders, columnNames, exportOptions, excelCompatibilityMode };
}

function emitExportEvent(store: Store, eventType: EventType, eventParams: EventParams) {
  const eventBus = getEventBus(store.id);
  const gridEvent = createExportEvent(eventType, eventParams);
  eventBus.trigger(eventType, gridEvent);

  return gridEvent;
}

function getMergeRelationship(complexColumnHeaderData: string[][]) {
  const merges: Merge[] = [];
  const numOfRow = complexColumnHeaderData.length;
  const numOfColumn = complexColumnHeaderData[0].length;

  complexColumnHeaderData.forEach((row, rowIndex) => {
    row.forEach((currentName, colIndex) => {
      if (currentName) {
        const merge: Merge = { s: { r: rowIndex, c: colIndex }, e: { r: rowIndex, c: colIndex } };
        let mergeRowNum, mergeColNum;

        for (mergeRowNum = rowIndex + 1; mergeRowNum < numOfRow; mergeRowNum += 1) {
          if (complexColumnHeaderData[mergeRowNum][colIndex] === currentName) {
            complexColumnHeaderData[mergeRowNum][colIndex] = '';
            merge.e.r += 1;
          } else {
            break;
          }
        }

        for (mergeColNum = colIndex + 1; mergeColNum < numOfColumn; mergeColNum += 1) {
          if (complexColumnHeaderData[mergeRowNum - 1][mergeColNum] === currentName) {
            complexColumnHeaderData[mergeRowNum - 1][mergeColNum] = '';
            merge.e.c += 1;
          } else {
            break;
          }
        }

        complexColumnHeaderData[rowIndex][colIndex] = '';

        if (merge.s.r !== merge.e.r || merge.s.c !== merge.e.c) {
          merges.push(merge);
        }
      }
    });
  });

  return merges;
}

function exportText(format: 'txt' | 'csv', fileName: string, targetText: string) {
  const targetBlob =
    format === 'txt'
      ? new Blob([targetText])
      : new Blob([`\ufeff${targetText}`], { type: 'text/csv;charset=utf-8;' });

  downloadBlob(targetBlob, format, fileName);
}

function exportExcel(
  format: 'xlsx' | 'xls',
  fileName: string,
  targetArray: string[][],
  complexColumnHeaderData: string[][] | null
) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(targetArray);

  if (complexColumnHeaderData) {
    ws['!merges'] = getMergeRelationship(complexColumnHeaderData);
  }

  XLSX.utils.book_append_sheet(wb, ws);
  XLSX.writeFile(wb, `${fileName}.${format}`);
}

function exportCallback(
  data: string[][],
  format: ExportFormat,
  options: OptExport,
  complexHeaderData: string[][] | null
) {
  const { delimiter = ',', fileName = 'grid-export' } = options || {};

  if (format !== 'xlsx' && format !== 'xls') {
    const targetText = convertDataToText(data, delimiter);

    exportText(format, fileName, targetText);
  } else {
    if (!XLSX?.writeFile) {
      // eslint-disable-next-line no-console
      console.error(
        '[tui/grid] - Not found the dependency "xlsx". You should install the "xlsx" to export the data as Excel format'
      );
      return;
    }

    exportExcel(format, fileName, data, complexHeaderData);
  }
}

export function execExport(store: Store, format: ExportFormat, options?: OptExport) {
  const {
    data,
    columnHeaders,
    columnNames,
    exportOptions,
    excelCompatibilityMode,
  } = getExportDataAndColumnsAndOptions(store, options);
  const { includeHeader, delimiter, fileName } = exportOptions;
  const { column } = store;

  if ((format === 'xlsx' || format === 'xls') && !XLSX?.writeFile) {
    // eslint-disable-next-line no-console
    console.error(
      '[tui/grid] - Not found the dependency "xlsx". You should install the "xlsx" to export the data as Excel format'
    );
    return;
  }

  let targetData = data.slice(0);
  let complexHeaderData: string[][] | null = null;

  if (includeHeader) {
    if (column.complexColumnHeaders.length > 0) {
      complexHeaderData = getHeaderDataFromComplexColumn(column, columnNames);
    } else {
      targetData.unshift(columnHeaders);
    }
  }

  if (complexHeaderData && format !== 'csv') {
    targetData = complexHeaderData.concat(targetData);
  }

  const exportFn = (exportingData: string[][]) =>
    exportCallback(exportingData, format, exportOptions, complexHeaderData);

  const gridEvent = emitExportEvent(store, 'beforeExport', {
    exportFormat: format,
    exportOptions,
    data: targetData,
    complexHeaderData,
    exportFn,
  });

  if (gridEvent.isStopped()) {
    return;
  }

  if (format === 'xlsx' || format === 'xls') {
    exportExcel(excelCompatibilityMode ? 'xls' : format, fileName, targetData, complexHeaderData);
  } else {
    const targetText = convertDataToText(targetData, delimiter);

    exportText(format, fileName, targetText);
  }

  emitExportEvent(store, 'afterExport', {
    exportFormat: format,
    exportOptions,
    data: targetData,
    complexHeaderData,
  });
}
