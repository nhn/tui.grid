import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
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

const columns = [
  {
    name: 'name',
    width: 150
  },
  {
    name: 'artist',
    width: 200,
    editor: 'text'
  },
  {
    header: 'Genre',
    name: 'genreCode',
    width: 200,
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
    editor: 'radio',
    editorOptions: {
      listItems: [{ text: 'Delux', value: '1' }, { text: 'Single', value: '2' }]
    }
  },
  {
    header: 'Grade',
    name: 'grade',
    width: 200,
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

stories.add('Text / Checkbox', () => {
  const { grid, el } = createGrid({
    data,
    columns,
    columnOptions: { frozenCount: 1 },
    bodyHeight: 400
  });

  (window as Window & { grid: Grid }).grid = grid;

  button('enable', () => grid.enable());
  button('disable', () => grid.disable());
  button('disableRow(1)', () => grid.disableRow(1));
  button('enableRow(1)', () => grid.enableRow(1));
  button('disableRow(3, true)', () => grid.disableRow(3, true));
  button('disableRow(4, false)', () => grid.disableRow(4, false));
  button('enableRow(3, true)', () => grid.enableRow(3, true));
  button('enableRow(4, false)', () => grid.enableRow(4, false));

  return el;
});
