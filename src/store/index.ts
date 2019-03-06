import { IRow, IColumn, IGridOptions } from '../types';

export interface IStore {
  data: IRow[],
  columns: IColumn[]
}

export function createStore(options: IGridOptions) {
  return {
    data: options.data || [],
    columns: options.columns
  }
}