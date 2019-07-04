import { CellEditorProps, CellEditor } from '@/editor/types';

export function createCustomLayerEditor(stub: Function) {
  class CustomLayerEditor implements CellEditor {
    public el: HTMLDivElement;

    public layer: HTMLDivElement | null;

    public value: string;

    public constructor(props: CellEditorProps) {
      const el = document.createElement('div');
      const layer = document.createElement('div');
      const value = String(props.value) || '';

      el.textContent = value;

      layer.className = 'custom-editor-layer';
      layer.textContent = 'Test';

      el.addEventListener('click', () => {
        el.appendChild(layer);
      });

      layer.addEventListener('click', () => {
        props.grid.finishEditing(props.rowKey, props.columnInfo.name, this.getValue());
      });

      this.el = el;
      this.layer = layer;
      this.value = value;
    }

    public getElement() {
      return this.el;
    }

    public getValue() {
      return this.value;
    }

    public beforeDestroy() {
      this.layer = null;
      stub();
    }
  }

  return CustomLayerEditor;
}
