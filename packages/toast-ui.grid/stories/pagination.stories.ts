import Grid from '../src/grid';
import { data } from '../samples/pagination';
import '../src/css/grid.css';
import 'tui-pagination/dist/tui-pagination.css';

export default {
  title: 'Pagination'
};

const columns = [
  { name: 'deliveryType' },
  { name: 'productOrderNo' },
  { name: 'orderName' },
  { name: 'orderId' },
  { name: 'addressee' }
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
  deliveryNo: 0
};

function createGrid() {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({
    el,
    data: data.slice(0, 100),
    columns,
    pageOptions: {
      useClient: true,
      perPage: 10
    }
  });

  return { el, grid };
}

function clickLastPageBtnAsync(el: HTMLElement) {
  setTimeout(() => {
    const lastBtn: HTMLElement = el.querySelector('.tui-page-btn.tui-last');
    lastBtn.click();
  });
}

export const firstPageBasic = () => {
  const { el } = createGrid();
  return el;
};

export const lastPageBasic = () => {
  const { el } = createGrid();
  clickLastPageBtnAsync(el);
  return el;
};

export const FirstPageInExceededRange = () => {
  const { el, grid } = createGrid();
  grid.appendRow(appendData);
  return el;
};

export const lastPageInExceededRange = () => {
  const { el, grid } = createGrid();
  grid.appendRow(appendData);
  clickLastPageBtnAsync(el);
  return el;
};

// export const basic = () => {
//   const { el, grid } = createGrid();
//   grid.appendRow(appendData);

//   return el;
// };

// stories.add(
//   'client pagination',
//   () => {
//     const { el, grid } = createGrid({
//       data: data.slice(0, 100),
//       columns,
//       bodyHeight: 'fitToParent',
//       rowHeaders: ['rowNum'],
//       columnOptions: {
//         frozenCount: 2,
//         minWidth: 150
//       },
//       pageOptions: {
//         useClient: true,
//         perPage: 10
//       }
//     });
//     const rootEl = document.createElement('div');
//     rootEl.appendChild(el);
//     rootEl.style.height = '400px';

//     const appendBtn = document.createElement('button');
//     const prependBtn = document.createElement('button');
//     const removeBtn = document.createElement('button');
//     const clearAllBtn = document.createElement('button');

//     appendBtn.textContent = 'appendRow';
//     prependBtn.textContent = 'prependRow';
//     removeBtn.textContent = 'removeRow';
//     clearAllBtn.textContent = 'clearAllBtn';

//     appendBtn.addEventListener('click', () => {
//       grid.appendRow(appendData, { at: 3 });
//     });

//     prependBtn.addEventListener('click', () => {
//       grid.prependRow(appendData);
//     });

//     removeBtn.addEventListener('click', () => {
//       grid.removeRow(5);
//     });

//     clearAllBtn.addEventListener('click', () => {
//       grid.clear();
//     });

//     rootEl.appendChild(appendBtn);
//     rootEl.appendChild(prependBtn);
//     rootEl.appendChild(removeBtn);
//     rootEl.appendChild(clearAllBtn);

//     return rootEl;
//   },
//   { html: { preventForcedRender: true } }
// );
