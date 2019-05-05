import { CellEditorClass } from './types';
import { CellTextEditor } from './text';
import { CellCheckboxEditor } from './checkbox';

export interface EditorMap {
  [editorName: string]: CellEditorClass;
}

export const editorMap: EditorMap = {
  text: CellTextEditor,
  password: CellTextEditor,
  checkbox: CellCheckboxEditor,
  radio: CellCheckboxEditor
};
