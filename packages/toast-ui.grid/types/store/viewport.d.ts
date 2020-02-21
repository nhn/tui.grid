import { ViewRow } from './data';
import { ColumnInfo } from './column';

export interface Viewport {
  scrollLeft: number;
  scrollTop: number;
  readonly scrollPixelScale: number;
  readonly maxScrollLeft: number;
  readonly maxScrollTop: number;
  readonly offsetLeft: number;
  readonly offsetTop: number;
  readonly rowRange: Range;
  readonly colRange: Range;
  readonly columns: ColumnInfo[];
  readonly rows: ViewRow[];
  readonly dummyRowCount: number;
}
