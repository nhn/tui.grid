import { Store } from '@t/store';
import { Column } from '@t/store/column';
import { Row, Data, ViewRow } from '@t/store/data';
import { Range } from '@t/store/selection';
import { OriginData } from '@t/dispatch';
import { isObservable, notify } from '../helper/observable';
import { generateDataCreationKey, createViewRow, createRawRow } from '../store/data';
import { findRowByRowKey, findIndexByRowKey } from '../query/data';
import { createTreeRawRow } from '../store/helper/tree';
import { silentSplice } from '../helper/common';

function getDataToBeObservable(
  acc: OriginData,
  row: Row,
  viewRow: ViewRow,
  index: number,
  treeColumnName?: string
) {
  if (treeColumnName && row._attributes.tree!.hidden) {
    return acc;
  }

  if (
    !isObservable(row) ||
    (viewRow && row.rowKey === viewRow.rowKey && !isObservable(viewRow.valueMap))
  ) {
    acc.rows.push(row);
    acc.targetIndexes.push(index);
  }

  return acc;
}

function createOriginData(data: Data, rowRange: Range, treeColumnName?: string) {
  const [start, end] = rowRange;
  const viewData = data.viewData.slice(start, end);

  return data.rawData
    .slice(start, end)
    .reduce(
      (acc: OriginData, row, index) =>
        getDataToBeObservable(acc, row, viewData[index], index + start, treeColumnName),
      {
        rows: [],
        targetIndexes: [],
      }
    );
}

function createFilteredOriginData(data: Data, rowRange: Range, treeColumnName?: string) {
  const [start, end] = rowRange;
  const { rawData, viewData } = data;

  return data
    .filteredIndex!.slice(start, end)
    .reduce(
      (acc: OriginData, rowIndex) =>
        getDataToBeObservable(acc, rawData[rowIndex], viewData[rowIndex], rowIndex, treeColumnName),
      { rows: [], targetIndexes: [] }
    );
}

function changeToObservableData(id: number, column: Column, data: Data, originData: OriginData) {
  const { targetIndexes, rows } = originData;
  const { rawData } = data;

  fillMissingColumnData(column, rows);

  // prevRows is needed to create rowSpan
  const prevRows = targetIndexes.map((targetIndex) => data.rawData[targetIndex - 1]);

  for (let index = 0, end = rows.length; index < end; index += 1) {
    const targetIndex = targetIndexes[index];

    const rawRow = createRawRow(id, rows[index], index, column, {
      lazyObservable: false,
      prevRow: prevRows[index],
      keyColumnName: column.keyColumnName,
    });
    const viewRow = createViewRow(id, rawRow, rawData, column);

    silentSplice(data.rawData, targetIndex, 1, rawRow);
    silentSplice(data.viewData, targetIndex, 1, viewRow);
  }
  notify(data, 'rawData', 'filteredRawData', 'viewData', 'filteredViewData');
}

function changeToObservableTreeData(
  id: number,
  column: Column,
  data: Data,
  originData: OriginData
) {
  const { rows } = originData;
  const { rawData, viewData } = data;

  fillMissingColumnData(column, rows);

  // create new creation key for updating the observe function of hoc component
  generateDataCreationKey();

  rows.forEach((row) => {
    const parentRow = findRowByRowKey(data, column, id, row._attributes.tree!.parentRowKey);
    const rawRow = createTreeRawRow(id, row, parentRow || null, column);
    const viewRow = createViewRow(id, rawRow, rawData, column);
    const foundIndex = findIndexByRowKey(data, column, id, rawRow.rowKey);

    silentSplice(rawData, foundIndex, 1, rawRow);
    silentSplice(viewData, foundIndex, 1, viewRow);
  });
  notify(data, 'rawData', 'filteredRawData', 'viewData', 'filteredViewData');
}

export function fillMissingColumnData(column: Column, rawData: Row[]) {
  for (let i = 0; i < rawData.length; i += 1) {
    rawData[i] = { ...column.emptyRow, ...rawData[i] } as Row;
  }
}

export function createObservableData({ column, data, viewport, id }: Store, allRowRange = false) {
  const rowRange: Range = allRowRange ? [0, data.rawData.length] : viewport.rowRange;
  const { treeColumnName } = column;
  const originData =
    data.filters && !allRowRange
      ? createFilteredOriginData(data, rowRange, treeColumnName)
      : createOriginData(data, rowRange, treeColumnName);

  if (!originData.rows.length) {
    return;
  }

  if (treeColumnName) {
    changeToObservableTreeData(id, column, data, originData);
  } else {
    changeToObservableData(id, column, data, originData);
  }
}
