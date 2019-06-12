import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid, OptRow } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('RowSpan', module);
stories.addDecorator(withKnobs);

const columns = [
  { name: 'name', editor: 'text', sortable: true },
  { name: 'artist', editor: 'text' },
  { name: 'type', editor: 'text' }
];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

function createDataWithRowSpanAttr(): OptRow[] {
  const optRows: OptRow[] = data.slice();
  optRows[0]._attributes = {
    rowSpan: {
      name: 2,
      artist: 3
    }
  };

  optRows[3]._attributes = {
    rowSpan: {
      name: 3
    }
  };

  optRows[10]._attributes = {
    rowSpan: {
      type: 2
    }
  };

  return optRows;
}

stories.add(
  'rowSpan',
  () => {
    const { el, grid } = createGrid({
      data: createDataWithRowSpanAttr(),
      columns,
      bodyHeight: 'fitToParent'
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);
    rootEl.style.height = '400px';

    button('unsort()', () => grid.unsort());
    button('setSelectionRange({ start: 0, 0, end: 1, 1 })', () =>
      grid.setSelectionRange({ start: [0, 0], end: [1, 1] })
    );

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);
