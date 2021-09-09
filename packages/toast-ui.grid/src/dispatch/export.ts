import { Store } from '@t/store';
import { Column, ColumnInfo, ComplexColumnInfo } from '@t/store/column';
import { Row } from '@t/store/data';
import { OptExport } from '@t/store/export';
import { SelectionRange } from '@t/store/selection';
import { isCheckboxColumn, isDragColumn } from '../helper/column';
import { convertDataToText, convertTextToData, includes } from '../helper/common';
import { createExportEvent, EventParams, EventType } from '../query/export';
import { getEventBus } from '../event/eventBus';
import { getText } from '../query/clipboard';
import { getComplexColumnsHierarchy, convertHierarchyToData } from '../query/column';
import { isSupportMsSaveOrOpenBlob, NavigatorWithMsSaveOrOpenBlob } from '../helper/browser';
import * as XLSX from 'xlsx';

interface Merge {
  s: {
    r: number;
    c: number;
  };
  e: {
    r: number;
    c: number;
  };
}

function removeUnnecessaryColumns(
  hierarchy: (ColumnInfo | ComplexColumnInfo)[][],
  columnNames: string[]
) {
  return hierarchy.filter((colInfos) => includes(columnNames, colInfos[colInfos.length - 1].name));
}

function getComplexHeaderData(column: Column, columnNames: string[]) {
  const hierachy = getComplexColumnsHierarchy(column.allColumns, column.complexColumnHeaders);
  const filteredHierachy = removeUnnecessaryColumns(hierachy, columnNames);

  return convertHierarchyToData(filteredHierachy);
}

function getColumnNamesAndHeadersByOptions(
  column: Column,
  columnNames: string[],
  includeHiddenColumns: boolean,
  onlySelected: boolean,
  originalRange: SelectionRange | null
) {
  const reSort = /\(desc\)|\(asc\)/;
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
          !(isCheckboxColumn(colInfo.name) && isDragColumn(colInfo.name))
      )
      .forEach((colInfo) => {
        targetColumnNames.push(colInfo.name);
        targetColumnHeaders.push(colInfo.header);
      });
  } else {
    targetColumnNames = columnNames.slice(0);

    targetColumnHeaders = allColumns
      .filter((colInfo) => includes(targetColumnNames, colInfo.name))
      .map((colInfo) => colInfo.header.replace(reSort, ''));
  }

  return { targetColumnNames, targetColumnHeaders };
}

function getTargetData(store: Store, rows: Row[], columnNames: string[], onlySelected: boolean) {
  if (onlySelected) {
    const dataText = getText(store);

    if (dataText) {
      return convertTextToData(dataText);
    }
  }

  const data = rows.map((row) => columnNames.map((colName) => row[colName] as string));

  if (columnNames[0] === '_number') {
    data.forEach((row, index) => {
      row[0] = `No.${index + 1}`;
    });
  }

  return data;
}

function emitExportByType(store: Store, eventType: EventType, eventParams: EventParams) {
  const eventBus = getEventBus(store.id);
  const gridEvent = createExportEvent(eventType, eventParams);
  eventBus.trigger(eventType, gridEvent);

  return gridEvent;
}

function getMergeRelationships(complexColumnHeaderData: string[][]) {
  const merges: Merge[] = [];
  const numOfRow = complexColumnHeaderData.length;
  const numOfColumn = complexColumnHeaderData[0].length;

  complexColumnHeaderData.forEach((row, rowIndex) => {
    row.forEach((currentName, colIndex) => {
      const compareColumnName = complexColumnHeaderData[rowIndex][colIndex];

      if (compareColumnName) {
        const merge: Merge = { s: { r: rowIndex, c: colIndex }, e: { r: rowIndex, c: colIndex } };
        let mergeRowNum, mergeColNum;

        for (mergeRowNum = rowIndex + 1; mergeRowNum < numOfRow; mergeRowNum += 1) {
          if (complexColumnHeaderData[mergeRowNum][colIndex] === compareColumnName) {
            complexColumnHeaderData[mergeRowNum][colIndex] = '';
            merge.e.r += 1;
          } else {
            break;
          }
        }

        for (mergeColNum = colIndex + 1; mergeColNum < numOfColumn; mergeColNum += 1) {
          if (complexColumnHeaderData[mergeRowNum - 1][mergeColNum] === compareColumnName) {
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

function exportCsv(fileName: string, targetText: string) {
  const targetBlob = new Blob([targetText], { type: 'text/csv' });

  if (isSupportMsSaveOrOpenBlob()) {
    (window.navigator as NavigatorWithMsSaveOrOpenBlob).msSaveOrOpenBlob(
      targetBlob,
      `${fileName}.csv`
    );
  } else {
    const targetLink = document.createElement('a');

    targetLink.download = `${fileName}.csv`;
    targetLink.href = window.URL.createObjectURL(targetBlob);
    targetLink.click();
  }
}

function exportExcel(
  fileName: string,
  targetArray: string[][],
  complexColumnHeaderData: string[][] | null
) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(targetArray);

  if (complexColumnHeaderData) {
    ws['!merges'] = getMergeRelationships(complexColumnHeaderData);
  }

  XLSX.utils.book_append_sheet(wb, ws);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function execExport(store: Store, format: 'csv' | 'xlsx', options?: OptExport) {
  const {
    includeHeader = true,
    includeHiddenColumns = false,
    onlySelected = false,
    onlyFiltered = true,
    delimiter = ',',
    fileName = 'grid-export',
  } = options || {};

  const {
    data: { rawData, filteredRawData },
    column,
    selection: { originalRange },
  } = store;

  const { complexColumnHeaders } = column;

  const {
    targetColumnHeaders: columnHeaders,
    targetColumnNames: columnNames,
  } = getColumnNamesAndHeadersByOptions(
    column,
    options?.columnNames || [],
    includeHiddenColumns,
    onlySelected,
    originalRange
  );

  let targetData: string[][] = getTargetData(
    store,
    onlyFiltered ? filteredRawData : rawData,
    columnNames,
    onlySelected
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

  if (format === 'csv') {
    if (includeHeader && complexColumnHeaders.length === 0) {
      targetData.unshift(columnHeaders);
    }

    const gridEvent = emitExportByType(store, 'beforeExport', {
      exportFormat: format,
      exportOptions,
      data: targetData,
    });

    if (gridEvent.isStopped()) {
      return;
    }

    const targetText = convertDataToText(targetData, delimiter);

    exportCsv(fileName, targetText);
  } else {
    if (!XLSX.writeFile) {
      console.error('Not found dependency "xlsx"');
      return;
    }

    let complexHeaderData = null;

    if (includeHeader) {
      if (column.complexColumnHeaders.length > 0) {
        complexHeaderData = getComplexHeaderData(column, columnNames);

        targetData = complexHeaderData.concat(targetData);
      } else {
        targetData.unshift(columnHeaders);
      }
    }

    const gridEvent = emitExportByType(store, 'beforeExport', {
      exportFormat: format,
      exportOptions,
      data: targetData,
    });

    if (gridEvent.isStopped()) {
      return;
    }

    exportExcel(fileName, targetData, complexHeaderData);
  }

  emitExportByType(store, 'beforeExport', {
    exportFormat: format,
    exportOptions,
    data: targetData,
  });
}
