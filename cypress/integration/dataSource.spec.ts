import { cls, dataAttr } from '../../src/helper/dom';
import { data as sampleData } from '../../samples/dataSource/data';
import { data as sortedSampleData } from '../../samples/dataSource/sortedData';
import { runMockServer } from '../helper/runMockServer';
import { isSubsetOf } from '../helper/compare';
import { Dictionary } from '@/store/types';
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
  cy.get(`.${cls('btn-sorting')}`)
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
  cy.wait(100);
  cy.gridInstance()
    .invoke('getModifiedRows')
    .its(type)
    .should('have.length', len);
}

function assertModifiedRowsContainsObject(type: string, obj: object) {
  cy.gridInstance()
    .invoke('getModifiedRows')
    .its(type)
    .should((rows) => {
      expect(rows[0]).to.contain(obj);
    });
}

function assertModifiedRowsNotContainsObject(type: string, obj: object) {
  cy.gridInstance()
    .invoke('getModifiedRows')
    .its(type)
    .should((rows) => {
      expect(rows[0]).to.not.contain(obj);
    });
}

function assertSortedData(columnName: string, ascending = true) {
  const sortedData = ascending ? sortedSampleData : sampleData;
  const testData = (sortedData as Dictionary<any>[]).map((sample) => String(sample[columnName]));

  cy.get(`td[${dataAttr.COLUMN_NAME}=${columnName}]`).each(($el, index) => {
    expect($el.text()).to.eql(testData[index]);
  });
}

function assertPagingData(columnName: string, page = 1) {
  const pagingData = page === 1 ? sampleData.slice(0, 10) : sampleData.slice(10);
  const testData = (pagingData as Dictionary<any>[]).map((sample) => String(sample[columnName]));

  cy.get(`td[${dataAttr.COLUMN_NAME}=${columnName}]`).each(($el, index) => {
    expect($el.text()).to.eql(testData[index]);
  });
}

function assertRequestCallArgs(requestStub: any, args?: any) {
  const defaultArgs = {
    xhr: {
      response: '{"result":true,"data":{}}',
      responseText: '{"result":true,"data":{}}',
      status: 200
    }
  };
  expect(isSubsetOf(args || defaultArgs, requestStub.args[0][0])).to.be.true;
}

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
  runMockServer();

  cy.createGrid({
    data,
    columns,
    rowHeaders: ['_number', '_checked'],
    useClientSort: false,
    pageOptions: { perPage: 10 }
  });
  cy.wait(10);
});

it('initialize grid with server side data', () => {
  const testData = sampleData.map((sample) => String(sample.name));
  cy.get(`td[${dataAttr.COLUMN_NAME}=name]`).each(($el, index) => {
    expect($el.text()).to.eql(testData[index]);
  });
});

it('render grid with server side data when calls readData method', () => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
  cy.createGrid({
    data: { ...data, initialRequest: false },
    columns,
    useClientSort: false,
    pageOptions: { perPage: 10 }
  });
  const testData = sampleData.map((sample) => String(sample.name));

  assertDataLength(0);

  cy.gridInstance()
    .invoke('readData', 1)
    .then(() => {
      cy.get(`td[${dataAttr.COLUMN_NAME}=name]`).each(($el, index) => {
        expect($el.text()).to.eql(testData[index]);
      });
    });

  assertDataLength(10);
});

describe('getModifiedRows(), request()', () => {
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

  it('check deletedRow after calling removeRow method, deleteData request', () => {
    cy.gridInstance().invoke('removeRow', 1);

    assertModifiedRowsContainsObject('deletedRows', {
      id: 19,
      name: 'The Magic Whip',
      artist: 'Blur'
    });
    assertIsModified(true);

    cy.gridInstance().invoke('request', 'deleteData', { showConfirm: false });
    cy.wait('@deleteData');

    assertModifiedRowsLength('deletedRows', 0);
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

  it('add modifiedRow properly when event target row is same', () => {
    const targetData = { id: 21, name: 'JS test', artist: 'JS' };
    cy.gridInstance().invoke('appendRow', targetData);
    cy.gridInstance().invoke('setValue', 21, 'name', 'JS test');

    assertModifiedRowsLength('updatedRows', 0);
    assertModifiedRowsLength('createdRows', 1);

    cy.gridInstance().invoke('setValue', 21, 'name', 'JS test2');
    cy.gridInstance().invoke('removeRow', 10);

    assertModifiedRowsLength('updatedRows', 0);
    assertModifiedRowsLength('deletedRows', 1);

    cy.gridInstance().invoke('removeRow', 8);

    assertModifiedRowsLength('createdRows', 0);
    assertModifiedRowsLength('deletedRows', 2);
  });
  it('add modifiedRow without ignored column', () => {
    cy.document().then((doc) => {
      doc.body.innerHTML = '';
    });
    cy.createGrid({
      data,
      columns: [
        { name: 'id', minWidth: 150, ignored: true },
        { name: 'name', minWidth: 150 },
        { name: 'price', minWidth: 150 }
      ],
      useClientSort: false,
      pageOptions: { perPage: 10 }
    });
    cy.gridInstance().invoke('appendRow', { id: 21, name: 'JS test', artist: 'JS' });

    assertModifiedRowsNotContainsObject('createdRows', { id: 21 });
    assertModifiedRowsContainsObject('createdRows', {
      name: 'JS test',
      artist: 'JS'
    });
  });
});

describe('request()', () => {
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
      .should('be.eql', '');

    cy.gridInstance().invoke('check', 2);
    cy.gridInstance().invoke('request', 'modifyData', { checkedOnly: true, showConfirm: false });
    cy.wait('@modifyData')
      .its('requestBody')
      .should('be.not.eql', '');
  });

  it('check confirm message', () => {
    cy.on('window:confirm', (message) => {
      expect(message).to.eql('Are you sure you want to modify 1 data?');
    });
    const targetData = { id: 21, name: 'JS test', artist: 'JS' };

    cy.gridInstance().invoke('appendRow', targetData);
    cy.gridInstance().invoke('request', 'modifyData', { showConfirm: true });
  });

  it('check alert message', () => {
    cy.on('window:alert', (message) => {
      expect(message).to.eql('No data to create.');
    });
    cy.gridInstance().invoke('request', 'createData', { showConfirm: true });
  });

  it('trigger custom request callback', () => {
    const onBeforeRequest = cy.stub();
    const onResponse = cy.stub();
    const onSuccessResponse = cy.stub();

    cy.gridInstance().invoke('on', 'beforeRequest', onBeforeRequest);
    cy.gridInstance().invoke('on', 'response', onResponse);
    cy.gridInstance().invoke('on', 'successResponse', onSuccessResponse);
    cy.gridInstance().invoke('removeRow', 10);
    cy.gridInstance().invoke('request', 'modifyData', { showConfirm: false });

    cy.wait('@modifyData').then(() => {
      assertRequestCallArgs(onBeforeRequest, { options: { url: '/api/modify', method: 'POST' } });
      assertRequestCallArgs(onResponse);
      assertRequestCallArgs(onSuccessResponse);
    });
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

    cy.wait('@modifyData').then(() => {
      expect(onBeforeRequest).to.have.been.called;
      expect(onSuccessResponse).to.not.have.been.called;
    });
  });
});

describe('sort()', () => {
  it('check useClient is false', () => {
    cy.gridInstance()
      .invoke('getSortState')
      .should((sortState) => {
        expect(sortState).to.eql({
          ascending: true,
          columnName: 'rowKey',
          useClient: false
        });
      });
  });

  it('server side data is sorted properly', () => {
    createSortButonAlias();
    cy.get('@first').click();
    cy.wait('@readAscData');
    assertSortedData('id');
  });

  it('server side data is sorted properly when calls readData method', () => {
    cy.gridInstance().invoke(
      'readData',
      1,
      {
        sortColumn: 'id',
        sortAscending: true
      },
      true
    );
    cy.wait('@readAscData');
    assertSortedData('id');
  });

  it('server side data is sorted properly when moves page', () => {
    cy.document().then((doc) => {
      doc.body.innerHTML = '';
    });
    cy.createGrid({
      data: { ...data, initialRequest: false },
      columns,
      useClientSort: false,
      pageOptions: { perPage: 10 }
    });
    cy.gridInstance().invoke('readData', 2);
    cy.wait('@readPage2');

    createSortButonAlias();
    cy.get('@first').click();
    cy.wait('@readAscData');
    assertSortedData('id');
  });
});

describe('pagination()', () => {
  it('check getPagination is not null', () => {
    cy.gridInstance()
      .invoke('getPagination')
      .should('be.not.eql', null);
  });

  it('move page properly', () => {
    cy.gridInstance()
      .invoke('getPagination')
      .then((pagination) => {
        cy.wait('@readPage1');
        expect(pagination.getCurrentPage()).to.eql(1);
        assertPagingData('id', 1);

        pagination.movePageTo(2);
        expect(pagination.getCurrentPage()).to.eql(2);
        cy.wait('@readPage2');
        assertPagingData('id', 2);

        cy.gridInstance().invoke('setPerPage', 10);
        cy.wait('@readPage1');
        assertPagingData('id', 1);
      });
  });
});

it('reloadData()', () => {
  cy.gridInstance().invoke('removeRow', 1);
  assertModifiedRowsLength('deletedRows', 1);

  cy.gridInstance().invoke('reloadData');
  cy.wait('@readPage1');
  assertModifiedRowsLength('deletedRows', 0);
});

it('restore()', () => {
  cy.gridInstance().invoke('removeRow', 1);
  assertModifiedRowsLength('deletedRows', 1);

  cy.gridInstance().invoke('restore');
  cy.wait('@readPage1');
  assertPagingData('id', 1);
  assertModifiedRowsLength('deletedRows', 0);
});
