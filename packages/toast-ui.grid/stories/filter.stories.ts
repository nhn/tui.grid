import { OptColumn, OptRow } from '../types/options';
import Grid from '../src/grid';
import '../src/css/grid.css';
import 'tui-date-picker/dist/tui-date-picker.css';

function createGrid(columns: OptColumn[], data: OptRow[] = []) {
  const options = { data, columns };
  const el = document.createElement('div');
  el.style.width = '500px';

  const grid = new Grid({ el, ...options, bodyHeight: 100 });

  return { el, grid };
}

interface ClickBtnOption {
  btnIndex?: number;
  callback?: () => void;
}

function clickFilterBtnAsync(el: HTMLElement, clickBtnOption?: ClickBtnOption) {
  const { btnIndex = 0, callback } = clickBtnOption || {};

  setTimeout(() => {
    const filterBtn = el.querySelectorAll<HTMLElement>('.tui-grid-btn-filter')[btnIndex];
    filterBtn.click();
    if (callback) {
      callback();
    }
  });
}

function clickLayerInputAsync(el: HTMLElement) {
  setTimeout(() => {
    const input = el.querySelector('.tui-grid-filter-input') as HTMLElement;
    input.click();
  });
}

export default {
  title: 'Filter',
  parameters: { options: { panelPosition: 'right' } },
};

export const buttons = () => {
  const columns: OptColumn[] = [
    { name: 'name', filter: 'text' },
    { name: 'age', filter: 'number' },
    { name: 'score' },
  ];

  const { grid, el } = createGrid(columns, []);
  grid.filter('name', [
    {
      code: 'eq',
      value: 'Kim',
    },
  ]);

  return el;
};

const iconNote = `
## Filter Buttons
- name (Blue Icon) : Filter is activated
- age (Black Icon) : Filter is not activated
- score (No Icon) : No Filter

### Design Guide
- https://zpl.io/blLWxde
`;

buttons.story = { parameters: { notes: iconNote } };

export const layerBasic = () => {
  const columns: OptColumn[] = [{ name: 'age', filter: 'number' }];

  const { el } = createGrid(columns);
  clickFilterBtnAsync(el);

  return el;
};

const layerBasicNote = `
## Filter Layer
- Basic UI for \`number\` and \`string\` type
- Using native select-box (will be replaced with toast-ui component)
`;

layerBasic.story = { parameters: { notes: layerBasicNote } };

export const layerWithButtons = () => {
  const columns: OptColumn[] = [
    { name: 'age', filter: { type: 'number', showApplyBtn: true, showClearBtn: true } },
  ];

  const { el } = createGrid(columns);
  clickFilterBtnAsync(el);

  return el;
};

const layerWithButtonsNote = `
## Filter Layer With Buttons
- Displaying the filter layer with \`Clear\` and \`Apply\` buttons
`;
layerWithButtons.story = { parameters: { notes: layerWithButtonsNote } };

export const layerWithOperator = () => {
  const columns: OptColumn[] = [{ name: 'age', filter: { type: 'number', operator: 'AND' } }];

  const { el, grid } = createGrid(columns);
  grid.filter('age', [
    {
      code: 'eq',
      value: '30',
    },
  ]);
  clickFilterBtnAsync(el);

  return el;
};

const layerWithOperatorNote = `
## Filter Layer With Operator
- Displaying the filter layer with operater(\`AND\`,\`OR\` radio type)
`;
layerWithOperator.story = { parameters: { notes: layerWithOperatorNote } };

export const layerSelect = () => {
  const columns: OptColumn[] = [{ name: 'type', filter: 'select' }];
  const data = [
    { type: '1000' },
    { type: '1001' },
    { type: '1002' },
    { type: '1003' },
    { type: '1004' },
    { type: '1005' },
    { type: '1006' },
    { type: '1007' },
    { type: '1008' },
    { type: '1009' },
  ];

  const { el, grid } = createGrid(columns, data);
  grid.filter('type', [
    {
      code: 'eq',
      value: '1001',
    },
    {
      code: 'eq',
      value: '1003',
    },
    {
      code: 'eq',
      value: '1004',
    },
  ]);

  clickFilterBtnAsync(el);

  return el;
};
const layerSelectNote = `
## Select Filter Layer
- Displaying the select filter layer
`;
layerSelect.story = { parameters: { notes: layerSelectNote } };

export const layerDatePicker = () => {
  const columns: OptColumn[] = [{ name: 'date', filter: 'date' }];
  const { el } = createGrid(columns);
  clickFilterBtnAsync(el, {
    callback: () => {
      clickLayerInputAsync(el);
    },
  });

  return el;
};
const layerDatePickerNote = `
## Datepicker Filter Layer
- UI for \`datepicker\` filter type
- Using [TOAST UI DatePicker](https://github.com/nhn/tui.date-picker) dependency
`;
layerDatePicker.story = { parameters: { notes: layerDatePickerNote } };

export const layerAfterMovingPosition = () => {
  const columns: OptColumn[] = [
    { name: 'name', filter: 'text' },
    { name: 'age', filter: 'number' },
    { name: 'score' },
  ];

  const { el } = createGrid(columns, []);

  clickFilterBtnAsync(el);
  clickFilterBtnAsync(el, { btnIndex: 1 });

  return el;
};

const layerAfterMovingPositionNote = `
## Filter Layer Position
- Displaying the filter layer on the correct position when it updated.
`;

layerAfterMovingPosition.story = { parameters: { notes: layerAfterMovingPositionNote } };
