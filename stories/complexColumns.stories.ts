import { storiesOf } from '@storybook/html';
import { withKnobs } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid, OptColumn } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/tree';

import '../src/css/grid.css';

const stories = storiesOf('Complex Columns', module);
stories.addDecorator(withKnobs);

const columns: OptColumn[] = [
  {
    header: 'Name',
    name: 'name',
    sortable: true,
    sort: 'desc'
  },
  {
    header: 'Artist',
    name: 'artist'
  },
  {
    header: 'Type',
    name: 'type'
  },
  {
    header: 'Release',
    name: 'release'
  },
  {
    header: 'Genre',
    name: 'genre'
  },
  {
    header: 'Price',
    name: 'price'
  },
  {
    header: 'Download',
    name: 'downloadCount'
  },
  {
    header: 'Listen',
    name: 'listenCount'
  }
];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, bodyHeight: 400, ...options });

  return { el, grid };
}

stories.add(
  'complex columns',
  () => {
    const { el } = createGrid({
      data,
      columns,
      rowHeaders: ['rowNum', 'checkbox'],
      header: {
        height: 200,
        complexColumns: [
          {
            header: 'Basic',
            name: 'mergeColumn1',
            childNames: ['name', 'artist']
          },
          {
            header: 'Extra',
            name: 'mergeColumn2',
            childNames: ['type', 'release', 'genre']
          },
          {
            header: 'Detail',
            name: 'mergeColumn3',
            childNames: ['mergeColumn1', 'mergeColumn2']
          },
          {
            header: 'Count',
            name: 'mergeColumn4',
            childNames: ['downloadCount', 'listenCount']
          },
          {
            header: 'Album Info',
            name: 'mergeColumn5',
            childNames: ['price', 'mergeColumn3', 'mergeColumn4']
          }
        ]
      }
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);
