import { cls } from '../../src/helper/common';
import { data as sampleData } from '../../samples/basic';

const CONT_DOM_WIDTH = 600;

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
});

function createGrid(options) {
  cy.window().then((win) => {
    const { document, tui } = <any>win;
    const el = document.createElement('div');
    el.style.width = `${CONT_DOM_WIDTH}px`;
    document.body.appendChild(el);

    (<any>win).grid = new tui.Grid({ el, ...options });
  });
  cy.wait(0);
}

function getGridInst() {
  return (<any>cy.window()).its('grid');
}

describe('container width', () => {
  function assertContainerWidth(width) {
    cy.get('.' + cls('container'))
      .invoke('width')
      .should('be.eql', width);

    cy.get('.' + cls('rside-area')).within(() => {
      cy.root()
        .invoke('width')
        .should('be.eql', width);

      cy.get('.' + cls('head-area'))
        .invoke('width')
        .should('be.eql', width - 17);

      cy.get('.' + cls('body-area'))
        .invoke('width')
        .should('be.eql', width);
    });
  }

  beforeEach(() => {
    const data = sampleData.slice(10);
    const columns = [{ name: 'name' }, { name: 'artist' }];

    createGrid({ data, columns });
  });

  it('default with is the same as the DOM width', () => {
    assertContainerWidth(CONT_DOM_WIDTH);
  });

  it('setWidth() changes container width', () => {
    getGridInst().invoke('setWidth', 700);
    assertContainerWidth(700);
  });
});

describe('should calculate column widths automatically (width: 600)', () => {
  function assertColumnWidth(widths: number[]) {
    cy.get('.' + cls('rside-area')).within(() => {
      cy.get('.' + cls('head-area') + ' th').as('headCols');
      cy.get('.' + cls('body-area') + ' tr:first-child td').as('bodyCols');

      widths.forEach((width, index) => {
        cy.get('@headCols')
          .eq(index)
          .invoke('outerWidth')
          .should('be.eql', width);

        cy.get('@bodyCols')
          .eq(index)
          .invoke('outerWidth')
          .should('be.eql', width);
      });
    });
  }

  function createGridWithWidths(widths, commonMinWidth?) {
    const columns = widths.map(({ width, minWidth }, index) => ({
      name: `c${index}`,
      width,
      minWidth
    }));

    const data = [{}];
    columns.forEach(({ name }) => {
      data[0][name] = name;
    });

    const columnOptions = { minWidth: commonMinWidth };

    createGrid({ data, columns, columnOptions });
  }

  it(`['auto', 'auto'] -> [300, 300]`, () => {
    createGridWithWidths([{ width: 'auto' }, { width: 'auto' }]);
    assertColumnWidth([300, 300]);
  });

  it(`[empty, empty] -> [300, 300] (default is 'auto')`, () => {
    createGridWithWidths([{}, {}]);
    assertColumnWidth([300, 300]);
  });

  it('[empty, empty, 200] -> [200, 200, 200]', () => {
    createGridWithWidths([{}, {}, {}]);
    assertColumnWidth([200, 200, 200]);
  });

  it('[100, 100, empty] -> [100, 100, 400]', () => {
    createGridWithWidths([{ width: 100 }, { width: 100 }, {}]);
    assertColumnWidth([100, 100, 400]);
  });

  context('using column[].minWidth', () => {
    it('[min:100, min:200, empty] -> [200, 200, 200]', () => {
      createGridWithWidths([{ minWidth: 100 }, { minWidth: 200 }, {}]);
      assertColumnWidth([200, 200, 200]);
    });

    it('[min:250, min:250, empty] -> [250, 250, 100]', () => {
      createGridWithWidths([{ minWidth: 250 }, { minWidth: 250 }, {}]);
      assertColumnWidth([250, 250, 100]);
    });

    it('[min:250, min:250, width:200] -> [250, 250, 200] (larger than container)', () => {
      createGridWithWidths([{ minWidth: 250 }, { minWidth: 250 }, { width: 200 }]);
      assertColumnWidth([250, 250, 200]);
    });
  });

  context('using columnOption.minWidth', () => {
    it('[300, 260, empty] (min: default = 50) -> [300, 360, 50]', () => {
      createGridWithWidths([{ width: 300 }, { width: 260 }, {}]);
      assertColumnWidth([300, 260, 50]);
    });

    it('[100, 250, empty] (min: 200) -> [200, 250, 200]', () => {
      createGridWithWidths([{ width: 100 }, { width: 250 }, {}], 200);
      assertColumnWidth([200, 250, 200]);
    });

    it('[100, min:250, empty] (min: 200) -> [200, 250, 200]', () => {
      createGridWithWidths([{ width: 100 }, { minWidth: 250 }, {}], 200);
      // minWidth in each column overrides columnOption.minWidth
      assertColumnWidth([200, 250, 200]);
    });
  });

  context('setWidth : [min:150, min:150, empty]', () => {
    beforeEach(() => {
      createGridWithWidths([{ minWidth: 150 }, { minWidth: 150 }, {}]);
    });

    it('setWidth(720) -> [240, 240, 240]', () => {
      getGridInst().invoke('setWidth', 720);
      assertColumnWidth([240, 240, 240]);
    });

    it('setWidth(420) -> [150, 150, 120]', () => {
      getGridInst().invoke('setWidth', 420);
      assertColumnWidth([150, 150, 120]);
    });
  });
});

it.only('test', () => {
  const data = sampleData.slice(10);
  const columns = [{ name: 'name' }, { name: 'artist' }];

  createGrid({ data, columns });
});

// context('when dimension.width is changed (600 -> 720)', () => {
