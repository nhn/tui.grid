import { storiesOf } from '@storybook/html';
import { OptGrid, OptColumn } from '../src/types';
import { Omit } from 'utility-types';
import Grid from '../src/grid';
import '../src/css/grid.css';
import { CellRenderer, CellRendererProps } from '../src/renderer/types';
import { CellValue } from '../src/store/types';

const stories = storiesOf('Cell Renderer', module);

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

class ToolTipRenderer implements CellRenderer {
  private el: HTMLDivElement;

  private tooltip: HTMLDivElement;

  private value: CellValue;

  public constructor(renderData: CellRendererProps) {
    const el = document.createElement('div');
    el.style.position = 'relative';

    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.display = 'none';
    tooltip.style.padding = '5px';
    tooltip.style.border = '1px solid #aaa';
    tooltip.innerHTML = String(renderData.value);

    el.addEventListener('mouseenter', this.showTooltip);
    el.addEventListener('mouseleave', this.hideTooltip);

    this.el = el;
    this.tooltip = tooltip;
    this.value = renderData.value;
    this.render(renderData);
  }

  private showTooltip = () => {
    const { tooltip } = this;

    tooltip.style.top = '-30px';
    tooltip.style.left = '30px';
    tooltip.style.display = 'block';
    tooltip.innerHTML = String(this.value);
  };

  private hideTooltip = () => {
    this.tooltip.style.display = 'none';
  };

  public getElement() {
    return this.el;
  }

  public mounted() {
    this.el.appendChild(this.tooltip);
  }

  public render(props: CellRendererProps) {
    this.value = props.value;
    this.el.innerHTML = String(props.value);
    this.tooltip.innerHTML = String(props.value);
  }
}

class SliderRenderer implements CellRenderer {
  private el: HTMLInputElement;

  public constructor(props: CellRendererProps) {
    const el = document.createElement('input');
    const { grid, rowKey, columnInfo } = props;
    const { min, max } = props.columnInfo.renderer.options;

    el.type = 'range';
    el.min = String(min);
    el.max = String(max);

    el.addEventListener('mousedown', ev => {
      ev.stopPropagation();
    });

    el.addEventListener('change', () => {
      grid.setValue(rowKey, columnInfo.name, Number(el.value));
    });

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

class SingleCheckRenderer implements CellRenderer {
  private el: HTMLInputElement;

  public constructor(props: CellRendererProps) {
    const el = document.createElement('input');
    const { grid, rowKey, columnInfo } = props;

    el.type = 'checkbox';
    el.addEventListener('change', () => {
      grid.setValue(rowKey, columnInfo.name, el.checked);
    });

    this.el = el;
    this.render(props);
  }

  public getElement() {
    return this.el;
  }

  public render(props: CellRendererProps) {
    this.el.checked = Boolean(props.value);
  }
}

const columns: OptColumn[] = [
  { name: 'name', renderer: ToolTipRenderer, align: 'center' },
  {
    name: 'score',
    renderer: {
      type: SliderRenderer,
      options: { min: 10, max: 30 }
    },
    align: 'center'
  },
  { name: 'vip', renderer: SingleCheckRenderer, align: 'center' }
];

const data = [
  {
    name: 'John',
    score: 10,
    vip: false
  },
  {
    name: 'Emily',
    score: 7,
    vip: true
  },
  {
    name: 'Steve',
    score: 8,
    vip: true
  },
  {
    name: 'Scarlet',
    score: 6,
    vip: false
  }
];

stories.add('Simple Check Renderer', () => {
  const { el } = createGrid({
    data,
    columns,
    bodyHeight: 400
  });

  return el;
});
