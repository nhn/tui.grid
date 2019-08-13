import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Header align', module);
stories.addDecorator(withKnobs);

const columns = [
  { name: 'name' },
  { name: 'artist' },
  { name: 'type' },
  { name: 'release' },
  { name: 'genre' },
  { name: 'genreCode' },
  { name: 'grade' },
  { name: 'price' },
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
  'header',
  () => {
    const { el } = createGrid({
      data,
      columns,
      bodyHeight: 'fitToParent',
      columnOptions: {
        frozenCount: 2,
        minWidth: 150
      },
      rowHeaders: [
        {
          type: 'rowNum',
          align: 'left',
          valign: 'bottom'
        },
        {
          type: 'checkbox',
          align: 'left',
          valign: 'top'
        }
      ],
      header: {
        height: 40,
        align: 'left',
        valign: 'top',
        columns: [
          {
            name: '_number',
            valign: 'bottom'
          },
          {
            name: 'type',
            align: 'left',
            valign: 'middle'
          },
          {
            name: 'release',
            align: 'center'
          }
        ]
      }
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);
    rootEl.style.height = '400px';

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);
