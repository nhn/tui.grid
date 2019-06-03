import { OptRow } from '../types';
import { Row, RowKey, Dictionary } from '../store/types';
import {
  ModifiedDataMap,
  ModificationTypeCode,
  ModifiedRowsOptions,
  ModifiedDataManager
} from './types';
import { some, findIndex, isUndefined, isObject, omit } from '../helper/common';
import { getOriginObject, Observable } from '../helper/observable';

type ParamNameMap = { [type in ModificationTypeCode]: string };

const paramNameMap: ParamNameMap = {
  C: 'createdRows',
  U: 'updatedRows',
  D: 'deletedRows'
};

export function getMappingData(targetRows: Row[], options: ModifiedRowsOptions = {}) {
  const {
    checkedOnly = false,
    withRawData = false,
    rowKeyOnly = false,
    ignoredColumns = []
  } = options;
  let rows = targetRows.map((row) => getOriginObject(row as Observable<Row>));

  if (checkedOnly) {
    rows = rows.filter((row) => row._attributes.checked);
  }
  if (ignoredColumns.length) {
    rows = rows.map((row) => omit(row, ignoredColumns));
  }
  if (!withRawData) {
    rows = rows.map((row) => omit(row, '_attributes'));
  }
  if (rowKeyOnly) {
    return rows.map((row) => row.rowKey);
  }
  return rows;
}

export function createManager(): ModifiedDataManager {
  let originData: OptRow[] = [];
  const dataMap: ModifiedDataMap = {
    C: [],
    U: [],
    D: []
  };
  const splice = (type: ModificationTypeCode, rowKey: RowKey, row?: Row) => {
    const index = findIndex((createdRow) => createdRow.rowKey === rowKey, dataMap[type]);
    if (index !== -1) {
      if (isUndefined(row)) {
        dataMap[type].splice(index, 1);
      } else {
        dataMap[type].splice(index, 1, row);
      }
    }
  };
  const spliceAll = (rowKey: RowKey, row?: Row) => {
    splice('C', rowKey, row);
    splice('U', rowKey, row);
    splice('D', rowKey, row);
  };

  return {
    // only for restore
    setOriginData(data: OptRow[]) {
      const copied = [...data];
      originData = copied.map((row) => ({ ...row }));
    },
    getOriginData() {
      return originData;
    },
    getModifiedData(type: ModificationTypeCode, options: ModifiedRowsOptions) {
      return { [paramNameMap[type]]: getMappingData(dataMap[type], options) };
    },
    getAllModifiedData(options: ModifiedRowsOptions) {
      return Object.keys(dataMap)
        .map((key) => {
          const keyWithType = key as ModificationTypeCode;
          return this.getModifiedData(keyWithType, options);
        })
        .reduce((acc, data) => ({ ...acc, ...data }), {} as Dictionary<Row[] | RowKey[]>);
    },
    isModified() {
      return !!(dataMap.C.length || dataMap.U.length || dataMap.D.length);
    },
    push(type: ModificationTypeCode, row: Row) {
      const { rowKey } = row;
      // filter duplicated row
      if (type === 'U') {
        splice('C', rowKey, row);
        splice('U', rowKey, row);
      }
      if (type === 'D') {
        splice('C', rowKey);
        splice('U', rowKey);
      }
      if (!some((targetRow) => targetRow.rowKey === rowKey, dataMap[type])) {
        dataMap[type].push(row);
      }
    },
    clear(rowsMap: Dictionary<Row[] | RowKey[]>) {
      Object.keys(rowsMap).forEach((key) => {
        const rows = rowsMap[key];
        rows.forEach((row: Row | RowKey) => {
          spliceAll(isObject(row) ? row.rowKey : row);
        });
      });
    },
    clearAll() {
      dataMap.C = [];
      dataMap.U = [];
      dataMap.D = [];
    }
  };
}
