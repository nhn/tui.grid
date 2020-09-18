import { CellRenderer, CellRendererProps } from '@t/renderer';

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

export class CustomSvgRenderer implements CellRenderer {
  private el: SVGElement;

  public constructor() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', '20');
    circle.setAttribute('cy', '20');
    circle.setAttribute('r', '15');

    svg.appendChild(circle);

    this.el = svg;
  }

  public getElement() {
    return this.el;
  }

  public render() {
    return this.el;
  }
}
