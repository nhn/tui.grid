import { cls } from '../../src/helper/dom';
import { data, sortedColumns, unsortedColumns } from '../../samples/relations';
import Grid from '@/grid';

function changeCellValues(rowKey: number) {
  // changed fixed value to remove unnecessary paramter for values
  // category1: 'Overseas'
  cy.gridInstance().invoke('setValue', rowKey, 'category1', '02');
  // category2: 'Pop'
  cy.gridInstance().invoke('setValue', rowKey, 'category2', '02_01');
  // category3: 'Youth'
  cy.gridInstance().invoke('setValue', rowKey, 'category3', '02_01_0006');
}

function assertRelationData(rowKey: number, expected: [string, string, string]) {
  cy.getCell(rowKey, 'category1').should('have.text', expected[0]);
  cy.getCell(rowKey, 'category2').should('have.text', expected[1]);
  cy.getCell(rowKey, 'category3').should('have.text', expected[2]);
}

before(() => {
  cy.visit('/dist');
});

['sorted', 'unsorted'].forEach(type => {
  const columns = type === 'sorted' ? sortedColumns : unsortedColumns;

  describe(`in case of ${type} column with relation`, () => {
    beforeEach(() => {
      cy.createGrid({ data, columns });
    });

    it('should display relation data properly', () => {
      const expected =
        type === 'sorted'
          ? [
              ['', '', '', 'Select'],
              ['Overseas', 'R&B', 'Marry You', 'no'],
              ['Etc', 'OST', 'City Of Stars', 'relation']
            ]
          : [
              ['', '', 'Select', ''],
              ['R&B', 'Overseas', 'no', 'Marry You'],
              ['OST', 'Etc', 'relation', 'City Of Stars']
            ];

      cy.getRsideBody().should('have.cellData', expected);
    });

    it('should change state by relations', () => {
      changeCellValues(0);

      assertRelationData(0, ['Overseas', 'Pop', 'Youth']);
    });

    it('change cell disabled state with empty value', () => {
      cy.gridInstance().invoke('setValue', 1, 'category1', '');

      cy.getCell(1, 'category2').should('have.class', `${cls('cell-disabled')}`);
      cy.getCell(1, 'category3').should('have.class', `${cls('cell-disabled')}`);
    });

    it('change cell editable state', () => {
      cy.gridInstance().invoke('setValue', 1, 'category1', '01');

      cy.getCell(1, 'category2').should('have.not.class', `${cls('cell-editable')}`);
    });

    it('relation columns could be set through setColumns()', () => {
      const expected =
        type === 'sorted'
          ? [
              ['', '', ''],
              ['Overseas', 'R&B', 'Marry You'],
              ['Etc', 'OST', 'City Of Stars']
            ]
          : [
              ['', '', ''],
              ['R&B', 'Overseas', 'Marry You'],
              ['OST', 'Etc', 'City Of Stars']
            ];
      const filteredColumns = columns.filter(column => column.name !== 'category4');
      cy.gridInstance().invoke('setColumns', filteredColumns);

      cy.getRsideBody().should('have.cellData', expected);

      changeCellValues(0);

      assertRelationData(0, ['Overseas', 'Pop', 'Youth']);
    });

    it('should display relation with added data after calling appendRow()', () => {
      const expected =
        type === 'sorted'
          ? ['Overseas', 'R&B', 'Marry You', 'no']
          : ['R&B', 'Overseas', 'no', 'Marry You'];

      cy.gridInstance().invoke('appendRow', {
        category1: '02',
        category2: '02_03',
        category3: '02_03_0001',
        category4: '01'
      });

      cy.getRow(3).each(($cell, index) => {
        cy.wrap($cell).should('have.text', expected[index]);
      });

      changeCellValues(3);

      assertRelationData(3, ['Overseas', 'Pop', 'Youth']);
    });

    it('should display relation data after calling resetData()', () => {
      const expected =
        type === 'sorted'
          ? [
              ['Overseas', 'R&B', 'Marry You', 'no'],
              ['Etc', 'OST', 'City Of Stars', 'relation']
            ]
          : [
              ['R&B', 'Overseas', 'no', 'Marry You'],
              ['OST', 'Etc', 'relation', 'City Of Stars']
            ];
      cy.gridInstance().invoke('resetData', data.slice(1, 3));

      cy.getRsideBody().should('have.cellData', expected);

      changeCellValues(0);

      assertRelationData(0, ['Overseas', 'Pop', 'Youth']);
    });
  });
});

describe(`throw error`, () => {
  ['self circular', 'circular'].forEach(type => {
    const columns =
      type === 'circular'
        ? [
            {
              header: 'Category1',
              name: 'category1',
              relations: [{ targetNames: ['category2'] }]
            },
            {
              header: 'Category2',
              name: 'category2',
              relations: [{ targetNames: ['category3'] }]
            },
            {
              header: 'Category3',
              name: 'category3',
              relations: [{ targetNames: ['category1'] }]
            }
          ]
        : [
            {
              header: 'Category1',
              name: 'category1',
              relations: [{ targetNames: ['category1'] }]
            },
            {
              header: 'Category2',
              name: 'category2'
            }
          ];
    it(`should throw error when creates ${type} reference on configuring relation column`, () => {
      cy.window().then(win => {
        const { document, tui } = win as Window & { tui: { Grid: typeof Grid } };
        const el = document.createElement('div');

        expect(() => new tui.Grid({ el, data, columns })).to.throw(
          'Cannot create circular reference between relation columns'
        );
      });
    });
  });
});
