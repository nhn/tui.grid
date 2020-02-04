import { data as sampleData } from '../../samples/dataSource/data';
import { data as sortedSampleData } from '../../samples/dataSource/sortedData';
import { runMockServer } from '../helper/runMockServer';
import { Dictionary } from '@/store/types';
import { DataSource, Params, AjaxConfig } from '@/dataSource/types';
import GridEvent from '@/event/gridEvent';
import { deepCopy } from '@/helper/common';
import { cls } from '@/helper/dom';

const columns = [
  { name: 'id', minWidth: 150, sortable: true, editor: 'text' },
  { name: 'name', minWidth: 150, editor: 'text' }
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

function createGrid(dataSource?: DataSource) {
  cy.createGrid({
    data: { ...(dataSource || data) },
    columns,
    useClientSort: false,
    pageOptions: { perPage: 10 }
  });
}

function createGridWithConfig(optionType: string, stub: Function) {
  const config: AjaxConfig = {
    contentType: 'application/json',
    headers: { 'x-custom-header': 'x-custom-header' },
    serializer(params: Params) {
      stub();
      return Cypress.$.param(params);
    }
  };

  if (optionType === 'dataSource') {
    createGrid({ ...config, ...deepCopy(data) });
  } else {
    createGrid({
      contentType: 'application/x-www-form-urlencoded',
      api: {
        readData: {
          url: '/api/read',
          method: 'GET',
          ...config
        },
        updateData: {
          url: '/api/update',
          method: 'PUT',
          ...config
        }
      }
    });
  }
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
  createGrid();

  assertDataLength(10);
  assertPagingData('name');
});

describe('create grid with dataSource config', () => {
  ['dataSource', 'api'].forEach(optionType => {
    it(`The ${optionType} config for ajax is applied properly`, () => {
      const stub = cy.stub();
      createGridWithConfig(optionType, stub);

      cy.wait('@readPage1')
        .its('requestHeaders')
        .should('contain', { 'x-custom-header': 'x-custom-header' });
      cy.wrap(stub).should('be.calledOnce');

      stub.reset();

      cy.gridInstance().invoke('request', 'updateData', { showConfirm: false });

      cy.wait('@updateData')
        .its('requestHeaders')
        .should('contain', {
          'x-custom-header': 'x-custom-header',
          'Content-Type': 'application/json; charset=UTF-8'
        });
      cy.wrap(stub).should('be.calledOnce');
    });
  });

  it('calling readData should be successful with initParams option', () => {
    createGrid({
      api: { readData: { url: '/api/read', method: 'GET', initParams: { a: '1' } } }
    });
    cy.wait('@readPageWithInitParams');

    assertDataLength(10);
    assertPagingData('name');
  });

  it('request should be successful with url function type option', () => {
    createGrid({
      api: { readData: { url: () => '/api/read', method: 'GET' } }
    });
    cy.wait('@readPage1');

    assertDataLength(10);
    assertPagingData('name');
  });

  it('hideLoadingBar option should be applied properly', () => {
    createGrid({
      api: { readData: { url: '/api/read', method: 'GET', initParams: { a: '1' } } },
      hideLoadingBar: true
    });

    cy.get(`.${cls('layer-state-loading')}`, { timeout: 500 }).should('not.exist');
  });
});

it('render grid with server side data when calls readData method', () => {
  createGrid({ ...data, initialRequest: false });

  assertDataLength(0);

  cy.gridInstance().invoke('readData', 1);

  assertDataLength(10);
  assertPagingData('name');
});

describe('sort()', () => {
  beforeEach(() => {
    createGrid();
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
    createGrid();
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

  context('setRequestParams()', () => {
    it('with readData API', () => {
      cy.gridInstance().invoke('setRequestParams', { a: 2 });
      cy.gridInstance().invoke('readData', 1);

      cy.wait('@readPageWithRequestParams')
        .its('status')
        .should('eq', 200);
    });

    it('with request API', () => {
      cy.gridInstance().invoke('setRequestParams', { a: 2 });
      cy.gridInstance().invoke('request', 'updateData', { showConfirm: false });

      cy.wait('@updateData')
        .its('requestBody')
        .should('eq', 'a=2');
    });
  });
});

it('server side data is sorted properly when moves page', () => {
  createGrid({ ...data, initialRequest: false });

  cy.gridInstance().invoke('readData', 2);
  cy.wait('@readPage2');

  createSortButonAlias();
  cy.get('@first').click();
  cy.wait('@readAscData');

  assertSortedData('id');
});

describe('getModifiedRows(), request()', () => {
  beforeEach(() => {
    createGrid();
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
    createGrid();
    cy.wait('@readPage1');
  });

  it('check request body when modifiedOnly is false', () => {
    cy.gridInstance().invoke('request', 'modifyData', { modifiedOnly: false, showConfirm: false });

    cy.wait('@modifyData')
      .its('requestBody')
      .should('contain', 'rows');
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
});

describe('custom request event', () => {
  beforeEach(() => {
    createGrid();
  });

  it('xhr instance is included as custom event parameter', () => {
    const onBeforeRequest = cy.stub();
    const onResponse = cy.stub();
    const onSuccessResponse = cy.stub();

    cy.gridInstance().invoke('on', 'beforeRequest', onBeforeRequest);
    cy.gridInstance().invoke('on', 'response', onResponse);
    cy.gridInstance().invoke('on', 'successResponse', onSuccessResponse);

    setTimeout(() => {
      cy.wait('@readPage1');

      const xhr = {
        url: 'http://localhost:8000/api/read?perPage=10&page=1'
      };

      cy.wrap(onBeforeRequest).should('be.calledWithMatch', { xhr });
      cy.wrap(onResponse).should('be.calledWithMatch', { xhr });
      cy.wrap(onSuccessResponse).should('be.calledWithMatch', { xhr });
    });
  });
});

it('stop custom event if prev event is prevented.', () => {
  createGrid({
    api: {
      readData: { url: () => '/api/read', method: 'GET' },
      modifyData: { url: '/api/modify', method: 'POST' }
    },
    initialRequest: false
  });

  const onBeforeRequest = cy.stub();
  const onResponse = (ev: GridEvent) => {
    ev.stop();
  };
  const onSuccessResponse = cy.stub();

  cy.gridInstance().invoke('on', 'beforeRequest', onBeforeRequest);
  cy.gridInstance().invoke('on', 'response', onResponse);
  cy.gridInstance().invoke('on', 'successResponse', onSuccessResponse);

  cy.gridInstance().invoke('request', 'modifyData', { showConfirm: false });

  cy.wait('@modifyData');

  cy.wrap(onBeforeRequest).should('be.called');
  cy.wrap(onSuccessResponse).should('be.not.called');
});
