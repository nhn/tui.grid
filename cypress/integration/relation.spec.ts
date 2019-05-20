import Grid from '../../src/grid';
import { cls } from '../../src/helper/dom';
import { data, columns } from '../../samples/relations';

interface GridGlobal {
  tui: { Grid: typeof Grid };
  grid: Grid;
}

const CONTENT_WIDTH = 700;
// @TODO: Retrieve scrollbar-width from real browser
const SCROLLBAR_WIDTH = 17;

function createDefaultOptions() {
  return { data, columns };
}

function createGrid(customOptions: Record<string, unknown> = {}) {
  cy.window().then((win: Window & Partial<GridGlobal>) => {
    const { document, tui } = win;
    const defaultOptions = createDefaultOptions();
    const options = { ...defaultOptions, ...customOptions };
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

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
});

// @TODO add more test and data
it('should change state by relations', () => {
  createGrid();
  cy.get(`.${cls('container')}`).as('container');

  cy.get('@container')
    .trigger('mousedown', 10, 60)
    .trigger('dblclick', 10, 60);

  cy.get(`.${cls('layer-editing')} select`).select('01');
  cy.get('@container')
    .trigger('mousedown', 250, 60)
    .trigger('dblclick', 250, 60);

  cy.get(`.${cls('layer-editing')} select`)
    .select('Balad/Dance/Pop')
    .should('have.value', '01_01');
});
