import { Store } from '@t/store';
import { Column } from '@t/store/column';
import { Row, Data } from '@t/store/data';
import { Range } from '@t/store/selection';
import { OriginData } from '@t/dispatch';
import { isObservable } from '../helper/observable';
import { createData, generateDataCreationKey, createViewRow } from '../store/data';
import { findRowByRowKey, findIndexByRowKey } from '../query/data';
import { createTreeRawRow } from '../store/helper/tree';

function getDataToBeObservable(acc: OriginData, row: Row, index: number, treeColumnName?: string) {
  if (treeColumnName && row._attributes.tree!.hidden) {
    return acc;
  }

  if (!isObservable(row)) {
    acc.rows.push(row);
    acc.targetIndexes.push(index);
  }

  return acc;
}

function createOriginData(data: Data, rowRange: Range, treeColumnName?: string) {
  return data.rawData
    .slice(...rowRange)
    .reduce(
      (acc: OriginData, row, index) =>
        getDataToBeObservable(acc, row, index + rowRange[0], treeColumnName),
      {
        rows: [],
        targetIndexes: []
      }
    );
}

function createFilteredOriginData(data: Data, rowRange: Range, treeColumnName?: string) {
  return data
    .filteredIndex!.slice(...rowRange)
    .reduce(
      (acc: OriginData, rowIndex) =>
        getDataToBeObservable(acc, data.rawData[rowIndex], rowIndex, treeColumnName),
      { rows: [], targetIndexes: [] }
    );
}

function changeToObservableData(column: Column, data: Data, originData: OriginData) {
  const { targetIndexes, rows } = originData;
  fillMissingColumnData(column, rows);

  // prevRows is needed to create rowSpan
  const prevRows = targetIndexes.map(targetIndex => data.rawData[targetIndex - 1]);
  const { rawData, viewData } = createData({ data: rows, column, lazyObservable: false, prevRows });

  for (let index = 0, end = rawData.length; index < end; index += 1) {
    const targetIndex = targetIndexes[index];
    data.viewData.splice(targetIndex, 1, viewData[index]);
    data.rawData.splice(targetIndex, 1, rawData[index]);
  }
}

function changeToObservableTreeData(
  column: Column,
  data: Data,
  originData: OriginData,
  id: number
) {
  const { rows } = originData;
  const { rawData, viewData } = data;
  const { columnMapWithRelation, treeColumnName, treeIcon } = column;
  fillMissingColumnData(column, rows);

  // create new creation key for updating the observe function of hoc component
  generateDataCreationKey();

  rows.forEach(row => {
    const parentRow = findRowByRowKey(data, column, id, row._attributes.tree!.parentRowKey);
    const rawRow = createTreeRawRow(row, parentRow || null, columnMapWithRelation);
    const viewRow = createViewRow(rawRow, columnMapWithRelation, rawData, treeColumnName, treeIcon);
    const foundIndex = findIndexByRowKey(data, column, id, rawRow.rowKey);

    viewData.splice(foundIndex, 1, viewRow);
    rawData.splice(foundIndex, 1, rawRow);
  });
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
    changeToObservableTreeData(column, data, originData, id);
  } else {
    changeToObservableData(column, data, originData);
  }
}
