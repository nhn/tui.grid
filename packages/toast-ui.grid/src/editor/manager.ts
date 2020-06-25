import { CellEditorClass } from '@t/editor';
import { Dictionary } from '@t/options';
import { TextEditor } from './text';
import { CheckboxEditor } from './checkbox';
import { SelectEditor } from './select';
import { DatePickerEditor } from './datePicker';

export interface EditorMap {
  [editorName: string]: [CellEditorClass, Dictionary<any>?];
}

export const editorMap: EditorMap = {
  text: [TextEditor, { type: 'text' }],
  password: [TextEditor, { type: 'password' }],
  checkbox: [CheckboxEditor, { type: 'checkbox' }],
  radio: [CheckboxEditor, { type: 'radio' }],
  select: [SelectEditor],
  datePicker: [DatePickerEditor],
};
