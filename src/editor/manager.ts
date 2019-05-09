import { CellEditorClass } from './types';
import { TextEditor } from './text';
import { CheckboxEditor } from './checkbox';
import { SelectEditor } from './select';

export interface EditorMap {
  [editorName: string]: CellEditorClass;
}

export const editorMap: EditorMap = {
  text: TextEditor,
  password: TextEditor,
  checkbox: CheckboxEditor,
  radio: CheckboxEditor,
  select: SelectEditor
};
