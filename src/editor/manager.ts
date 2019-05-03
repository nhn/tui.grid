import { CellEditorClass } from './types';
import { CellTextEditor } from './text';
import { CellCheckboxEditor } from './checkbox';

export interface EditorMap {
  [editorName: string]: CellEditorClass;
}

export const editorMap: EditorMap = {
  text: CellTextEditor,
  checkbox: CellCheckboxEditor
};
