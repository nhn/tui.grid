import { CellRenderer, CellRendererProps } from '@/renderer/types';

export function createCustomLayerRenderer() {
  class CustomLayerRenderer implements CellRenderer {
    private el: HTMLInputElement;

    public constructor(props: CellRendererProps) {
      const el = document.createElement('input');

      el.type = 'range';
      el.style.width = '98%';

      this.el = el;
      this.render(props);
    }

    public getElement() {
      return this.el;
    }

    public render(props: CellRendererProps) {
      this.el.value = String(props.value);
    }
  }

  return CustomLayerRenderer;
}
