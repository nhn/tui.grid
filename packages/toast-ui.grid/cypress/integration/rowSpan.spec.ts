import { data as sample } from '../../samples/basic';
import { OptRow } from '@/types';
import { RowKey, RowSpan } from '@/store/types';

function createDataWithRowSpanAttr(): OptRow[] {
  const optRows: OptRow[] = sample.slice();
  optRows[0]._attributes = {
    rowSpan: {
      name: 2,
      artist: 3
    }
  };

  optRows[3]._attributes = {
    rowSpan: {
      name: 3
    }
  };

  optRows[4]._attributes = {
    rowSpan: {
      artist: 3
    }
  };

  optRows[10]._attributes = {
    rowSpan: {
      type: 2
    }
  };

  return optRows;
}

function assertRowSpanData(rowKey: RowKey, columnName: string, rowSpan: RowSpan) {
  cy.gridInstance()
    .invoke('getRowSpanData', rowKey, columnName)
    .should(rowSpanData => {
      expect(rowSpanData).to.contain(rowSpan);
    });
}

before(() => {
  cy.visit('/dist');
});

const data = createDataWithRowSpanAttr();
const columns = [
  { name: 'name', editor: 'text', sortable: true },
  { name: 'artist', editor: 'text' },
  { name: 'type', editor: 'text' }
];

it('render rowSpan cell properly', () => {
  cy.createGrid({ data, columns });
  cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
  cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '3');
  cy.getCell(3, 'name').should('have.attr', 'rowSpan', '3');
  cy.getCell(4, 'artist').should('have.attr', 'rowSpan', '3');
});

describe('getRowSpanData()', () => {
  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  it('getRowSpanData(0, name)', () => {
    assertRowSpanData(0, 'name', { mainRow: true, mainRowKey: 0, count: 2, spanCount: 2 });
  });

  it('getRowSpanData(4, name)', () => {
    assertRowSpanData(4, 'name', { mainRow: false, mainRowKey: 3, count: -1, spanCount: 3 });
  });
});

describe('appendRow()', () => {
  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  it('appendRow at 1 with extendPrevRowSpan options: true', () => {
    cy.gridInstance().invoke(
      'appendRow',
      { name: 'JS test', artist: 'JS', type: 'TEST' },
      { at: 1, extendPrevRowSpan: true }
    );

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '3');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '4');

    assertRowSpanData(0, 'name', { mainRow: true, mainRowKey: 0, count: 3, spanCount: 3 });
    assertRowSpanData(20, 'name', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 3 });
    assertRowSpanData(1, 'name', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 3 });

    assertRowSpanData(0, 'artist', { mainRow: true, mainRowKey: 0, count: 4, spanCount: 4 });
    assertRowSpanData(20, 'artist', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 4 });
    assertRowSpanData(1, 'artist', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 4 });
    assertRowSpanData(2, 'artist', { mainRow: false, mainRowKey: 0, count: -3, spanCount: 4 });
  });

  it('appendRow at 1 with extendPrevRowSpan options: false', () => {
    cy.gridInstance().invoke(
      'appendRow',
      { name: 'JS test', artist: 'JS', type: 'TEST' },
      { at: 1, extendPrevRowSpan: false }
    );

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '3');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '4');

    assertRowSpanData(0, 'name', { mainRow: true, mainRowKey: 0, count: 3, spanCount: 3 });
    assertRowSpanData(20, 'name', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 3 });
    assertRowSpanData(1, 'name', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 3 });

    assertRowSpanData(0, 'artist', { mainRow: true, mainRowKey: 0, count: 4, spanCount: 4 });
    assertRowSpanData(20, 'artist', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 4 });
    assertRowSpanData(1, 'artist', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 4 });
    assertRowSpanData(2, 'artist', { mainRow: false, mainRowKey: 0, count: -3, spanCount: 4 });
  });

  it('appendRow at 2 with extendPrevRowSpan options: true', () => {
    cy.gridInstance().invoke(
      'appendRow',
      { name: 'JS test', artist: 'JS', type: 'TEST' },
      { at: 2, extendPrevRowSpan: true }
    );

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '3');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '4');

    assertRowSpanData(0, 'name', { mainRow: true, mainRowKey: 0, count: 3, spanCount: 3 });
    assertRowSpanData(1, 'name', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 3 });
    assertRowSpanData(20, 'name', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 3 });

    assertRowSpanData(0, 'artist', { mainRow: true, mainRowKey: 0, count: 4, spanCount: 4 });
    assertRowSpanData(1, 'artist', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 4 });
    assertRowSpanData(20, 'artist', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 4 });
    assertRowSpanData(2, 'artist', { mainRow: false, mainRowKey: 0, count: -3, spanCount: 4 });
  });

  it('appendRow at 2 with extendPrevRowSpan options: false', () => {
    cy.gridInstance().invoke(
      'appendRow',
      { name: 'JS test', artist: 'JS', type: 'TEST' },
      { at: 2, extendPrevRowSpan: false }
    );

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '4');

    assertRowSpanData(0, 'name', { mainRow: true, mainRowKey: 0, count: 2, spanCount: 2 });
    assertRowSpanData(1, 'name', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 2 });

    assertRowSpanData(0, 'artist', { mainRow: true, mainRowKey: 0, count: 4, spanCount: 4 });
    assertRowSpanData(1, 'artist', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 4 });
    assertRowSpanData(20, 'artist', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 4 });
    assertRowSpanData(2, 'artist', { mainRow: false, mainRowKey: 0, count: -3, spanCount: 4 });
  });

  it('appendRow at 3 with extendPrevRowSpan options: true', () => {
    cy.gridInstance().invoke(
      'appendRow',
      { name: 'JS test', artist: 'JS', type: 'TEST' },
      { at: 3, extendPrevRowSpan: true }
    );

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '4');

    assertRowSpanData(0, 'name', { mainRow: true, mainRowKey: 0, count: 2, spanCount: 2 });
    assertRowSpanData(1, 'name', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 2 });

    assertRowSpanData(0, 'artist', { mainRow: true, mainRowKey: 0, count: 4, spanCount: 4 });
    assertRowSpanData(1, 'artist', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 4 });
    assertRowSpanData(2, 'artist', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 4 });
    assertRowSpanData(20, 'artist', { mainRow: false, mainRowKey: 0, count: -3, spanCount: 4 });
  });

  it('appendRow at 3 with extendPrevRowSpan options: false', () => {
    cy.gridInstance().invoke(
      'appendRow',
      { name: 'JS test', artist: 'JS', type: 'TEST' },
      { at: 3, extendPrevRowSpan: false }
    );

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '3');

    assertRowSpanData(0, 'name', { mainRow: true, mainRowKey: 0, count: 2, spanCount: 2 });
    assertRowSpanData(1, 'name', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 2 });

    assertRowSpanData(0, 'artist', { mainRow: true, mainRowKey: 0, count: 3, spanCount: 3 });
    assertRowSpanData(1, 'artist', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 3 });
    assertRowSpanData(2, 'artist', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 3 });
  });
});

describe('removeRow()', () => {
  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  it('removeRow at 0', () => {
    cy.gridInstance().invoke('removeRow', 0, {
      keepRowSpanData: true
    });

    cy.getCell(1, 'artist').should('have.attr', 'rowSpan', '2');

    assertRowSpanData(1, 'artist', {
      mainRow: true,
      mainRowKey: 1,
      count: 2,
      spanCount: 2
    });
    assertRowSpanData(2, 'artist', {
      mainRow: false,
      mainRowKey: 1,
      count: -1,
      spanCount: 2
    });
  });

  it('removeRow at 1', () => {
    cy.gridInstance().invoke('removeRow', 1, {
      keepRowSpanData: true
    });

    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '2');

    assertRowSpanData(0, 'artist', {
      mainRow: true,
      mainRowKey: 0,
      count: 2,
      spanCount: 2
    });
    assertRowSpanData(2, 'artist', {
      mainRow: false,
      mainRowKey: 0,
      count: -1,
      spanCount: 2
    });
  });

  it('removeRow at 2', () => {
    cy.gridInstance().invoke('removeRow', 2, {
      keepRowSpanData: true
    });

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '2');

    assertRowSpanData(0, 'name', {
      mainRow: true,
      mainRowKey: 0,
      count: 2,
      spanCount: 2
    });
    assertRowSpanData(1, 'name', {
      mainRow: false,
      mainRowKey: 0,
      count: -1,
      spanCount: 2
    });

    assertRowSpanData(0, 'artist', {
      mainRow: true,
      mainRowKey: 0,
      count: 2,
      spanCount: 2
    });
    assertRowSpanData(1, 'artist', {
      mainRow: false,
      mainRowKey: 0,
      count: -1,
      spanCount: 2
    });
  });

  it('removeRow at 3', () => {
    cy.gridInstance().invoke('removeRow', 3, {
      keepRowSpanData: true
    });

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '3');
    cy.getCell(4, 'name').should('have.attr', 'rowSpan', '2');

    assertRowSpanData(4, 'name', {
      mainRow: true,
      mainRowKey: 4,
      count: 2,
      spanCount: 2
    });
    assertRowSpanData(5, 'name', {
      mainRow: false,
      mainRowKey: 4,
      count: -1,
      spanCount: 2
    });
  });
});

it('render rowSpan cell properly by calling resetData API', () => {
  cy.createGrid({ data, columns });
  cy.gridInstance().invoke('resetData', createDataWithRowSpanAttr());

  cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
  cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '3');
  cy.getCell(3, 'name').should('have.attr', 'rowSpan', '3');
  cy.getCell(4, 'artist').should('have.attr', 'rowSpan', '3');
});

it('render rowSpan cell properly by calling setColumns API', () => {
  cy.createGrid({ data: createDataWithRowSpanAttr(), columns: columns.slice(0, 1) });
  cy.gridInstance().invoke('setColumns', columns);

  cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
  cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '3');
  cy.getCell(3, 'name').should('have.attr', 'rowSpan', '3');
  cy.getCell(4, 'artist').should('have.attr', 'rowSpan', '3');
});
