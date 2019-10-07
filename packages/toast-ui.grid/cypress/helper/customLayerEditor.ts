import { CellEditorProps, CellEditor } from '@/editor/types';

export function createCustomLayerEditor(stub: Function) {
  class CustomLayerEditor implements CellEditor {
    public el: HTMLDivElement;

    public layer: HTMLDivElement | null;

    public value: string;

    public constructor(props: CellEditorProps) {
      const el = document.createElement('div');
      const layer = document.createElement('div');
      const { grid, rowKey, columnInfo, value: cellValue } = props;
      const value = String(cellValue) || '';

      el.textContent = value;

      layer.className = 'custom-editor-layer';
      layer.textContent = 'Test';

      el.addEventListener('click', () => {
        el.appendChild(layer);
      });

      layer.addEventListener('click', () => {
        grid.finishEditing(rowKey, columnInfo.name, this.getValue());
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
