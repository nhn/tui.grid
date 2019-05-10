import { Data, Row } from './types';
import { reactive, Reactive } from '../helper/reactive';
import { OptRow } from '../types';

export function create(data: OptRow[]): Reactive<Data> {
  const rawData = data.map((row, index) => {
    // @TODO: Consider keyColumnName
    const rowKeyAdded = { rowKey: index, ...row };

    return reactive(rowKeyAdded as Row);
  });

  return reactive({
    rawData,
    viewData: rawData
  });
}
