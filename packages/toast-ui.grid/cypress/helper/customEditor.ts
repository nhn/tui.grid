import { CellEditor, CellEditorProps } from '@t/editor';

export class CustomTextEditor implements CellEditor {
  public el: HTMLInputElement;

  constructor(props: CellEditorProps) {
    const el = document.createElement('input');

    el.type = 'text';
    el.value = String(props.value);

    this.el = el;
  }

  getElement() {
    return this.el;
  }

  getValue() {
    return this.el.value;
  }

  mounted() {
    this.el.select();
  }
}

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
