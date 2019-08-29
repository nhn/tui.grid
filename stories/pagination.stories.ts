import { storiesOf } from '@storybook/html';
import { withKnobs } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/pagination';
import '../src/css/grid.css';
import 'tui-pagination/dist/tui-pagination.css';

const stories = storiesOf('Pagination', module);
stories.addDecorator(withKnobs);

const columns = [
  { name: 'deliveryType', sortable: true, sortingType: 'desc' },
  { name: 'productOrderNo', sortable: true, sortingType: 'asc' },
  { name: 'orderName', editor: 'text' },
  { name: 'orderId', editor: 'text' },
  { name: 'addressee' },
  { name: 'payState' },
  { name: 'payType' },
  { name: 'date' },
  { name: 'productPrice' },
  { name: 'deliveryState' },
  { name: 'deliveryCompany' },
  { name: 'deliveryPeeType' },
  { name: 'deliveryNo' }
];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

const appendData = {
  deliveryType: '-',
  productOrderNo: 0,
  orderName: '한정',
  orderId: '-',
  addressee: '한정',
  payState: '-',
  payType: '-',
  date: '-',
  productPrice: 0,
  deliveryState: '-',
  deliveryCompany: '-',
  deliveryPeeType: '-',
  deliveryNo: 0
};

stories.add(
  'client pagination',
  () => {
    const { el, grid } = createGrid({
      data: data.slice(0, 100),
      columns,
      bodyHeight: 'fitToParent',
      rowHeaders: ['rowNum'],
      columnOptions: {
        frozenCount: 2,
        minWidth: 150
      },
      pageOptions: {
        useClient: true,
        perPage: 10
      }
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);
    rootEl.style.height = '400px';

    const appendBtn = document.createElement('button');
    const prependBtn = document.createElement('button');
    const removeBtn = document.createElement('button');
    const clearAllBtn = document.createElement('button');

    appendBtn.textContent = 'appendRow';
    prependBtn.textContent = 'prependRow';
    removeBtn.textContent = 'removeRow';
    clearAllBtn.textContent = 'clearAllBtn';

    appendBtn.addEventListener('click', () => {
      grid.appendRow(appendData, { at: 3 });
    });

    prependBtn.addEventListener('click', () => {
      grid.prependRow(appendData);
    });

    removeBtn.addEventListener('click', () => {
      grid.removeRow(5);
    });

    clearAllBtn.addEventListener('click', () => {
      grid.clear();
    });

    rootEl.appendChild(appendBtn);
    rootEl.appendChild(prependBtn);
    rootEl.appendChild(removeBtn);
    rootEl.appendChild(clearAllBtn);

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);
