import { Store, InvalidRow } from '../store/types';

export function getInvalidRows({ data, column }: Store) {
  const invalidRows: InvalidRow[] = [];

  data.viewData.forEach(({ rowKey, valueMap }) => {
    const invalidColumns = column.validationColumns.filter(
      ({ name }) => !!valueMap[name].invalidStates
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
