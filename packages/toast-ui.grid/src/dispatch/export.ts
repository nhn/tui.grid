import { Store } from '@t/store';
import { Column, ColumnInfo, ComplexColumnInfo } from '@t/store/column';
import { Row } from '@t/store/data';
import { ExportOpt } from '@t/store/export';
import { SelectionRange } from '@t/store/selection';
import { isCheckboxOrDragColumn } from '../helper/column';
import { convertDataToText, convertTextToData, includes } from '../helper/common';
import { getText } from '../query/clipboard';
import { getComplexColumnsHierarchy, convertHierarchyToData } from '../query/column';
import {
  isSupportWindowNavigatorMsSaveOrOpenBlob,
  NavigatorWithMsSaveOrOpenBlob,
} from '../helper/browser';
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
  let hierachy = getComplexColumnsHierarchy(column.allColumns, column.complexColumnHeaders);
  hierachy = removeUnnecessaryColumns(hierachy, columnNames);

  return convertHierarchyToData(hierachy, 'header');
}

function getColumnNamesAndHeaders(
  column: Column,
  columnNames: string[],
  includeHiddenColumns: boolean,
  onlySelected: boolean,
  originalRange: SelectionRange | null
) {
  const sortExp = /\(desc\)|\(asc\)/;
  if (onlySelected && originalRange) {
    const [start, end] = originalRange.column;

    columnNames = column.allColumns
      .filter((colInfo) => includeHiddenColumns || !colInfo.hidden)
      .slice(start, end + 1)
      .map((colInfo) => colInfo.name);
  } else if (columnNames.length === 0) {
    columnNames = column.allColumns
      .filter(
        (colInfo) =>
          (includeHiddenColumns || !colInfo.hidden) && !isCheckboxOrDragColumn(colInfo.name)
      )
      .map((colInfo) => colInfo.name);
  }

  const columnHeaders = column.allColumns
    .filter((colInfo) => includes(columnNames, colInfo.name))
    .map((colInfo) => colInfo.header.replace(sortExp, ''));

  return { columnNames, columnHeaders };
}

function getTargetData(store: Store, rows: Row[], columnNames: string[], onlySelected: boolean) {
  if (onlySelected) {
    return convertTextToData(getText(store));
  }

  const data = rows.map((row) => columnNames.map((colName) => row[colName]));

  if (columnNames[0] === '_number') {
    data.forEach((row, index) => {
      row[0] = `No.${index + 1}`;
    });
  }

  return data;
}

function getMergeObject(complexColumnHeaderData: string[][]) {
  const merges: Merge[] = [];
  const numOfRow = complexColumnHeaderData.length;
  const numOfColumn = complexColumnHeaderData[0].length;

  complexColumnHeaderData.forEach((row, rowIndex) => {
    row.forEach((currentName, colIndex) => {
      const compareColumnName = complexColumnHeaderData[rowIndex][colIndex];

      if (compareColumnName !== '') {
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

        if (!(merge.s.r === merge.e.r && merge.s.c === merge.e.c)) {
          merges.push(merge);
        }
      }
    });
  });

  return merges;
}

export function exportCsv(fileName: string, targetText: string) {
  const targetBlob = new Blob([targetText], { type: 'text/csv' });

  if (isSupportWindowNavigatorMsSaveOrOpenBlob()) {
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

export function exportExcel(
  fileName: string,
  targetArray: string[][],
  complexColumnHeaderData: string[][] | null
) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(targetArray);

  if (complexColumnHeaderData) {
    ws['!merges'] = getMergeObject(complexColumnHeaderData);
  }

  XLSX.utils.book_append_sheet(wb, ws);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function execExport(store: Store, format: string, options?: ExportOpt) {
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

  const { columnHeaders, columnNames } = getColumnNamesAndHeaders(
    column,
    options?.columnNames || [],
    includeHiddenColumns,
    onlySelected,
    originalRange
  );

  let targetData: any[][] = getTargetData(
    store,
    onlyFiltered ? filteredRawData : rawData,
    columnNames,
    onlySelected
  );

  if (format === 'csv') {
    if (includeHeader && column.complexColumnHeaders.length === 0) {
      targetData.unshift(columnHeaders);
    }
    const targetText = convertDataToText(targetData, delimiter);

    exportCsv(fileName, targetText);
  } else if (format === 'xlsx') {
    let complexHeaderData = null;

    if (includeHeader) {
      if (column.complexColumnHeaders.length > 0) {
        complexHeaderData = getComplexHeaderData(column, columnNames);

        targetData = complexHeaderData.concat(targetData);
      } else {
        targetData.unshift(columnHeaders);
      }
    }

    if (!XLSX) {
      console.error('Not found dependency "xlsx"');
    } else {
      exportExcel(fileName, targetData, complexHeaderData);
    }
  }
}
