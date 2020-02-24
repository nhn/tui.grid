import { Side } from './focus';

export interface ColumnCoords {
  readonly widths: { [key in Side]: number[] };
  readonly areaWidth: { [key in Side]: number };
  readonly offsets: { [key in Side]: number[] };
  readonly totalColumnWidth: { [key in Side]: number };
}
