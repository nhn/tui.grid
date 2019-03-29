export interface SetScrollAction {
  type: 'setScroll';
  scrollX: number;
  scrollY: number;
}

export interface SetRowHeight {
  type: 'setRowHeight',
  height: number
}

export interface SetWidth {
  type: 'setWidth',
  width: number
}

export type Action =
  SetScrollAction |
  SetRowHeight |
  SetWidth;

export interface Dispatch {
  (action: Action): void;
}

export interface DispatchProps {
  dispatch: Dispatch
}
