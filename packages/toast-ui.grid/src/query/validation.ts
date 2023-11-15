import { Store } from '@t/store';
import { InvalidRow, RowKey } from '@t/store/data';
import { makeObservable } from '../dispatch/data';
import { isObservable } from '../helper/observable';

export function getInvalidRows(store: Store, rowKeys?: RowKey[]) {
  const { data, column } = store;
  const invalidRows: InvalidRow[] = [];

  data.rawData.forEach((row, rowIndex) => {
    if (!isObservable(row) && (!rowKeys || rowKeys.includes(row.rowKey))) {
      makeObservable(store, rowIndex, true);
    }
  });

  data.viewData.forEach(({ rowKey, valueMap }) => {
    if (!rowKeys || rowKeys?.includes(rowKey)) {
      const invalidColumns = column.validationColumns.filter(
        ({ name }) => !!valueMap[name].invalidStates.length
      );

      if (invalidColumns.length) {
        const errors = invalidColumns.map(({ name }) => {
          const { invalidStates } = valueMap[name];

          return {
            columnName: name,
            errorInfo: invalidStates,
            errorCode: invalidStates.map(({ code }) => code),
          };
        });

        invalidRows.push({ rowKey, errors });
      }
    }
  });

  return invalidRows;
}
