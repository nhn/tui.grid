import { CellEditorClass } from './types';
import { TextEditor } from './text';
import { CheckboxEditor } from './checkbox';
import { SelectEditor } from './select';
import { Dictionary } from '../store/types';
import { DatepickerEditor } from './datepicker';

export interface EditorMap {
  [editorName: string]: [CellEditorClass, Dictionary<any>?];
}

export const editorMap: EditorMap = {
  text: [TextEditor, { type: 'text' }],
  password: [TextEditor, { type: 'password' }],
  checkbox: [CheckboxEditor, { type: 'checkbox' }],
  radio: [CheckboxEditor, { type: 'radio' }],
  select: [SelectEditor],
  datepicker: [DatepickerEditor]
};
