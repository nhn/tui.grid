import { IRow, IColumn, IGridOptions } from '../types';
import { reactive } from './reactive';

export interface IStore {
  data: IRow[],
  columns: IColumn[]
  dimension: IDimension,
  viewport: IViewport
}

interface IDimension {
  width: number,
  height: number
}

interface IViewport {
  rowRange: [number, number],
  colRange: [number, number]
}

export function createStore(options: IGridOptions) {
  return {
    data: options.data || [],
    columns: options.columns,
    viewport: reactive({
      rowRange: [0, options.data.length],
      colRange: [0, options.columns.length]
    }),
    dimension: reactive({
      width: options.width,
      height: options.height
    })
  }
}
