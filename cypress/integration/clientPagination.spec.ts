import { data } from '../../samples/pagination';
import { cls } from '@/helper/dom';

const columns = [
  { name: 'deliveryType', sortable: true, sortingType: 'desc', filter: 'text' },
  { name: 'productOrderNo' },
  { name: 'orderName' },
  { name: 'orderId' }
];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
  cy.createGrid({
    data: data.slice(0, 80),
    columns,
    pageOptions: {
      useClient: true,
      perPage: 10
    },
    rowHeaders: ['rowNum']
  });
});

it('데이터의 갯수에 맞게 페이지가 표시된다.', () => {
  cy.get(`.tui-page-btn.tui-last-child`).contains('8');
});

it('소팅 후 페이지를 이동하여도 소팅은 계속 유지된다.', () => {
  cy.get(`.${cls('btn-sorting')}`).click();

  cy.get(`a.tui-page-btn`)
    .first()
    .click();

  cy.get(`.${cls('btn-sorting')}`)
    .first()
    .should('have.class', cls('btn-sorting-down'));
});

it.only('filter의 결과가 pagination에 즉시 반영된다.', () => {
  cy.get(`.${cls('btn-filter')}`)
    .click()
    .then(() => {
      cy.get(`.${cls('filter-input')}`).type('택배');
    });
});

it('appendRow시 pagination에 반영된다.', () => {});

it('prependRow시 pagination에 반영된다.', () => {});

it('removeRow시 pagination에 반영된다.', () => {});

it('resetData시 pagination에 반영된다.', () => {});

it('clearAll시 pagination에 반영된다.', () => {});

it('page 이동 시 row number는 계속해서 이어져서 증가한다.', () => {});
