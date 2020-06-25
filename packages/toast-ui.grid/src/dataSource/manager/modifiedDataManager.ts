import {
  ModifiedDataMap,
  ModificationTypeCode,
  ModifiedRowsOptions,
  ModifiedDataManager,
  ModifiedRows,
  RequestTypeCode,
  MutationParams,
} from '../../../types/dataSource';
import { OptRow } from '../../../types/options';
import { Row, RowKey } from '../../../types/store/data';
import {
  someProp,
  findIndex,
  isUndefined,
  omit,
  isObject,
  forEachObject,
} from '../../helper/common';
import { getOriginObject, Observable } from '../../helper/observable';

type ParamNameMap = { [type in ModificationTypeCode]: string };

const paramNameMap: ParamNameMap = {
  CREATE: 'createdRows',
  UPDATE: 'updatedRows',
  DELETE: 'deletedRows',
};

// @TODO: fix 'Row' type with record(Dictionary) type to use negate type or other type utility
export function getDataWithOptions(targetRows: Row[], options: ModifiedRowsOptions = {}) {
  const {
    checkedOnly = false,
    withRawData = false,
    rowKeyOnly = false,
    ignoredColumns = [],
  } = options;
  let rows = targetRows.map((row) => getOriginObject(row as Observable<Row>));

  if (checkedOnly) {
    rows = rows.filter((row) => row._attributes.checked);
  }
  if (ignoredColumns.length) {
    // @ts-ignore
    rows = rows.map((row) => omit(row, ...ignoredColumns));
  }
  if (!withRawData) {
    // @ts-ignore
    rows = rows.map((row) =>
      omit(row, 'sortKey', 'uniqueKey', '_attributes', '_relationListItemMap', '_disabledPriority')
    );
  }
  if (rowKeyOnly) {
    return rows.map((row) => row.rowKey);
  }
  return rows;
}

export function createManager(): ModifiedDataManager {
  let originData: OptRow[] = [];
  let mixedOrder = false;
  const dataMap: ModifiedDataMap = {
    CREATE: [],
    UPDATE: [],
    DELETE: [],
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
    splice('CREATE', rowKey, row);
    splice('UPDATE', rowKey, row);
    splice('DELETE', rowKey, row);
  };

  return {
    // only for restore
    setOriginData(data: OptRow[]) {
      originData = data.map((row) => ({ ...row }));
    },

    getOriginData() {
      return originData;
    },

    getModifiedData(type: ModificationTypeCode, options: ModifiedRowsOptions) {
      return { [paramNameMap[type]]: getDataWithOptions(dataMap[type], options) };
    },

    getAllModifiedData(options: ModifiedRowsOptions) {
      return Object.keys(dataMap)
        .map((key) => this.getModifiedData(key as ModificationTypeCode, options))
        .reduce((acc, data) => ({ ...acc, ...data }), {} as ModifiedRows);
    },

    isModified() {
      return !!(dataMap.CREATE.length || dataMap.UPDATE.length || dataMap.DELETE.length);
    },

    isModifiedByType(type: ModificationTypeCode) {
      return !!dataMap[type].length;
    },

    push(type: ModificationTypeCode, row: Row, mixed = false) {
      const { rowKey } = row;
      mixedOrder = mixedOrder || mixed;
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

    clearSpecificRows(rowsMap: MutationParams) {
      forEachObject((_, key) => {
        rowsMap[key]!.forEach((row: Row | RowKey) => {
          spliceAll(isObject(row) ? row.rowKey : row);
        });
      }, rowsMap);
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
    },

    isMixedOrder() {
      return mixedOrder;
    },
  };
}
