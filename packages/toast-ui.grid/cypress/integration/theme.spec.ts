import { OptPreset, OptRow } from '@/types';
import { ThemeOptionPresetNames } from '@/theme/manager';
import Grid from '@/grid';

const data = [
  {
    name: 'Kim',
    age: 30,
    location: 'seoul'
  },
  {
    name: 'Lee',
    age: 40,
    location: 'busan'
  },
  {
    name: 'Han',
    age: 28,
    location: 'Bundang'
  }
] as OptRow[];
const columns = [{ name: 'name' }, { name: 'age' }, { name: 'location' }];

const CONTENT_WIDTH = 700;
// @TODO: Retrieve scrollbar-width from real browser
const SCROLLBAR_WIDTH = 17;

interface GridGlobal {
  tui: { Grid: typeof Grid };
  grid: Grid;
}

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
});

function createGridWithTheme(preset?: ThemeOptionPresetNames, extOptions?: OptPreset) {
  cy.window().then((win: Window & Partial<GridGlobal>) => {
    const { document, tui } = win;
    const defaultOptions = { columns, data };
    const options = { ...defaultOptions };
    const el = document.createElement('div');
    el.style.width = `${CONTENT_WIDTH + SCROLLBAR_WIDTH}px`;
    document.body.appendChild(el);

    if (preset) {
      tui!.Grid.applyTheme(preset, extOptions);
    }

    win.grid = new tui!.Grid({ el, ...options });
    cy.wait(10);
  });
}

it('should have background color when mouse hover. And The background color disappears when the mouse leaves the row.', () => {
  const TEST_BG_COLOR = 'rgb(206, 147, 216)';
  createGridWithTheme('clean', {
    row: { hover: { background: TEST_BG_COLOR } }
  });
  cy.getCell(0, 'name').trigger('mouseover');
  cy.get('[data-row-key=0]').each($el => {
    expect($el.css('background-color')).to.eql(TEST_BG_COLOR);
  });
  cy.getCell(0, 'name').trigger('mouseout');
  cy.get('[data-row-key=0]').each($el => {
    expect($el.css('background-color')).not.to.eql(TEST_BG_COLOR);
  });
});
