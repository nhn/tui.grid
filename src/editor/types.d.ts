import { CellValue } from '../store/types';

export interface CellEditor {
  getElement(): HTMLElement | undefined;
  getValue(): string;
  start(): void;
  finish(): void;
}

export interface CellEditorClass {
  new (options: any, value: CellValue, dispatch: Function): CellEditor;
}
