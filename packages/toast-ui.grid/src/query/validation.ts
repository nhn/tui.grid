import { Store, InvalidRow } from '../store/types';
import { createObservableData } from '../dispatch/data';

export function getInvalidRows(store: Store) {
  // makes all data observable to sort the data properly;
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
