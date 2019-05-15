import { storiesOf } from '@storybook/html';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import Grid from '../src/grid';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Cell Editor', module);

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

const columns = [
  {
    name: 'name',
    width: 150,
    editor: 'text'
  },
  {
    name: 'artist',
    width: 200,
    editor: 'password'
  },
  {
    title: 'Genre',
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
    title: 'Type',
    name: 'typeCode',
    width: 200,
    editor: 'radio',
    editorOptions: {
      listItems: [{ text: 'Delux', value: '1' }, { text: 'Single', value: '2' }]
    }
  },
  {
    title: 'Grade',
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
    columnOptions: {
      frozenCount: 1
    },
    bodyHeight: 400
  });

  (window as Window & { grid: Grid }).grid = grid;

  return el;
});
