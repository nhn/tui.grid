import Grid from '../src/grid';
import { OptGrid, OptRow } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import '../src/css/grid.css';
import { range } from '../src/helper/common';

export default {
  title: 'Dimension'
};

const columns = [{ name: 'name' }, { name: 'artist' }];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';
  const grid = new Grid({ el, ...options });

  return { el, grid };
}

export const bodyHeightFitToParent = () => {
  const { el } = createGrid({ data, columns, bodyHeight: 'fitToParent' });
  const rootEl = document.createElement('div');
  rootEl.style.height = '200px';
  rootEl.appendChild(el);

  return rootEl;
};
const bodyHeightFitToParentNote = `
## Body Height: \`fitToParent\`
- Render the body height with fitting parent height
`;

bodyHeightFitToParent.story = { parameters: { notes: bodyHeightFitToParentNote } };

export const bodyHeightAuto = () => {
  return createGrid({ data, columns }).el;
};
const bodyHeightAutoNote = `
## Body Height: \`auto(default)\`
- Render the body height with its all row heights regardless of parent height
`;

bodyHeightAuto.story = { parameters: { notes: bodyHeightAutoNote } };

export const bodyHeight500 = () => {
  return createGrid({ data, columns, bodyHeight: 500 }).el;
};
const bodyHeight500Note = `
## Body Height: \`500\`
- Render the body height with fixed height(\`500\`)
`;

bodyHeight500.story = { parameters: { notes: bodyHeight500Note } };

export const rowHeight70 = () => {
  return createGrid({ data, columns, rowHeight: 70 }).el;
};
const rowHeight70Note = `
## Row Height: \`70\`
- Render the common row height with fixed height(\`70\`)
`;

rowHeight70.story = { parameters: { notes: rowHeight70Note } };

export const rowHeightCustom = () => {
  const myData: OptRow[] = data.map(row => ({ ...row })).slice(0, 5);
  myData[0]._attributes = {
    height: 100
  };
  myData[2]._attributes = {
    height: 200
  };

  return createGrid({ data: myData, columns, bodyHeight: 500 }).el;
};
const rowHeightCustomNote = `
## Custom Row Height
- Render the row height with individual custom height
`;

rowHeightCustom.story = { parameters: { notes: rowHeightCustomNote } };

export const rowHeightAuto = () => {
  const myColumns: OptGrid['columns'] = [
    { name: 'col1', whiteSpace: 'pre' },
    { name: 'col2', whiteSpace: 'normal' }
  ];
  const myData = [
    {
      col1: 'Long\n\n\n\n\n\nSeven new lines',
      col2: 'Short'
    },
    {
      col1: 'Short',
      col2: range(100).join('-')
    }
  ];

  return createGrid({ data: myData, columns: myColumns, rowHeight: 'auto' }).el;
};
const rowHeightAutoNote = `
## Row Height: \`auto\`
- Render row height for length of the content dynamically
`;

rowHeightAuto.story = { parameters: { notes: rowHeightAutoNote } };
