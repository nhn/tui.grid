import { Store } from '@t/store';
import { InvalidRow } from '@t/store/data';
import { createObservableData } from '../dispatch/data';

export function getInvalidRows(store: Store) {
  // @TODO: find more practical way to make observable
  createObservableData(store, true);

  const { data, column } = store;
  const invalidRows: InvalidRow[] = [];

  data.viewData.forEach(({ rowKey, valueMap }) => {
    const invalidColumns = column.validationColumns.filter(
      ({ name }) => !!valueMap[name].invalidStates.length
    );

    if (invalidColumns.length) {
      const errors = invalidColumns.map(({ name }) => ({
        columnName: name,
        errorCode: valueMap[name].invalidStates
      }));

      invalidRows.push({ rowKey, errors });
    }
  });

  return invalidRows;
}
