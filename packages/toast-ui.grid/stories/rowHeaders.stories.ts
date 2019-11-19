import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import { CellRendererProps } from '../src/renderer/types';
import '../src/css/grid.css';
import '../samples/css/rowHeaders.css';

export default {
  title: 'Row Headers'
};

const columns = [{ name: 'name', minWidth: 150 }];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

class RowNumberRenderer {
  private el: HTMLElement;

  public constructor(props: CellRendererProps) {
    const el = document.createElement('span');

    el.innerHTML = `No.${props.value}`;

    this.el = el;
  }

  public getElement() {
    return this.el;
  }

  public render(props: CellRendererProps) {
    this.el.innerHTML = `No.${props.value}`;
  }
}

class SingleCheckRenderer {
  private el: HTMLLabelElement;

  public constructor(props: CellRendererProps) {
    const { grid, rowKey } = props;

    const label = document.createElement('label');
    label.className = 'checkbox';
    label.setAttribute('for', String(rowKey));

    const hiddenInput = document.createElement('input');
    hiddenInput.className = 'hidden-input';
    hiddenInput.id = String(rowKey);

    const customInput = document.createElement('span');
    customInput.className = 'custom-input';

    label.appendChild(hiddenInput);
    label.appendChild(customInput);

    hiddenInput.type = 'checkbox';
    hiddenInput.addEventListener('change', () => {
      if (hiddenInput.checked) {
        grid.check(rowKey);
      } else {
        grid.uncheck(rowKey);
      }
    });

    this.el = label;

    this.render(props);
  }

  public getElement() {
    return this.el;
  }

  public render(props: CellRendererProps) {
    const hiddenInput = this.el.querySelector('.hidden-input') as HTMLInputElement;
    const checked = Boolean(props.value);

    hiddenInput.checked = checked;
  }
}

export const basic = () => {
  const { el } = createGrid({
    data,
    columns,
    rowHeaders: ['rowNum', 'checkbox']
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
};

export const customRowNumber = () => {
  const { el } = createGrid({
    data,
    columns,
    rowHeaders: [
      {
        type: 'rowNum',
        renderer: {
          type: RowNumberRenderer
        }
      }
    ]
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
};

export const customCheckbox = () => {
  const { el } = createGrid({
    data,
    columns,
    rowHeaders: [
      {
        type: 'checkbox',
        header: `
            <label for="all-checkbox" class="checkbox">
              <input type="checkbox" id="all-checkbox" class="hidden-input" name="_checked" />
              <span class="custom-input"></span>
            </label>
          `,
        renderer: {
          type: SingleCheckRenderer
        }
      }
    ]
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
};
