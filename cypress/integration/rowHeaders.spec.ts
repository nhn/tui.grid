import { data } from '../../samples/basic';
import Grid from '../../src/grid';
import { isSubsetOf } from '../helper/compare';

interface GridGlobal {
  tui: { Grid: typeof Grid };
  grid: Grid;
}

function getGridInst(): Cypress.Chainable<Grid> {
  return (cy.window() as Cypress.Chainable<Window & GridGlobal>).its('grid');
}

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
});

const columns = [
  { name: 'name', minWidth: 150 },
  { name: 'artist', minWidth: 150 },
  { name: 'type', minWidth: 150 },
  { name: 'release', minWidth: 150 },
  { name: 'genre', minWidth: 150 }
];

describe('row header API', () => {
  beforeEach(() => {
    cy.createGrid({
      data: data.slice(0, 3),
      rowHeaders: ['checkbox'],
      columns
    });
  });

  it('check, uncheck', () => {
    getGridInst().invoke('check', 0);
    cy.get(`[data-row-key=0] input`).should('be.checked');

    getGridInst().invoke('uncheck', 0);
    cy.get(`[data-row-key=0] input`).should('not.be.checked');
  });

  it('checkAll, uncheckAll', () => {
    getGridInst().invoke('checkAll');

    cy.get('input').each(($el) => {
      expect($el.is(':checked')).to.be.true;
    });

    getGridInst().invoke('uncheckAll');

    cy.get('input').each(($el) => {
      expect($el.is(':checked')).to.be.false;
    });
  });

  it('getCheckedRowKeys', () => {
    getGridInst().invoke('check', 0);
    getGridInst().invoke('check', 2);

    getGridInst()
      .invoke('getCheckedRowKeys')
      .should((result) => {
        expect(isSubsetOf([0, 2], result)).to.be.true;
      });
  });

  it('getCheckedRows', () => {
    getGridInst().invoke('check', 0);
    getGridInst().invoke('check', 2);

    getGridInst()
      .invoke('getCheckedRows')
      .should((result) => {
        expect(
          isSubsetOf(
            [{ rowKey: 0, name: 'Beautiful Lies' }, { rowKey: 2, name: 'Moves Like Jagger' }],
            result
          )
        ).to.be.true;
      });
  });
});
