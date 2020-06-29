import { OptColumn } from '../types/options';
import { CellRenderer, CellRendererProps } from '../types/renderer';
import Grid from '../src/grid';
import '../src/css/grid.css';

export default {
  title: 'Renderer',
};

class SliderRenderer implements CellRenderer {
  private el: HTMLInputElement;

  public constructor(props: CellRendererProps) {
    const el = document.createElement('input');
    const { grid, rowKey, columnInfo } = props;
    const { min, max } = props.columnInfo.renderer.options as { min: number; max: number };

    el.type = 'range';
    el.style.width = '98%';
    el.min = String(min);
    el.max = String(max);

    el.addEventListener('mousedown', (ev) => {
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

const data = [
  {
    name: 'John',
    score: 10,
    vip: 'N',
  },
  {
    name: 'Emily',
    score: 7,
    vip: 'Y',
  },
  {
    name: 'Steve',
    score: 8,
    vip: 'Y',
  },
  {
    name: 'Scarlet',
    score: 6,
    vip: 'N',
  },
];
function createGrid(columns: OptColumn[]) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, data, columns });

  return { el, grid };
}

export const defaultRenderer = () => {
  const columns: OptColumn[] = [{ name: 'name' }, { name: 'vip' }];
  const { el } = createGrid(columns);

  return el;
};
const defaultRendererNote = `
## Default Renderer
- Display the value in the \`div\` block cell
`;

defaultRenderer.story = { parameters: { notes: defaultRendererNote } };

export const customRenderer = () => {
  const columns: OptColumn[] = [
    {
      name: 'score',
      renderer: {
        type: SliderRenderer,
        options: { min: 10, max: 30 },
      },
    },
  ];
  const { el } = createGrid(columns);

  return el;
};

const customRendererNote = `
## Custom Renderer
- Customizing cell renderer with slider.
`;

customRenderer.story = { parameters: { notes: customRendererNote } };
