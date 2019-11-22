import { CellEditorProps, CellEditor } from '@/editor/types';

export function createCustomLayerEditor(stub: Function) {
  class CustomLayerEditor implements CellEditor {
    public el: HTMLDivElement;

    public value: string;

    public constructor(props: CellEditorProps) {
      const el = document.createElement('div');
      const { value: cellValue } = props;
      const value = String(cellValue) || '';

      el.className = 'custom-editor-layer';
      el.textContent = 'Test';

      this.el = el;
      this.value = value;
    }

    public getElement() {
      return this.el;
    }

    public getValue() {
      return this.value;
    }

    public beforeDestroy() {
      stub();
    }
  }

  return CustomLayerEditor;
}
