import Grid from '../src/grid';
import '../src/css/grid.css';

export default {
  title: 'Virtual Scrolling'
};

const ROW_COUNT = 100000;
const COL_COUNT = 10;

interface AnyIndex {
  [propName: string]: unknown;
}

export const basic = () => {
  const data = [];
  const columns = [];

  for (let i = 0; i < ROW_COUNT; i += 1) {
    const row: AnyIndex = { id: i };
    for (let j = 0; j < COL_COUNT; j += 1) {
      row[`c${j}`] = (Math.random() * 100000000000).toFixed();
    }
    data.push(row);
  }

  for (let i = 0; i < COL_COUNT; i += 1) {
    const name = `c${i}`;
    columns.push({ name, header: name });
  }

  const el = document.createElement('div');
  const width = 1000;
  const bodyHeight = 800;

  new Grid({ el, data, columns, width, bodyHeight });

  return el;
};

const basicNote = `
## Virtual Scrolling

- Grid with \`1,000,000\` Cells, \`100,000\` Rows.
`;
basic.story = { parameters: { notes: basicNote } };
