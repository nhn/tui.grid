import { Store } from '@t/store';
import { InvalidRow } from '@t/store/data';
import { makeObservable } from '../dispatch/data';
import { isObservable } from '../helper/observable';
import { createObservableData } from '../dispatch/lazyObservable';

export function getInvalidRows(store: Store) {
  // @TODO: find more practical way to make observable
  createObservableData(store, true);

  const { data, column } = store;
  const invalidRows: InvalidRow[] = [];

  data.rawData.forEach((row, rowIndex) => {
    if (!isObservable(row)) {
      makeObservable(store, rowIndex, true);
    }
  });

  data.viewData.forEach(({ rowKey, valueMap }) => {
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
