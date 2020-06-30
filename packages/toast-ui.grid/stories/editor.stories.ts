import { CellEditor, CellEditorProps } from '../types/editor';
import { OptColumn } from '../types/options';
import Grid from '../src/grid';
import '../src/css/grid.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

export default {
  title: 'Editor',
};

class CustomEditor implements CellEditor {
  el: HTMLInputElement;

  public constructor(props: CellEditorProps) {
    const el = document.createElement('input');

    el.type = 'text';
    el.style.background = '#ccc';
    el.value = String(props.value);

    this.el = el;
  }

  getElement() {
    return this.el;
  }

  getValue() {
    return String(this.el.value);
  }

  mounted() {
    this.el.focus();
  }
}

const data = [
  {
    artist: 'Birdy',
    typeCode: '1',
    genreCode: '1',
    grade: '4',
    release: '2016.03.26',
    albumColor: '#F294A4',
  },
  {
    artist: 'Ed Sheeran',
    typeCode: '1',
    genreCode: '1',
    grade: '5',
    release: '2014.06.24',
    albumColor: '#ED6510',
  },
  {
    artist: 'Maroon5',
    typeCode: '2',
    genreCode: '1,2',
    grade: '2',
    release: '2011.08.08',
    albumColor: '#1286DB',
  },
  {
    artist: 'Adele',
    release: '2011.01.21',
    typeCode: '1',
    genreCode: '2,3',
    grade: '3',
    albumColor: '#1286DB',
  },
  {
    artist: 'HONNE',
    release: '2016.07.22',
    typeCode: '1',
    genreCode: '1',
    grade: '2',
    albumColor: '#ED6510',
  },
  {
    artist: 'Gregory Porter',
    release: '2016.09.02',
    typeCode: '1',
    genreCode: '1,2',
    grade: '3',
    albumColor: '#1286DB',
  },
  {
    artist: 'LANY',
    release: '2015.12.11',
    typeCode: '2',
    genreCode: '3',
    grade: '2',
    albumColor: '#ED6510',
  },
  {
    artist: 'Daft Punk',
    release: '2013.04.23',
    typeCode: '2',
    genreCode: '1,3',
    grade: '3',
    albumColor: '#F294A4',
  },
  {
    artist: 'Sigur Rós',
    release: '2012.05.31',
    typeCode: '1',
    genreCode: '2',
    grade: '3',
    albumColor: '#1286DB',
  },
  {
    artist: 'Snoop Dogg',
    release: '2015.05.12',
    typeCode: '2',
    genreCode: '1',
    grade: '3',
    albumColor: '#F294A4',
  },
  {
    artist: 'Beyoncé',
    release: '2011.07.26',
    typeCode: '1',
    genreCode: '3',
    grade: '3',
    albumColor: '#1286DB',
  },
];

const columns: OptColumn[] = [
  {
    name: 'artist',
    editor: {
      type: 'text',
      options: {
        dataType: 'number',
      },
    },
  },
  {
    header: 'Genre',
    name: 'genreCode',
    formatter: 'listItemText',
    editor: {
      type: 'checkbox',
      options: {
        listItems: [
          { text: 'Pop', value: '1' },
          { text: 'Rock', value: '2' },
          { text: 'R&B', value: '3' },
        ],
      },
    },
  },
  {
    header: 'Type',
    name: 'typeCode',
    formatter: 'listItemText',
    editor: {
      type: 'radio',
      options: {
        listItems: [
          { text: 'Delux', value: '1' },
          { text: 'Single', value: '2' },
        ],
      },
    },
  },
  {
    header: 'Grade',
    name: 'grade',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: [
          { text: '*', value: '1' },
          { text: '**', value: '2' },
          { text: '***', value: '3' },
          { text: '****', value: '4' },
          { text: '*****', value: '5' },
        ],
      },
    },
  },
  {
    header: 'Release',
    name: 'release',
    editor: 'datePicker',
  },
  {
    header: 'Album Color',
    name: 'albumColor',
    editor: {
      type: CustomEditor,
    },
  },
];

function createGrid() {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({
    el,
    data,
    columns,
    bodyHeight: 300,
    columnOptions: {
      frozenCount: 1,
      minWidth: 200,
    },
  });

  return { el, grid };
}

export const text = () => {
  const { el, grid } = createGrid();

  grid.startEditingAt(8, 0);

  return el;
};
const textNote = `
## Text Editing Layer
- The editing layer UI for \`text\` type
- Using native input-text
- The Editing Cell
  - Row Index: \`8\`
  - Column Index: \`0\`
`;
text.story = { parameters: { notes: textNote } };

export const checkbox = () => {
  const { el, grid } = createGrid();

  grid.startEditingAt(8, 1);

  return el;
};
const checkboxNote = `
## Checkbox Editing Layer
- The editing layer UI for \`checkbox\` type
- Using native input-checkbox
- The Editing Cell
  - Row Index: \`8\`
  - Column Index: \`1\`
`;
checkbox.story = { parameters: { notes: checkboxNote } };

export const radio = () => {
  const { el, grid } = createGrid();

  grid.startEditingAt(8, 2);

  return el;
};
const radioNote = `
## Radio Editing Layer
- The editing layer UI for \`radio\` type
- Using native input-radio
- The Editing Cell
  - Row Index: \`8\`
  - Column Index: \`2\`
`;
radio.story = { parameters: { notes: radioNote } };

export const select = () => {
  const { el, grid } = createGrid();

  grid.startEditingAt(8, 3);

  return el;
};
const selectNote = `
## Select Editing Layer
- The editing layer UI for \`select\` type
- Using native input-select
- The Editing Cell
  - Row Index: \`8\`
  - Column Index: \`3\`
`;
select.story = { parameters: { notes: selectNote } };

export const datepicker = () => {
  const { el, grid } = createGrid();

  setTimeout(() => {
    grid.startEditingAt(8, 4);
  });

  return el;
};
const datepickerNote = `
## Datepicker Editing Layer
- The editing layer UI for \`datepicker\` type
- Using [TOAST UI DatePicker](https://github.com/nhn/tui.date-picker) dependency
- The Editing Cell
  - Row Index: \`8\`
  - Column Index: \`4\`
`;
datepicker.story = { parameters: { notes: datepickerNote } };

export const customEditor = () => {
  const { el, grid } = createGrid();

  grid.startEditingAt(8, 5);

  return el;
};
const customEditorNote = `
## Custom Editor
- Customizing cell editor with custom text editor.
- The Editing Cell
  - Row Index: \`8\`
  - Column Index: \`5\`
`;
customEditor.story = { parameters: { notes: customEditorNote } };
