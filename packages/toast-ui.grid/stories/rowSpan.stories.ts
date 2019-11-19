import Grid from '../src/grid';
import { OptGrid, OptRow } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import '../src/css/grid.css';

export default {
  title: 'RowSpan'
};

const columns = [
  { name: 'name', editor: 'text' },
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

  optRows[2]._attributes = {
    rowSpan: {
      type: 2
    }
  };

  optRows[3]._attributes = {
    rowSpan: {
      name: 3
    }
  };

  optRows[4]._attributes = {
    rowSpan: {
      artist: 3
    }
  };

  return optRows;
}

export const basic = () => {
  const { el, grid } = createGrid({
    data: createDataWithRowSpanAttr(),
    columns,
    bodyHeight: 'fitToParent'
  });

  const rootEl = document.createElement('div');
  rootEl.appendChild(el);
  rootEl.style.height = '400px';

  grid.setSelectionRange({ start: [3, 0], end: [3, 1] });

  return rootEl;
};

const basicNote = `
## Row Span

- For Cells with rowspan, selection is applied as one cell shown in the example.
`;
basic.story = { parameters: { notes: basicNote } };
