export interface SetScrollAction {
  type: 'setScroll';
  scrollX: number;
  scrollY: number;
}

export type Action =
  SetScrollAction;

export interface Dispatch {
  (action: Action): void;
}