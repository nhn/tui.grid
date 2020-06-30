import Grid from '../src/grid';
import { PageOptions } from '../types/store/data';
import { data } from '../samples/pagination';
import '../src/css/grid.css';
import 'tui-pagination/dist/tui-pagination.css';

export default {
  title: 'Pagination',
};

const columns = [
  { name: 'deliveryType' },
  { name: 'productOrderNo' },
  { name: 'orderName' },
  { name: 'orderId' },
  { name: 'addressee' },
];

const appendData = {
  deliveryType: '-',
  productOrderNo: 0,
  orderName: 'Tester',
  orderId: '-',
  addressee: 'Tester',
  payState: '-',
  payType: '-',
  date: '-',
  productPrice: 0,
  deliveryState: '-',
  deliveryCompany: '-',
  deliveryPeeType: '-',
  deliveryNo: 0,
};

function createGrid(pageOptions?: PageOptions) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({
    el,
    data: data.slice(0, 100),
    columns,
    pageOptions: {
      useClient: true,
      perPage: 10,
      ...pageOptions,
    },
  });

  return { el, grid };
}

function clickLastPageBtnAsync(el: HTMLElement) {
  setTimeout(() => {
    const lastBtn = el.querySelector('.tui-page-btn.tui-last') as HTMLElement;
    lastBtn.click();
  });
}

export const firstPageBasic = () => {
  const { el } = createGrid();
  return el;
};

const pageBasicNote = `
## Pagination UI
- UI for basic pagination
- UI for exceeded range of pagination
`;

const positionTopNote = `
## Pagination UI
- UI for pagination which is rendered on \`position: top\`
`;

firstPageBasic.story = { parameters: { notes: pageBasicNote } };

export const lastPageBasic = () => {
  const { el } = createGrid();
  clickLastPageBtnAsync(el);
  return el;
};

lastPageBasic.story = { parameters: { notes: pageBasicNote } };

export const FirstPageInExceededRange = () => {
  const { el, grid } = createGrid();
  grid.appendRow(appendData);
  return el;
};

FirstPageInExceededRange.story = { parameters: { notes: pageBasicNote } };

export const lastPageInExceededRange = () => {
  const { el, grid } = createGrid();
  grid.appendRow(appendData);
  clickLastPageBtnAsync(el);
  return el;
};

lastPageInExceededRange.story = { parameters: { notes: pageBasicNote } };

export const positionTop = () => {
  const { el } = createGrid({ position: 'top' });

  return el;
};

positionTop.story = { parameters: { notes: positionTopNote } };
