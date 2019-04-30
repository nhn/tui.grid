import { CellValue } from '../store/types';

export interface CellEditor {
  onChange(value: CellValue): void;
  getElement(): HTMLElement | undefined;
  getValue(): string;
  onStart(): void;
  onFinish(): void;
}
