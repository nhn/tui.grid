export interface SetScrollAction {
  type: 'setScroll';
  scrollX: number;
  scrollY: number;
}

export interface SetRowHeight {
  type: 'setRowHeight',
  height: number
}

export type Action =
  SetScrollAction |
  SetRowHeight;

export interface Dispatch {
  (action: Action): void;
}