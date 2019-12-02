import { data as sampleData } from '../../samples/dataSource/data';
import { data as sortedSampleData } from '../../samples/dataSource/sortedData';
import { runMockServer } from '../helper/runMockServer';
import { Dictionary } from '@/store/types';
import { DataSource } from '@/dataSource/types';
import GridEvent from '@/event/gridEvent';

const columns = [
  { name: 'id', minWidth: 150, sortable: true },
  { name: 'name', minWidth: 150 },
  { name: 'price', minWidth: 150 }
];

const data = {
  initialRequest: true,
  api: {
    readData: { url: '/api/read', method: 'GET' },
    createData: { url: '/api/create', method: 'POST' },
    updateData: { url: '/api/update', method: 'PUT' },
    deleteData: { url: '/api/delete', method: 'DELETE' },
    modifyData: { url: '/api/modify', method: 'POST' }
  }
};

function createSortButonAlias() {
  cy.getByCls('btn-sorting')
    .first()
    .as('first');
}

function assertDataLength(len: number) {
  cy.gridInstance()
    .invoke('getData')
    .should('have.length', len);
}

function assertIsModified(isModified: boolean) {
  cy.gridInstance()
    .invoke('isModified')
    .should('eq', isModified);
}

function assertModifiedRowsLength(type: string, len: number) {
  cy.gridInstance()
    .invoke('getModifiedRows')
    .its(type)
    .should('have.length', len);
}

function assertModifiedRowsContainsObject(type: string, obj: object) {
  cy.gridInstance()
    .invoke('getModifiedRows')
    .its(type)
    .should(rows => {
      expect(rows[0]).to.contain(obj);
    });
}

function assertSortedData(columnName: string, ascending = true) {
  const sortedData = ascending ? sortedSampleData : sampleData;
  const testData = (sortedData as Dictionary<any>[]).map(sample => String(sample[columnName]));

  cy.getColumnCells(columnName).each(($el, index) => {
    cy.wrap($el).should('have.text', testData[index]);
  });
}

function assertPagingData(columnName: string, page = 1, perPage = 10) {
  const pagingData = page === 1 ? sampleData.slice(0, perPage) : sampleData.slice(perPage);
  const testData = (pagingData as Dictionary<any>[]).map(sample => String(sample[columnName]));

  cy.getColumnCells(columnName)
    .filter(index => index < perPage)
    .each(($el, index) => {
      cy.wrap($el).should('have.text', testData[index]);
    });
}

function createGridWithDataSource(dataSource?: DataSource) {
  cy.createGrid({
    data: { ...(dataSource || data) },
    columns,
    useClientSort: false,
    pageOptions: { perPage: 10 }
  });
}

function getPageBtn() {
  return cy.get('.tui-page-btn');
}

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  runMockServer();
});

it('initialize grid with server side data', () => {
  createGridWithDataSource();

  assertDataLength(10);
  assertPagingData('name');
});

it('render grid with server side data when calls readData method', () => {
  createGridWithDataSource({ ...data, initialRequest: false });

  assertDataLength(0);

  cy.gridInstance().invoke('readData', 1);

  assertDataLength(10);
  assertPagingData('name');
});

describe('sort()', () => {
  beforeEach(() => {
    createGridWithDataSource();
    cy.wait('@readPage1');
  });

  it('check useClient is false', () => {
    cy.gridInstance()
      .invoke('getSortState')
      .should('be.deep.equal', {
        useClient: false,
        columns: [
          {
            columnName: 'sortKey',
            ascending: true
          }
        ]
      });
  });

  it('server side data is sorted properly', () => {
    createSortButonAlias();
    cy.get('@first').click();
    cy.wait('@readAscData');

    assertSortedData('id');
  });

  it('server side data is sorted properly when calls readData method', () => {
    const params = { sortColumn: 'id', sortAscending: true };
    cy.gridInstance().invoke('readData', 1, params, true);
    cy.wait('@readAscData');

    assertSortedData('id');
  });
});

describe('API', () => {
  beforeEach(() => {
    createGridWithDataSource();
    cy.wait('@readPage1');
  });

  it('reloadData()', () => {
    cy.gridInstance().invoke('removeRow', 1);
    cy.gridInstance().invoke('reloadData');

    cy.wait('@readPage1');

    assertIsModified(false);
  });

  it('restore()', () => {
    cy.gridInstance().invoke('removeRow', 1);
    cy.gridInstance().invoke('restore');

    assertPagingData('id', 1);
    assertModifiedRowsLength('deletedRows', 0);
  });

  it('setPerPage()', () => {
    getPageBtn().should('have.length', 6);
    assertPagingData('id', 1, 10);

    cy.gridInstance().invoke('setPerPage', 5);

    cy.wait('@perPage5');

    getPageBtn().should('have.length', 8);
    assertPagingData('id', 1, 5);
  });
});

it('server side data is sorted properly when moves page', () => {
  createGridWithDataSource({ ...data, initialRequest: false });

  cy.gridInstance().invoke('readData', 2);
  cy.wait('@readPage2');

  createSortButonAlias();
  cy.get('@first').click();
  cy.wait('@readAscData');

  assertSortedData('id');
});

describe('getModifiedRows(), request()', () => {
  beforeEach(() => {
    createGridWithDataSource();
    cy.wait('@readPage1');
  });

  it('check createdRow after calling appendRow method, createData request', () => {
    cy.gridInstance().invoke('appendRow', { id: 21, name: 'JS test', artist: 'JS' });

    assertModifiedRowsContainsObject('createdRows', {
      id: 21,
      name: 'JS test',
      artist: 'JS'
    });
    assertIsModified(true);

    cy.gridInstance().invoke('request', 'createData', { showConfirm: false });
    cy.wait('@createData');

    assertModifiedRowsLength('createdRows', 0);
  });

  it('check updatedRow after calling setValue method, updateData request', () => {
    cy.gridInstance().invoke('setValue', 2, 'name', 'JS');

    assertIsModified(true);

    cy.gridInstance().invoke('request', 'updateData', { showConfirm: false });
    cy.wait('@updateData');

    assertModifiedRowsLength('updatedRows', 0);
  });

  it('check modifyData after calling modifyData request', () => {
    const targetData = { id: 21, name: 'JS test', artist: 'JS' };
    cy.gridInstance().invoke('appendRow', targetData);
    cy.gridInstance().invoke('setValue', 2, 'name', 'JS');
    cy.gridInstance().invoke('removeRow', 1);

    cy.gridInstance().invoke('request', 'modifyData', { showConfirm: false });
    cy.wait('@modifyData');

    assertModifiedRowsLength('createdRows', 0);
    assertModifiedRowsLength('updatedRows', 0);
    assertModifiedRowsLength('deletedRows', 0);
    assertIsModified(false);
  });
});

describe('request()', () => {
  beforeEach(() => {
    createGridWithDataSource();
    cy.wait('@readPage1');
  });

  it('check request body when modifiedOnly is false', () => {
    cy.gridInstance().invoke('request', 'modifyData', { modifiedOnly: false, showConfirm: false });

    cy.wait('@modifyData')
      .its('requestBody')
      .should('contain', 'rows%5B0%5D%5Bid%5D=20&rows%5B0%5D%5Bname%5D=Chaos+And+The+Calm');
  });

  it('check request body when checkedOnly is true', () => {
    cy.gridInstance().invoke('setValue', 2, 'name', 'JS test');
    cy.gridInstance().invoke('request', 'modifyData', { checkedOnly: true, showConfirm: false });

    cy.wait('@modifyData')
      .its('requestBody')
      .should('eq', '');

    cy.gridInstance().invoke('check', 2);
    cy.gridInstance().invoke('request', 'modifyData', { checkedOnly: true, showConfirm: false });

    cy.wait('@modifyData')
      .its('requestBody')
      .should('be.not.eq', '');
  });

  it('check confirm message', () => {
    const stub = cy.stub();
    const targetData = { id: 21, name: 'JS test', artist: 'JS' };

    cy.on('window:confirm', stub);
    cy.gridInstance().invoke('appendRow', targetData);
    cy.gridInstance().invoke('request', 'modifyData', { showConfirm: true });

    cy.wrap(stub).should('be.calledWithMatch', 'Are you sure you want to modify 1 data?');
  });

  it('check alert message', () => {
    const stub = cy.stub();

    cy.on('window:alert', stub);
    cy.gridInstance().invoke('request', 'createData', { showConfirm: true });

    cy.wrap(stub).should('be.calledWithMatch', 'No data to create.');
  });

  it('stopping custom event prevents default.', () => {
    const onBeforeRequest = cy.stub();
    const onResponse = (ev: GridEvent) => {
      ev.stop();
    };
    const onSuccessResponse = cy.stub();

    cy.gridInstance().invoke('on', 'beforeRequest', onBeforeRequest);
    cy.gridInstance().invoke('on', 'response', onResponse);
    cy.gridInstance().invoke('on', 'successResponse', onSuccessResponse);
    cy.gridInstance().invoke('removeRow', 10);

    cy.gridInstance().invoke('request', 'modifyData', { showConfirm: false });

    cy.wait('@modifyData');

    cy.wrap(onBeforeRequest).should('be.called');
    cy.wrap(onSuccessResponse).should('be.not.called');
  });
});
