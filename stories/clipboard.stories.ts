import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Clipboard', module);
stories.addDecorator(withKnobs);

const columns = [
  { name: 'name', editor: 'text' },
  { name: 'artist', editor: 'text' },
  { name: 'type', editor: 'text' },
  { name: 'release', editor: 'text' },
  { name: 'genre', editor: 'text' },
  { name: 'genreCode', editor: 'text' },
  { name: 'grade', editor: 'text' },
  { name: 'price', editor: 'text' },
  { name: 'downloadCount', editor: 'text' },
  { name: 'listenCount', editor: 'text' }
];

const columnsUseFormattedValue = [
  {
    name: 'name',
    editor: 'text'
  },
  {
    name: 'artist',
    editor: 'text'
  },
  {
    name: 'type',
    editor: 'text',
    copyOptions: {
      useFormattedValue: false
    }
  },
  { name: 'release', editor: 'text' },
  { name: 'genre', editor: 'text' },
  { name: 'genreCode', editor: 'text' },
  { name: 'grade', editor: 'text' },
  { name: 'price', editor: 'text' },
  { name: 'downloadCount', editor: 'text' },
  { name: 'listenCount', editor: 'text' }
];

const columnsUseListItemText = [
  { name: 'name', editor: 'text' },
  { name: 'artist', editor: 'text' },
  {
    name: 'type',
    editor: 'select',
    editorOptions: {
      listItems: [
        { text: 'Pop', value: '1' },
        { text: 'Rock', value: '2' },
        { text: 'R&B', value: '3' }
      ]
    },
    copyOptions: {
      useListItemText: true
    }
  },
  { name: 'name' },
  { name: 'artist' },
  { name: 'type', editor: 'select' },
  { name: 'release', editor: 'text' },
  { name: 'genre', editor: 'text' },
  { name: 'genreCode', editor: 'text' },
  { name: 'grade', editor: 'text' },
  { name: 'price', editor: 'text' },
  { name: 'downloadCount' },
  { name: 'listenCount' }
];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

stories.add(
  'clipboard',
  () => {
    const { el, grid } = createGrid({
      data,
      columns,
      bodyHeight: 'fitToParent',
      columnOptions: {
        frozenCount: 2,
        minWidth: 150
      },
      copyOptions: {
        useFormattedValue: true
      }
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);
    rootEl.style.height = '400px';

    button('copyToClipboard', () => grid.copyToClipboard());

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);

stories.add(
  'clipboard with useFormattedValue',
  () => {
    const { el, grid } = createGrid({
      data,
      columns: columnsUseFormattedValue,
      bodyHeight: 'fitToParent',
      columnOptions: {
        frozenCount: 2,
        minWidth: 150
      },
      copyOptions: {
        useFormattedValue: false
      }
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);
    rootEl.style.height = '400px';

    button('copyToClipboard', () => grid.copyToClipboard());

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);

stories.add(
  'clipboard with useListItemText',
  () => {
    const { el, grid } = createGrid({
      data,
      columns: columnsUseListItemText,
      bodyHeight: 'fitToParent',
      columnOptions: {
        frozenCount: 2,
        minWidth: 150
      },
      copyOptions: {
        useFormattedValue: false
      }
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);
    rootEl.style.height = '400px';

    button('copyToClipboard', () => grid.copyToClipboard());

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);

stories.add(
  'clipboard with customValue(text)',
  () => {
    const { el, grid } = createGrid({
      data,
      columns: columnsUseListItemText,
      bodyHeight: 'fitToParent',
      columnOptions: {
        frozenCount: 2,
        minWidth: 150
      },
      copyOptions: {
        useFormattedValue: false
      }
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);
    rootEl.style.height = '400px';

    button('copyToClipboard', () => grid.copyToClipboard());

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);

stories.add(
  'clipboard with customValue(function)',
  () => {
    const { el, grid } = createGrid({
      data,
      columns: columnsUseListItemText,
      bodyHeight: 'fitToParent',
      columnOptions: {
        frozenCount: 2,
        minWidth: 150
      },
      copyOptions: {
        useFormattedValue: false
      }
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);
    rootEl.style.height = '400px';

    button('copyToClipboard', () => grid.copyToClipboard());

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);
