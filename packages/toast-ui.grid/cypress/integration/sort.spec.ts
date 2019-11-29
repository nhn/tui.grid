import { cls, dataAttr } from '../../src/helper/dom';
import { sortData as data } from '../../samples/basic';
import { OptColumn } from '../../src/types';
import { compare } from '@/helper/sort';
import { Dictionary } from '@/store/types';

const columns: OptColumn[] = [
  { name: 'alphabetA', minWidth: 150, sortable: true },
  { name: 'alphabetB', minWidth: 150, sortable: true, sortingType: 'asc' },
  { name: 'numberA', minWidth: 150, sortable: true, sortingType: 'desc' },
  { name: 'stringNumberA', minWidth: 150, sortable: true, sortingType: 'asc' }
];

function createSortButtonAlias() {
  cy.get(`.${cls('btn-sorting')}`)
    .first()
    .as('first');
  cy.get(`.${cls('btn-sorting')}`)
    .eq(1)
    .as('second');
  cy.get(`.${cls('btn-sorting')}`)
    .eq(2)
    .as('third');
}

function assertSortClassNames(target: string, ascending: boolean, hasClass: boolean) {
  const className = ascending ? 'btn-sorting-up' : 'btn-sorting-down';
  if (hasClass) {
    cy.get(target).should('have.class', cls(className));
  } else {
    cy.get(target).should('have.not.class', cls(className));
  }
}

function assertSortedData(columnName: string) {
  const testData = (data as Dictionary<any>[]).map(col => String(col[columnName]));
  testData.sort((a, b) => compare(a, b));

  cy.get(`td[${dataAttr.COLUMN_NAME}=${columnName}]`).should($el => {
    $el.each((index, elem) => {
      expect(elem.textContent).to.eql(testData[index]);
    });
  });
}

function compareColumnData(columnName: string, expectValues: string[] | number[]) {
  cy.get(`td[${dataAttr.COLUMN_NAME}=${columnName}]`).should($el => {
    $el.each((index, elem) => {
      expect(elem.textContent).to.eql(expectValues[index]);
    });
  });
}

before(() => {
  cy.visit('/dist');
});

describe('sort', () => {
  it('sort button is rendered with proper class names', () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();
    assertSortClassNames('@first', true, false);
    assertSortClassNames('@first', false, false);
    assertSortClassNames('@second', true, false);
    assertSortClassNames('@second', false, false);
  });

  it("sort button's class names are changed when click the sort button", () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();

    cy.get('@first').click();
    assertSortClassNames('@first', true, true);
    assertSortClassNames('@first', false, false);

    cy.get('@first').click();
    assertSortClassNames('@first', true, false);
    assertSortClassNames('@first', false, true);

    cy.get('@second').click();
    assertSortClassNames('@second', true, true);
    assertSortClassNames('@second', false, false);

    assertSortClassNames('@first', true, false);
    assertSortClassNames('@first', false, false);

    cy.get('@second').click();
    cy.get('@second').click();
    assertSortClassNames('@second', true, false);
    assertSortClassNames('@second', false, false);
  });

  it('sort by descending order when the sort button is first clicked.', () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();

    cy.get('@third').click();
    assertSortClassNames('@third', true, false);
    assertSortClassNames('@third', false, true);
  });

  it('data is sorted properly', () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();

    cy.get('@first').click();
    assertSortedData('alphabetA');
  });

  it('data is sorted after calling sort(alphabetA, false)', () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'alphabetA', true);
    assertSortedData('alphabetA');
  });

  it('sort by ascending order stringNumberA', () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'stringNumberA', true);
    compareColumnData('stringNumberA', ['1', '2', '11', '100', '101', '201', '202', '211', '301']);
  });

  it('sort by descending order stringNumberA', () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'stringNumberA', false);
    compareColumnData('stringNumberA', ['301', '211', '202', '201', '101', '100', '11', '2', '1']);
  });

  it('multiple sort', () => {
    cy.createGrid({ data, columns });
    cy.gridInstance().invoke('sort', 'numberA', true);
    cy.gridInstance().invoke('sort', 'alphabetB', true, true);

    cy.get(`th[${dataAttr.COLUMN_NAME}=numberA]`).contains('1');
    cy.get(`th[${dataAttr.COLUMN_NAME}=alphabetB]`).contains('2');

    compareColumnData('numberA', ['1', '1', '1', '1', '2', '10', '20', '24', '25']);
    compareColumnData('alphabetB', ['A', 'A', 'B', 'E', 'B', 'B', 'C', 'A', 'F']);
  });

  it('data is sorted after calling unsort()', () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'alphabetA', false);
    cy.gridInstance().invoke('unsort');

    const testData = data.map(col => String(col.alphabetA));

    cy.get('@first').should('not.have.class', cls('btn-sorting-up'));
    cy.get('@first').should('not.have.class', cls('btn-sorting-down'));
    compareColumnData('alphabetA', testData);
  });

  it("unsort('numberA') when multiple sorting", () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();

    cy.gridInstance().invoke('sort', 'numberA', true);
    cy.gridInstance().invoke('sort', 'alphabetA', true, true);

    cy.get(`th[${dataAttr.COLUMN_NAME}=numberA]`).contains('1');
    cy.get(`th[${dataAttr.COLUMN_NAME}=alphabetA]`).contains('2');

    cy.gridInstance().invoke('unsort', 'numberA');

    assertSortedData('alphabetA');
  });

  it('get proper sortState after calling getSortState()', () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();
    cy.gridInstance()
      .invoke('getSortState')
      .should(sortState => {
        expect(sortState).to.eql({
          useClient: true,
          columns: [
            {
              ascending: true,
              columnName: 'sortKey'
            }
          ]
        });
      });

    cy.get('@first').click();

    cy.gridInstance()
      .invoke('getSortState')
      .should(sortState => {
        expect(sortState).to.eql({
          useClient: true,
          columns: [
            {
              ascending: true,
              columnName: 'alphabetA'
            }
          ]
        });
      });
  });

  it('cannot sort the data on non sortable column', () => {
    const col: OptColumn[] = [
      { name: 'alphabetA', minWidth: 150, sortable: true },
      { name: 'alphabetB', minWidth: 150, sortable: true, sortingType: 'asc' },
      { name: 'numberA', minWidth: 150 }
    ];
    cy.createGrid({ data, columns: col });
    cy.gridInstance().invoke('sort', 'numberA', true);

    compareColumnData('numberA', ['2', '1', '1', '1', '10', '1', '20', '24', '25']);
  });

  it('data is unsorted when calls resetData API', () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'numberA', false);
    cy.gridInstance().invoke('resetData', data.slice());

    compareColumnData('numberA', ['2', '1', '1', '1', '10', '1', '20', '24', '25']);
    cy.get('@third').should('not.have.class', cls('btn-sorting-up'));
    cy.get('@third').should('not.have.class', cls('btn-sorting-down'));
  });

  it('data is unsorted when calls setColumns API', () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'numberA', false);
    cy.gridInstance().invoke('setColumns', columns);

    compareColumnData('numberA', ['2', '1', '1', '1', '10', '1', '20', '24', '25']);
    cy.get('@third').should('not.have.class', cls('btn-sorting-up'));
    cy.get('@third').should('not.have.class', cls('btn-sorting-down'));
  });

  it('data is unsorted when calls clearData API', () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'numberA', false);
    cy.gridInstance().invoke('clear');

    cy.get('@third').should('not.have.class', cls('btn-sorting-up'));
    cy.get('@third').should('not.have.class', cls('btn-sorting-down'));
  });

  it('data is unsorted when hide column', () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'numberA', false);
    cy.gridInstance().invoke('hideColumn', 'numberA');

    compareColumnData('numberA', ['2', '1', '1', '1', '10', '1', '20', '24', '25']);
    cy.get('@third').should('not.have.class', cls('btn-sorting-up'));
    cy.get('@third').should('not.have.class', cls('btn-sorting-down'));
  });

  it('cannot sort the data on hidden column', () => {
    cy.createGrid({ data, columns });
    createSortButtonAlias();
    cy.gridInstance().invoke('hideColumn', 'numberA');
    cy.gridInstance().invoke('sort', 'numberA', false);

    compareColumnData('numberA', ['2', '1', '1', '1', '10', '1', '20', '24', '25']);
    cy.get('@third').should('not.have.class', cls('btn-sorting-up'));
    cy.get('@third').should('not.have.class', cls('btn-sorting-down'));
  });

  it('should update row number after sorting', () => {
    cy.createGrid({ data, columns, rowHeaders: ['rowNum'] });
    createSortButtonAlias();
    cy.get('@first').click();
    cy.get('td[data-column-name=_number]').each(($el, idx) => {
      expect($el.text()).to.contain(`${idx + 1}`);
    });
  });
});
