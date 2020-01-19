import { OptRow } from '../../types';
import { Row, RowKey } from '../../store/types';
import {
  ModifiedDataMap,
  ModificationTypeCode,
  ModifiedRowsOptions,
  ModifiedDataManager,
  ModifiedRows,
  RequestTypeCode
} from '../types';
import { someProp, findIndex, isUndefined, omit } from '../../helper/common';
import { getOriginObject, Observable } from '../../helper/observable';

type ParamNameMap = { [type in ModificationTypeCode]: string };

const paramNameMap: ParamNameMap = {
  CREATE: 'createdRows',
  UPDATE: 'updatedRows',
  DELETE: 'deletedRows'
};

// @TODO: fix 'Row' type with record(Dictionary) type to use negate type or other type utility
export function getDataWithOptions(targetRows: Row[], options: ModifiedRowsOptions = {}) {
  const {
    checkedOnly = false,
    withRawData = false,
    rowKeyOnly = false,
    ignoredColumns = []
  } = options;
  let rows = targetRows.map(row => getOriginObject(row as Observable<Row>));

  if (checkedOnly) {
    rows = rows.filter(row => row._attributes.checked);
  }
  if (ignoredColumns.length) {
    // @ts-ignore
    rows = rows.map(row => omit(row, ...ignoredColumns));
  }
  if (!withRawData) {
    // @ts-ignore
    rows = rows.map(row =>
      omit(row, 'sortKey', 'uniqueKey', '_attributes', '_relationListItemMap')
    );
  }
  if (rowKeyOnly) {
    return rows.map(row => row.rowKey);
  }
  return rows;
}

export function createManager(): ModifiedDataManager {
  let originData: OptRow[] = [];
  const dataMap: ModifiedDataMap = {
    CREATE: [],
    UPDATE: [],
    DELETE: []
  };
  const splice = (type: ModificationTypeCode, rowKey: RowKey, row?: Row) => {
    const index = findIndex(createdRow => createdRow.rowKey === rowKey, dataMap[type]);
    if (index !== -1) {
      if (isUndefined(row)) {
        dataMap[type].splice(index, 1);
      } else {
        dataMap[type].splice(index, 1, row);
      }
    }
  };

  return {
    // only for restore
    setOriginData(data: OptRow[]) {
      originData = data.map(row => ({ ...row }));
    },

    getOriginData() {
      return originData;
    },

    getModifiedData(type: ModificationTypeCode, options: ModifiedRowsOptions) {
      return { [paramNameMap[type]]: getDataWithOptions(dataMap[type], options) };
    },

    getAllModifiedData(options: ModifiedRowsOptions) {
      return Object.keys(dataMap)
        .map(key => this.getModifiedData(key as ModificationTypeCode, options))
        .reduce((acc, data) => ({ ...acc, ...data }), {} as ModifiedRows);
    },

    isModified() {
      return !!(dataMap.CREATE.length || dataMap.UPDATE.length || dataMap.DELETE.length);
    },

    isModifiedByType(type: ModificationTypeCode) {
      return !!dataMap[type].length;
    },

    push(type: ModificationTypeCode, row: Row) {
      const { rowKey } = row;
      if (type === 'UPDATE' || type === 'DELETE') {
        splice('UPDATE', rowKey);
        // if the row was already registered in createdRows,
        // would update it in createdRows and not add it to updatedRows or deletedRows
        if (someProp('rowKey', rowKey, dataMap.CREATE)) {
          if (type === 'UPDATE') {
            splice('CREATE', rowKey, row);
          } else {
            splice('CREATE', rowKey);
          }
          return;
        }
      }

      if (!someProp('rowKey', rowKey, dataMap[type])) {
        dataMap[type].push(row);
      }
    },

    clear(requestTypeCode: RequestTypeCode) {
      if (requestTypeCode === 'MODIFY') {
        this.clearAll();
        return;
      }
      dataMap[requestTypeCode] = [];
    },

    clearAll() {
      dataMap.CREATE = [];
      dataMap.UPDATE = [];
      dataMap.DELETE = [];
    }
  };
}
