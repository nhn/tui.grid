import { Focus } from './focus';
import { RenderState } from './renderState';
import { Summary } from './summary';
import { FilterLayerState } from './filterLayerState';
import { Selection } from './selection';
import { RowCoords } from './rowCoords';
import { ColumnCoords } from './columnCoords';
import { Viewport } from './viewport';
import { Data } from './data';
import { Dimension } from './dimension';
import { Column } from './column';

export type GridId = number;

export interface Store {
  readonly id: GridId;
  readonly data: Data;
  readonly column: Column;
  readonly dimension: Dimension;
  readonly viewport: Viewport;
  readonly columnCoords: ColumnCoords;
  readonly rowCoords: RowCoords;
  readonly focus: Focus;
  readonly selection: Selection;
  readonly summary: Summary;
  readonly renderState: RenderState;
  readonly filterLayerState: FilterLayerState;
}
