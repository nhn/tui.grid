/* eslint-disable max-depth */
import { Store } from '@t/store';
import { Column, ColumnInfo, ComplexColumnInfo } from '@t/store/column';
import { Row } from '@t/store/data';
import { ExportOpt } from '@t/store/export';
import { SelectionRange } from '@t/store/selection';
import { isRowHeader } from '../helper/column';
import { convertDataToText, convertTextToData } from '../helper/common';
import { getText } from '../query/clipboard';
import { getComplexColumnsHierarchy, convertHierarchyToData } from '../query/column';
import { isIE9 } from '../helper/browser';
import * as XLSX from 'xlsx';

function removeUnnecessaryColumns(
  hierarchy: (ColumnInfo | ComplexColumnInfo)[][],
  columnNames: string[]
) {
  return hierarchy.filter((colInfos) => {
    return columnNames.indexOf(colInfos[colInfos.length - 1].name) !== -1;
  });
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
      .filter((colInfo) => (includeHiddenColumns || !colInfo.hidden) && !isRowHeader(colInfo.name))
      .map((colInfo) => colInfo.name);
  }

  const columnHeaders = column.allColumns
    .filter((colInfo) => columnNames.indexOf(colInfo.name) !== -1)
    .map((colInfo) => colInfo.header.replace(sortExp, ''));

  return { columnNames, columnHeaders };
}

function getTargetData(store: Store, rows: Row[], columnNames: string[], onlySelected: boolean) {
  return onlySelected
    ? convertTextToData(getText(store))
    : rows.map((row) => columnNames.map((colName) => row[colName]));
}

function getMergeObject(complexColumnHeaderData: string[][]) {
  const merges = [];
  const isMergedCell = complexColumnHeaderData.map((row) => row.map(() => false));
  const numOfRow = isMergedCell.length;
  const numOfColumn = isMergedCell[0].length;

  for (let rowNum = 0; rowNum < numOfRow; rowNum += 1) {
    for (let colNum = 0; colNum < numOfColumn; colNum += 1) {
      if (!isMergedCell[rowNum][colNum]) {
        const merge = { s: { r: rowNum, c: colNum }, e: { r: rowNum, c: colNum } };
        let mergeRowNum, mergeColNum;

        for (mergeRowNum = rowNum + 1; mergeRowNum < numOfRow; mergeRowNum += 1) {
          if (
            complexColumnHeaderData[mergeRowNum][colNum] ===
            complexColumnHeaderData[mergeRowNum - 1][colNum]
          ) {
            merge.e.r += 1;
          } else {
            break;
          }
        }

        for (mergeColNum = colNum + 1; mergeColNum < numOfColumn; mergeColNum += 1) {
          if (
            complexColumnHeaderData[mergeRowNum - 1][mergeColNum] ===
            complexColumnHeaderData[mergeRowNum - 1][mergeColNum - 1]
          ) {
            merge.e.c += 1;
          } else {
            break;
          }
        }

        for (let mergedRowNum = merge.s.r; mergedRowNum < merge.e.r + 1; mergedRowNum += 1) {
          for (let mergedColNum = merge.s.c; mergedColNum < merge.e.c + 1; mergedColNum += 1) {
            isMergedCell[mergedRowNum][mergedColNum] = true;
          }
        }

        if (!(merge.s.r === merge.e.r && merge.s.c === merge.e.c)) {
          merges.push(merge);
        }
      }
    }
  }

  return merges;
}

export function exportCsv(fileName: string, targetText: string, delimiter: string) {
  if (isIE9()) {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);

    if (frame.contentWindow) {
      frame.contentWindow.document.open('text/csv', 'replace');
      frame.contentWindow.document.write(`sep=${delimiter}\r\n${targetText}`);
      frame.contentWindow.document.close();
      frame.contentWindow.focus();

      frame.contentWindow.document.execCommand('SaveAs', false, fileName);
    }

    document.body.removeChild(frame);
    //@ts-ignore
  } else if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    const targetBlob = new Blob([targetText], { type: 'text/csv' });

    //@ts-ignore
    window.navigator.msSaveOrOpenBlob(targetBlob, `${fileName}.csv`);
  } else {
    const targetBlob = new Blob([targetText], { type: 'text/csv' });
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

    exportCsv(fileName, targetText, delimiter);
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

  return targetData;
}
