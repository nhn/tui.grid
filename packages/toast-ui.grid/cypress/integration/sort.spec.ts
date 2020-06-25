import { OptColumn, Dictionary } from '@t/options';
import { cls, ClassNameType } from '../../src/helper/dom';
import { sortData as data } from '../../samples/basic';
import { compare } from '@/helper/sort';
import { CellValue, Row } from '@t/store/data';

const columns: OptColumn[] = [
  { name: 'alphabetA', minWidth: 150, sortable: true },
  { name: 'alphabetB', minWidth: 150, sortable: true, sortingType: 'desc' },
  { name: 'numberA', minWidth: 150, sortable: true, sortingType: 'desc' },
  { name: 'stringNumberA', minWidth: 150, sortable: true, sortingType: 'asc' },
  { name: 'mixedValue', minWidth: 150, sortable: true },
  { name: 'nonSortable', minWidth: 150 },
];

function createSortButtonAlias() {
  ['first', 'second', 'third'].forEach((alias, index) => {
    cy.getByCls('btn-sorting').eq(index).as(alias);
  });
}

function assertHaveSortingBtnClass(target: string, className: ClassNameType) {
  cy.get(target).should('have.class', cls(className));
}

function assertHaveNotSortingBtnClass(target: string, className: ClassNameType) {
  cy.get(target).should('have.not.class', cls(className));
}

function assertOriginData(columnName: string) {
  const expectValues = (data as Dictionary<any>[]).map((col) => String(col[columnName]));

  cy.getColumnCells(columnName).should('have.columnData', expectValues);
}

function assertSortedData(columnName: string, ascending = true) {
  const expectValues = (data as Dictionary<any>[]).map((col) => String(col[columnName]));
  expectValues.sort((a, b) => (ascending ? compare(a, b) : -compare(a, b)));

  cy.getColumnCells(columnName).should('have.columnData', expectValues);
}

function compareColumnData(columnName: string, expectValues: string[] | number[]) {
  cy.getColumnCells(columnName).should('have.columnData', expectValues);
}

before(() => {
  cy.visit('/dist');
});

it('sort button is rendered properly', () => {
  cy.createGrid({ data, columns });
  createSortButtonAlias();

  assertHaveNotSortingBtnClass('@first', 'btn-sorting-up');
  assertHaveNotSortingBtnClass('@first', 'btn-sorting-down');
  assertHaveNotSortingBtnClass('@second', 'btn-sorting-up');
  assertHaveNotSortingBtnClass('@second', 'btn-sorting-down');
});

describe('basic sort', () => {
  beforeEach(() => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();
  });

  ['asc', 'desc'].forEach((sortType) => {
    const alias = sortType === 'asc' ? '@first' : '@second';
    const columnName = sortType === 'asc' ? 'alphabetA' : 'alphabetB';
    const ascending = sortType === 'asc';

    context(`UI - default sort type: ${sortType}`, () => {
      it('the data is sorted and sort button is rendered by default sort option', () => {
        cy.get(alias).click();

        if (ascending) {
          assertHaveSortingBtnClass(alias, 'btn-sorting-up');
          assertHaveNotSortingBtnClass(alias, 'btn-sorting-down');
        } else {
          assertHaveSortingBtnClass(alias, 'btn-sorting-down');
          assertHaveNotSortingBtnClass(alias, 'btn-sorting-up');
        }
        assertSortedData(columnName, ascending);
      });

      it('the opposite sort is applied by second click and the data goes back to origin by third click', () => {
        cy.get(alias).click();
        cy.get(alias).click();

        if (ascending) {
          assertHaveSortingBtnClass(alias, 'btn-sorting-down');
          assertHaveNotSortingBtnClass(alias, 'btn-sorting-up');
        } else {
          assertHaveSortingBtnClass(alias, 'btn-sorting-up');
          assertHaveNotSortingBtnClass(alias, 'btn-sorting-down');
        }
        assertSortedData(columnName, !ascending);

        cy.get(alias).click();

        assertHaveNotSortingBtnClass(alias, 'btn-sorting-up');
        assertHaveNotSortingBtnClass(alias, 'btn-sorting-down');
        assertOriginData(columnName);
      });

      it('the sort button goes back to origin when click the another sort button', () => {
        cy.get(alias).click();

        if (ascending) {
          assertHaveSortingBtnClass(alias, 'btn-sorting-up');
          assertHaveNotSortingBtnClass(alias, 'btn-sorting-down');
        } else {
          assertHaveSortingBtnClass(alias, 'btn-sorting-down');
          assertHaveNotSortingBtnClass(alias, 'btn-sorting-up');
        }

        cy.get('@third').click();

        assertHaveNotSortingBtnClass(alias, 'btn-sorting-up');
        assertHaveNotSortingBtnClass(alias, 'btn-sorting-down');
      });
    });

    context(`API - sortType: ${sortType}`, () => {
      beforeEach(() => {
        cy.createGrid({ data, columns });
        createSortButtonAlias();
      });

      it('sort()', () => {
        cy.gridInstance().invoke('sort', columnName, ascending);

        if (ascending) {
          assertHaveSortingBtnClass(alias, 'btn-sorting-up');
          assertHaveNotSortingBtnClass(alias, 'btn-sorting-down');
        } else {
          assertHaveSortingBtnClass(alias, 'btn-sorting-down');
          assertHaveNotSortingBtnClass(alias, 'btn-sorting-up');
        }
        assertSortedData(columnName, ascending);
      });

      it('unsort()', () => {
        cy.gridInstance().invoke('sort', columnName, ascending);
        cy.gridInstance().invoke('unsort', columnName);

        assertHaveNotSortingBtnClass(alias, 'btn-sorting-up');
        assertHaveNotSortingBtnClass(alias, 'btn-sorting-down');
        assertOriginData(columnName);
      });

      it('the sort button goes back to origin when call sort() with another column', () => {
        cy.gridInstance().invoke('sort', columnName, ascending);
        cy.gridInstance().invoke('sort', 'numberA', ascending);

        assertHaveNotSortingBtnClass(alias, 'btn-sorting-up');
        assertHaveNotSortingBtnClass(alias, 'btn-sorting-down');
      });
    });
  });
});

['API', 'UI'].forEach((type) => {
  describe(`multiple sort by ${type}`, () => {
    beforeEach(() => {
      cy.createGrid({ data, columns });
      createSortButtonAlias();

      if (type === 'API') {
        cy.gridInstance().invoke('sort', 'numberA', false);
        cy.gridInstance().invoke('sort', 'alphabetB', false, true);
      } else {
        cy.get('@third').click();

        cy.get('body').type('{cmd}', { release: false });
        cy.get('@second').click();
      }
    });

    it('sort multiple column', () => {
      cy.getHeaderCell('numberA').contains('1');
      cy.getHeaderCell('alphabetB').contains('2');

      compareColumnData('numberA', ['25', '24', '20', '10', '2', '1', '1', '1', '1']);
      compareColumnData('alphabetB', ['F', 'A', 'C', 'B', 'B', 'E', 'B', 'A', 'A']);
    });

    it('multiple sorting is canceled', () => {
      if (type === 'API') {
        cy.gridInstance().invoke('unsort', 'numberA');
      } else {
        cy.get('body').type('{cmd}', { release: false });
        cy.get('@third').click();
        cy.get('body').type('{cmd}', { release: false });
        cy.get('@third').click();
      }

      cy.getHeaderCell('numberA').should('not.have.text', '1');
      cy.getHeaderCell('alphabetB').should('not.have.text', '2');
      assertSortedData('alphabetB', false);
    });
  });
});

['asc', 'desc'].forEach((sortType) => {
  const ascending = sortType === 'asc';

  describe('specific type sort', () => {
    beforeEach(() => {
      cy.createGrid({ data, columns });
    });

    it(`number of string type sort - sortType: ${sortType}`, () => {
      const expected = ascending
        ? ['1', '2', '11', '100', '101', '201', '202', '211', '301']
        : ['301', '211', '202', '201', '101', '100', '11', '2', '1'];

      cy.gridInstance().invoke('sort', 'stringNumberA', ascending);

      compareColumnData('stringNumberA', expected);
    });

    it(`mixed type(string, number) sort - sortType: ${sortType}`, () => {
      const expected = ascending
        ? ['1', '2', '30', '121', 'A', 'AK', 'C', 'EA', 'O']
        : ['O', 'EA', 'C', 'AK', 'A', '121', '30', '2', '1'];

      cy.gridInstance().invoke('sort', 'mixedValue', ascending);

      compareColumnData('mixedValue', expected);
    });
  });
});

describe('data is unsorted by other API', () => {
  beforeEach(() => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();
  });

  ['setColumns', 'hideColumn', 'resetData'].forEach((api) => {
    it(`data is unsorted when call ${api} API`, () => {
      cy.gridInstance().invoke('sort', 'alphabetA', false);

      if (api === 'setColumns') {
        cy.gridInstance().invoke(api, columns);
      } else if (api === 'hideColumn') {
        cy.gridInstance().invoke(api, 'alphabetA');
      } else {
        cy.gridInstance().invoke(api, data.slice());
      }

      compareColumnData('numberA', ['2', '1', '1', '1', '10', '1', '20', '24', '25']);
      cy.get('@third').should('not.have.class', cls('btn-sorting-up'));
      cy.get('@third').should('not.have.class', cls('btn-sorting-down'));
    });
  });

  it('data is unsorted when call clearData API', () => {
    cy.gridInstance().invoke('sort', 'numberA', false);
    cy.gridInstance().invoke('clear');

    cy.get('@third').should('not.have.class', cls('btn-sorting-up'));
    cy.get('@third').should('not.have.class', cls('btn-sorting-down'));
  });
});

it('should get proper sortState after calling getSortState()', () => {
  cy.createGrid({ data, columns });

  cy.gridInstance()
    .invoke('getSortState')
    .should('have.subset', {
      useClient: true,
      columns: [
        {
          ascending: true,
          columnName: 'sortKey',
        },
      ],
    });

  cy.gridInstance().invoke('sort', 'alphabetA', true);

  cy.gridInstance()
    .invoke('getSortState')
    .should('have.subset', {
      useClient: true,
      columns: [
        {
          ascending: true,
          columnName: 'alphabetA',
        },
      ],
    });
});

it('cannot sort the data on non sortable column', () => {
  const col: OptColumn[] = [
    { name: 'alphabetA', minWidth: 150, sortable: true },
    { name: 'alphabetB', minWidth: 150, sortable: true, sortingType: 'asc' },
    { name: 'numberA', minWidth: 150 },
  ];
  cy.createGrid({ data, columns: col });

  cy.gridInstance().invoke('sort', 'numberA', true);

  compareColumnData('numberA', ['2', '1', '1', '1', '10', '1', '20', '24', '25']);
});

it('cannot sort the data on hidden column', () => {
  cy.createGrid({ data, columns });
  createSortButtonAlias();

  cy.gridInstance().invoke('hideColumn', 'alphabetA');
  cy.gridInstance().invoke('sort', 'alphabetA', false);

  compareColumnData('numberA', ['2', '1', '1', '1', '10', '1', '20', '24', '25']);
  cy.get('@third').should('not.have.class', cls('btn-sorting-up'));
  cy.get('@third').should('not.have.class', cls('btn-sorting-down'));
});

it('should update row number after sorting', () => {
  cy.createGrid({ data, columns, rowHeaders: ['rowNum'] });
  createSortButtonAlias();

  cy.gridInstance().invoke('sort', 'alphabetA', true);

  cy.getRowHeaderCells('_number').each(($el, idx) => {
    cy.wrap($el).should('have.text', `${idx + 1}`);
  });
});

describe('resetData API with sortState', () => {
  beforeEach(() => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();
  });

  it('should apply the sortState after calling resetData with sortState option', () => {
    const sortState = { columnName: 'alphabetA', ascending: true, multiple: false };

    cy.gridInstance().invoke('resetData', data, { sortState });

    assertHaveSortingBtnClass('@first', 'btn-sorting-up');
  });

  it('should not apply the sortState to the column has no filter option after calling resetData with sortState option', () => {
    const sortState = { columnName: 'nonSortable', ascending: true, multiple: false };

    cy.gridInstance().invoke('resetData', data, { sortState });

    cy.gridInstance()
      .invoke('getSortState')
      .should('eql', { useClient: true, columns: [{ columnName: 'sortKey', ascending: true }] });
  });

  it('should release the sort state of column after calling resetData with sortState option', () => {
    const sortState = { columnName: 'alphabetA', multiple: true };

    cy.gridInstance().invoke('sort', 'alphabetA', false);

    cy.gridInstance().invoke('resetData', data, { sortState });

    assertHaveNotSortingBtnClass('@first', 'btn-sorting-up');
    assertHaveNotSortingBtnClass('@first', 'btn-sorting-down');
  });
});

describe('sort the data with custom comparator', () => {
  beforeEach(() => {
    const comparatorA = (a: CellValue, b: CellValue) => {
      const lengthA = (a as string).length;
      const lengthB = (b as string).length;

      return lengthA - lengthB;
    };
    const comparatorB = (a: CellValue, b: CellValue, rowA: Row, rowB: Row) => {
      if (rowA.alphabetA! < rowB.alphabetA!) {
        return -1;
      }
      if (rowA.alphabetA! > rowB.alphabetA!) {
        return 1;
      }
      return 0;
    };
    const columnWithCustomComparator: OptColumn[] = [
      { name: 'alphabetA', minWidth: 150, sortable: true, comparator: comparatorA },
      {
        name: 'alphabetB',
        minWidth: 150,
        sortable: true,
        sortingType: 'desc',
        comparator: comparatorA,
      },
      {
        name: 'numberA',
        minWidth: 150,
        sortable: true,
        sortingType: 'desc',
        comparator: comparatorB,
      },
    ];
    cy.createGrid({ data, columns: columnWithCustomComparator });
    createSortButtonAlias();
  });

  ['API', 'UI'].forEach((type) => {
    it(`should sort the data in ascending order by ${type}`, () => {
      if (type === 'API') {
        cy.gridInstance().invoke('sort', 'alphabetA', true);
      } else {
        cy.get('@first').click();
      }
      compareColumnData('alphabetA', ['A', 'C', 'A', 'A', 'D', 'A', 'BCA', 'BAA', 'FGA']);
    });

    it(`should sort the data in descending order by ${type}`, () => {
      if (type === 'API') {
        cy.gridInstance().invoke('sort', 'alphabetB', false);
      } else {
        cy.get('@second').click();
      }
      compareColumnData('alphabetB', ['B', 'A', 'A', 'B', 'B', 'E', 'C', 'A', 'F']);
    });

    it(`should sort the data with other row data by ${type}`, () => {
      if (type === 'API') {
        cy.gridInstance().invoke('sort', 'numberA', false);
      } else {
        cy.get('@third').click();
      }
      compareColumnData('alphabetA', ['FGA', 'D', 'C', 'BCA', 'BAA', 'A', 'A', 'A', 'A']);
      compareColumnData('numberA', ['25', '1', '1', '2', '20', '1', '1', '10', '24']);
    });
  });
});
