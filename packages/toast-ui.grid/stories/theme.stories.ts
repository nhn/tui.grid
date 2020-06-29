import Grid from '../src/grid';
import '../src/css/grid.css';
import { OptColumn, OptThemePresetNames, OptPreset } from '../types/options';
import { cls } from '../src/helper/dom';
import { Side } from '../types/store/focus';

type ThemeOptions = { preset: OptThemePresetNames; extOptions?: OptPreset };

export default {
  title: 'Theme',
};

function getBody(el: HTMLElement, side: Side) {
  return el.querySelector(
    `.${cls(side === 'L' ? 'lside-area' : 'rside-area')} .${cls('body-area')}`
  )!;
}

function createGridWithTheme(options: ThemeOptions) {
  const { preset, extOptions } = options;
  const data = [
    {
      c1: '100013',
      c2: 'Mustafa Cosme',
      c3: 291232,
    },
    {
      c1: '201212',
      c2: 'Gunnar Fausto',
      c3: 32123,
    },
    {
      c1: '241221',
      c2: 'Junior Morgan',
      c3: 88823,
    },
    {
      c1: '991232',
      c2: 'Tódor Ingo',
      c3: 9981,
    },
    {
      c1: '828723',
      c2: 'Njord Thoko',
      c3: 89123,
    },
  ];
  const columns: OptColumn[] = [
    {
      header: 'ID',
      name: 'c1',
    },
    {
      header: 'Name',
      defaultValue: 2,
      name: 'c2',
    },
    {
      header: 'Score',
      name: 'c3',
    },
  ];

  const el = document.createElement('div');
  el.style.width = '80%';

  const grid = new Grid({
    el,
    data,
    columns,
    rowHeight: 35,
    rowHeaders: ['rowNum'],
  });

  Grid.applyTheme(preset, extOptions);

  return { el, grid };
}

export const defaultTheme = () => {
  const { el } = createGridWithTheme({ preset: 'default' });

  return el;
};

const defaultThemeNote = `
## Theme

### Built in theme
- \`default\`
- \`striped\`
- \`clean\`
`;
defaultTheme.story = { parameters: { notes: defaultThemeNote } };

export const stripedTheme = () => {
  const { el } = createGridWithTheme({ preset: 'striped' });

  return el;
};

export const cleanTheme = () => {
  const { el } = createGridWithTheme({ preset: 'clean' });

  return el;
};

export const rowHoverWithCustomTheme = () => {
  const { el, grid } = createGridWithTheme({
    preset: 'clean',
    extOptions: {
      row: { hover: { background: '#0ed4ff' }, even: { background: '#feffab' } },
      cell: {
        oddRow: { background: '#fefff3' },
        normal: {
          border: '#ccc',
          showVerticalBorder: true,
        },
        rowHeader: {
          showVerticalBorder: true,
          border: '#ccc',
        },
      },
    },
  });
  grid.setSelectionRange({ start: [1, 1], end: [3, 2] });

  setTimeout(() => {
    (['L', 'R'] as const).forEach((side) => {
      const row = getBody(el, side).querySelector(`.${cls('row-even')}`)!;
      row.className = `${cls('row-even')} ${cls('row-hover')}`;
    });
  });

  return el;
};

const rowHoverWithCustomThemeNote = `
## Custom Theme

- You can customize the theme or specify a row hover style by \`extOptions\`.
- The row hover style has priority than selection style
`;
rowHoverWithCustomTheme.story = { parameters: { notes: rowHoverWithCustomThemeNote } };
