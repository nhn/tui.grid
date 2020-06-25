import Grid from '../src/grid';
import { OptGrid } from '../types/options';
import { CellRendererProps } from '../types/renderer';
import { data as sampleData } from '../samples/basic';
import '../src/css/grid.css';
import '../samples/css/rowHeaders.css';

export default {
  title: 'Row Headers',
};

const columns = [{ name: 'name', minWidth: 150 }];
const data = sampleData.slice(0, 5);

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

export const rowNum = () => {
  const { el } = createGrid({
    data,
    columns,
    rowHeaders: ['rowNum'],
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
};

const rowNumNote = `
## Row Header

- UI for \`rowNum\` type
`;
rowNum.story = { parameters: { notes: rowNumNote } };

export const checkboxRowHeader = () => {
  const { el } = createGrid({
    data,
    columns,
    rowHeaders: ['checkbox'],
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
};

const checkboxRowHeaderNote = `
## Row Header

- UI for \`checkbox\` type
`;
checkboxRowHeader.story = { parameters: { notes: checkboxRowHeaderNote } };

export const checkedRowHeader = () => {
  const { el, grid } = createGrid({
    data,
    columns,
    rowHeaders: ['checkbox'],
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  grid.checkAll();

  return rootEl;
};

const checkedRowHeaderNote = `
## Row Header

- UI for **checked** \`checkbox\` type
`;
checkedRowHeader.story = { parameters: { notes: checkedRowHeaderNote } };

export const rowNumAndCheckboxRowHeaders = () => {
  const { el } = createGrid({
    data,
    columns,
    rowHeaders: ['rowNum', 'checkbox'],
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
};

const rowNumAndCheckboxRowHeadersNote = `
## Row Header

- UI for \`rowNum\` and \`checkbox\` type
`;
rowNumAndCheckboxRowHeaders.story = { parameters: { notes: rowNumAndCheckboxRowHeadersNote } };

export const customRowHeader = () => {
  const { el } = createGrid({
    data,
    columns,
    rowHeaders: [
      {
        type: 'rowNum',
        renderer: {
          type: RowNumberRenderer,
        },
      },
      {
        type: 'checkbox',
        header: `
            <label for="all-checkbox" class="checkbox">
              <input type="checkbox" id="all-checkbox" class="hidden-input" name="_checked" />
              <span class="custom-input"></span>
            </label>
          `,
        renderer: {
          type: SingleCheckRenderer,
        },
      },
    ],
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
};

const customRowHeaderNote = `
## Custom Row Header

Customizing Row Headers(\`rowNum\`, \`checkbox\`) with header and renderer.
`;
customRowHeader.story = { parameters: { notes: customRowHeaderNote } };
