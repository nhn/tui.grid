import { cls, dataAttr } from '../../src/helper/dom';
import { data as sampleData } from '../../samples/dataSource/data';
import { data as sortedSampleData } from '../../samples/dataSource/sortedData';
import { runMockServer } from '../helper/runMockServer';
import { isSubsetOf } from '../helper/compare';
import { Dictionary } from '@/store/types';

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

function assertModifiedRowsNotContainsObject(type: string, obj: object) {
  cy.gridInstance()
    .invoke('getModifiedRows')
    .its(type)
    .should(rows => {
      expect(rows[0]).to.not.contain(obj);
    });
}

function assertSortedData(columnName: string, ascending = true) {
  const sortedData = ascending ? sortedSampleData : sampleData;
  const testData = (sortedData as Dictionary<any>[]).map(sample => String(sample[columnName]));

  cy.get(`td[${dataAttr.COLUMN_NAME}=${columnName}]`).should($el => {
    $el.each((index, elem) => {
      expect(elem.textContent).to.eql(testData[index]);
    });
  });
}

function assertPagingData(columnName: string, page = 1) {
  const pagingData = page === 1 ? sampleData.slice(0, 10) : sampleData.slice(10);
  const testData = (pagingData as Dictionary<any>[]).map(sample => String(sample[columnName]));

  cy.get(`td[${dataAttr.COLUMN_NAME}=${columnName}]`).should($el => {
    $el.each((index, elem) => {
      expect(elem.textContent).to.eql(testData[index]);
    });
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
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
  runMockServer();

  cy.createGrid({
    data,
    columns,
    rowHeaders: ['rowNum', 'checkbox'],
    useClientSort: false,
    pageOptions: { perPage: 10 }
  });
});

it('initialize grid with server side data', () => {
  const testData = sampleData.map(sample => String(sample.name));
  cy.get(`td[${dataAttr.COLUMN_NAME}=name]`).each(($el, index) => {
    expect($el.text()).to.eql(testData[index]);
  });
});

it('render grid with server side data when calls readData method', () => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
  cy.createGrid({
    data: { ...data, initialRequest: false },
    columns,
    useClientSort: false,
    pageOptions: { perPage: 10 }
  });
  const testData = sampleData.map(sample => String(sample.name));

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

describe('sort()', () => {
  it('check useClient is false', () => {
    cy.gridInstance()
      .invoke('getSortState')
      .should(sortState => {
        expect(sortState).to.eql({
          columns: [
            {
              columnName: 'sortKey',
              ascending: true
            }
          ],
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
    cy.document().then(doc => {
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

it('reloadData()', () => {
  cy.wait('@readPage1');
  cy.gridInstance().invoke('removeRow', 1);
  cy.gridInstance().invoke('reloadData');

  cy.wait('@readPage1');
  assertIsModified(false);
});

it('restore()', () => {
  cy.wait('@readPage1');
  cy.gridInstance().invoke('removeRow', 1);
  cy.gridInstance().invoke('restore');

  assertPagingData('id', 1);
  assertModifiedRowsLength('deletedRows', 0);
});
