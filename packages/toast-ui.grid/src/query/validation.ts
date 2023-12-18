import { Store } from '@t/store';
import { InvalidRow, RowKey } from '@t/store/data';
import { makeObservable } from '../dispatch/data';
import { isObservable } from '../helper/observable';

export function getInvalidRows(store: Store, rowKeys?: RowKey[]) {
  const { data, column } = store;
  const invalidRows: InvalidRow[] = [];

  data.rawData.forEach((row, rowIndex) => {
    const needToValidateRow = !rowKeys || rowKeys.includes(row.rowKey);

    if (!isObservable(row) && needToValidateRow) {
      makeObservable({ store, rowIndex, silent: true });
    }
  });

  data.viewData.forEach(({ rowKey, valueMap }) => {
    const needToValidateRow = !rowKeys || rowKeys.includes(rowKey);

    if (!needToValidateRow) {
      return;
    }

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
  });

  return invalidRows;
}
