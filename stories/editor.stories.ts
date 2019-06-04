import { storiesOf } from '@storybook/html';
import { OptColumn, OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Cell Editor', module);
stories.addDecorator(withKnobs);

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

let columns: OptColumn[] = [
  {
    name: 'name',
    width: 150
  },
  {
    name: 'artist',
    width: 200,
    editor: 'text',
    editorOptions: {
      dataType: 'number'
    }
  },
  {
    header: 'Genre',
    name: 'genreCode',
    width: 200,
    formatter: 'listItemText',
    editor: 'checkbox',
    editorOptions: {
      listItems: [
        { text: 'Pop', value: '1' },
        { text: 'Rock', value: '2' },
        { text: 'R&B', value: '3' }
      ]
    }
  },
  {
    header: 'Type',
    name: 'typeCode',
    width: 200,
    prefix: 'Type: ',
    formatter: 'listItemText',
    editor: 'radio',
    editorOptions: {
      listItems: [{ text: 'Delux', value: '1' }, { text: 'Single', value: '2' }]
    }
  },
  {
    header: 'Grade',
    name: 'grade',
    width: 200,
    formatter: 'listItemText',
    editor: 'select',
    editorOptions: {
      listItems: [
        { text: '*', value: '1' },
        { text: '**', value: '2' },
        { text: '***', value: '3' },
        { text: '****', value: '4' },
        { text: '*****', value: '5' }
      ]
    }
  }
];

stories.add(
  'Text / Checkbox',
  () => {
    const { grid, el } = createGrid({
      data,
      columns,
      columnOptions: { frozenCount: 1 },
      bodyHeight: 400
    });

    (window as Window & { grid: Grid }).grid = grid;

    button(`startEditing(1, 'artist')`, () => grid.startEditing(1, 'artist'));
    button(`startEditingAt(2, 1)`, () => grid.startEditingAt(2, 1));

    return el;
  },
  { html: { preventForcedRender: true } }
);

stories.add('with editingEvent:click options', () => {
  const { grid, el } = createGrid({
    data,
    columns,
    columnOptions: { frozenCount: 1 },
    bodyHeight: 400,
    editingEvent: 'click'
  });

  (window as Window & { grid: Grid }).grid = grid;

  return el;
});

stories.add(
  'Datepicker',
  () => {
    columns = [
      {
        name: 'default',
        editor: 'datepicker'
      },
      {
        name: 'options',
        editor: 'datepicker',
        editorOptions: {
          format: 'yyyy/MM/dd',
          selectableRanges: [[new Date(1992, 2, 25), new Date(1992, 2, 29)]]
        }
      },
      {
        name: 'timePicker',
        editor: 'datepicker',
        editorOptions: {
          format: 'yyyy-MM-dd HH:mm A',
          timepicker: true
        }
      },
      {
        name: 'timePickerWithTab',
        editor: 'datepicker',
        editorOptions: {
          format: 'yyyy-MM-dd HH:mm A',
          timepicker: {
            layoutType: 'tab',
            inputType: 'spinbox'
          }
        }
      },
      {
        name: 'monthPicker',
        editor: 'datepicker',
        editorOptions: {
          format: 'yyyy-MM',
          type: 'month'
        }
      },
      {
        name: 'yearPicker',
        editor: 'datepicker',
        editorOptions: {
          format: 'yyyy',
          type: 'year'
        }
      }
    ];

    const { el } = createGrid({
      data: [
        {
          id: 549731,
          default: '2019-11-11',
          options: '1992/03/25',
          timePicker: '2019-11-11 11:11 AM',
          timePickerWithTab: '2019-11-11 11:11 AM',
          monthPicker: '2019-11',
          yearPicker: '2019'
        }
      ],
      columns,
      columnOptions: { frozenCount: 1 },
      showDummyRows: true,
      bodyHeight: 200,
      width: 1200
    });

    return el;
  },
  { html: { preventForcedRender: true } }
);
