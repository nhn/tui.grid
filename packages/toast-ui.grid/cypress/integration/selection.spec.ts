import Grid from '../../src/grid';
import { OptColumn } from '../../src/types';

interface GridGlobal {
  tui: { Grid: typeof Grid };
  grid: Grid;
}

const CONTENT_WIDTH = 700;
// @TODO: Retrieve scrollbar-width from real browser
const SCROLLBAR_WIDTH = 17;

const columns: OptColumn[] = [{ name: 'A', minWidth: 150 }, { name: 'B', minWidth: 150 }];
const data = [{ A: 1, B: 2 }, { A: 3, B: 2 }, { A: 4, B: 2 }];

type Address = [number, number];

function setSelectionByUI(start: Address, end: Address) {
  cy.getCellByIdx(start[0], start[1]).trigger('mousedown');
  cy.getCellByIdx(end[0], end[1])
    .invoke('offset')
    .then(({ left, top }) => {
      cy.get('body')
        .trigger('mousemove', { pageX: left + 10, pageY: top + 10 })
        .trigger('mouseup');
    });
}

function createGrid(customOptions: Record<string, unknown> = {}) {
  cy.window().then((win: Window & Partial<GridGlobal>) => {
    const { document, tui } = win;
    const options = { data, columns, ...customOptions };
    const el = document.createElement('div');
    el.style.width = `${CONTENT_WIDTH + SCROLLBAR_WIDTH}px`;
    document.body.appendChild(el);

    win.grid = new tui!.Grid({ el, ...options });
    cy.wait(10);
  });
}

before(() => {
  cy.visit('/dist');
});

describe('getSelectionRange', () => {
  beforeEach(() => {
    cy.document().then(doc => {
      doc.body.innerHTML = '';
    });
  });

  ['API', 'UI'].forEach(type => {
    it(`selection by ${type}`, () => {
      createGrid();
      const range = { start: [0, 0], end: [1, 1] };
      if (type === 'API') {
        cy.gridInstance().invoke('setSelectionRange', range);
      } else {
        setSelectionByUI([0, 0], [1, 1]);
      }

      cy.gridInstance()
        .invoke('getSelectionRange')
        .should('eql', range);
    });
  });

  it('select column by clicking header', () => {
    createGrid();
    cy.get('th[data-column-name=A]')
      .eq(0)
      .click();

    cy.gridInstance()
      .invoke('getSelectionRange')
      .should('eql', { start: [0, 0], end: [2, 0] });
  });

  it('select row by clicking row header', () => {
    createGrid({ rowHeaders: ['rowNum'] });

    cy.get('td[data-column-name=_number]')
      .eq(0)
      .click();

    cy.gridInstance()
      .invoke('getSelectionRange')
      .should('eql', { start: [0, 0], end: [0, 1] });
  });

  it('select column by clicking complex header', () => {
    createGrid({
      header: { height: 60, complexColumns: [{ header: 'C', name: 'C', childNames: ['A', 'B'] }] }
    });

    cy.get('th[data-column-name=C]')
      .eq(0)
      .click();

    cy.gridInstance()
      .invoke('getSelectionRange')
      .should('eql', { start: [0, 0], end: [2, 1] });
  });
});
