import Grid from '../src/grid';
import { OptGrid, OptColumn } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/tree';
import '../src/css/grid.css';

export default {
  title: 'Complex Header'
};

const columns: OptColumn[] = [
  {
    header: 'Name',
    name: 'name',
    sortable: true,
    filter: 'text',
    resizable: true
  },
  {
    header: 'Artist',
    name: 'artist',
    sortable: true,
    sortingType: 'desc',
    filter: 'text',
    resizable: true
  },
  {
    header: 'Type',
    name: 'type',
    resizable: true
  },
  {
    header: 'Release',
    name: 'release',
    resizable: true
  },
  {
    header: 'Genre',
    name: 'genre',
    resizable: true
  },
  {
    header: 'Price',
    name: 'price',
    resizable: true
  },
  {
    header: 'Download',
    name: 'downloadCount',
    resizable: true
  },
  {
    header: 'Listen',
    name: 'listenCount',
    resizable: true
  }
];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, bodyHeight: 400, ...options });

  return { el, grid };
}

export const complexColumns = () => {
  const { el } = createGrid({
    data,
    columns,
    rowHeaders: ['rowNum', 'checkbox'],
    header: {
      height: 200,
      complexColumns: [
        {
          header: 'Extra',
          name: 'mergeColumn2',
          childNames: ['type', 'release', 'genre']
        },
        {
          header: 'Detail',
          name: 'mergeColumn3',
          childNames: ['mergeColumn6', 'mergeColumn2']
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
        },
        {
          header: 'name',
          name: 'mergeColumn6',
          childNames: ['name', 'artist'],
          hideChildColumns: true
        }
      ]
    }
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
};
