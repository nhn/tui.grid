import { CellEditorClass } from './types';
import { TextEditor } from './text';
import { CheckboxEditor } from './checkbox';
import { SelectEditor } from './select';
import { Dictionary } from '../store/types';

export interface EditorMap {
  [editorName: string]: [CellEditorClass, Dictionary<any>?];
}

export const editorMap: EditorMap = {
  text: [TextEditor, { type: 'text' }],
  password: [TextEditor, { type: 'password' }],
  checkbox: [CheckboxEditor, { type: 'checkbox' }],
  radio: [CheckboxEditor, { type: 'radio' }],
  select: [SelectEditor]
};
