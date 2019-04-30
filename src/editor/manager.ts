import { CellEditor } from './types';
import { CellTextEditor } from './text';
import { CellValue } from '../store/types';

interface EditorConstructor {
  new (value: CellValue, dispatch: Function): CellEditor;
}

export interface EditorMap {
  [editorName: string]: EditorConstructor;
}

export const editorMap: EditorMap = {
  text: CellTextEditor
};
