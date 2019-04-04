import { cls } from '../../src/helper/common';
import { data as sampleData } from '../../samples/basic';
import { HANDLE_WIDTH_HALF } from '../../src/view/columnResizer';

const CONTENT_WIDTH = 600;
// @TODO: Retrieve scrollbar-width from real browser
const SCROLLBAR_WIDTH = 17;

function createGrid(options) {
  cy.window().then((win) => {
    const { document, tui } = <any>win;
    const el = document.createElement('div');
    el.style.width = `${CONTENT_WIDTH + SCROLLBAR_WIDTH}px`;
    document.body.appendChild(el);

    (<any>win).grid = new tui.Grid({ el, ...options });
    cy.wait(10);
  });
}

function getGridInst() {
  return (<any>cy.window()).its('grid');
}

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
  const columns = widths.map(({ width, minWidth, resizable }, index) => ({
    name: `c${index}`,
    width,
    minWidth,
    resizable
  }));

  const data = [{}];
  columns.forEach(({ name }) => {
    data[0][name] = name;
  });

  const columnOptions = { minWidth: commonMinWidth };

  createGrid({ data, columns, columnOptions });
}

function assertHandleOffset(index, offsetLeft) {
  cy.get('.' + cls('column-resize-handle'))
    .as('handles')
    .eq(index)
    .invoke('position')
    // @ts-ignore
    .its('left')
    .should('be.eql', offsetLeft - HANDLE_WIDTH_HALF);
}

function assertHandleLength(length) {
  cy.get('.' + cls('column-resize-handle'))
    .its('length')
    .should('be.eql', length);
}

function dragHandle(index, distance) {
  cy.get('.' + cls('column-resize-handle'))
    .eq(index)
    .trigger('mousedown')
    .then(($el) => {
      const { left, top } = $el.offset();
      const pageX = left + distance + HANDLE_WIDTH_HALF;
      const pageY = top;

      cy.root().trigger('mousemove', { pageX, pageY });
    })
    .trigger('mouseup');
}

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
});

describe('container width', () => {
  beforeEach(() => {
    const data = sampleData.slice(10);
    const columns = [{ name: 'name' }, { name: 'artist' }];

    createGrid({ data, columns });
  });

  it('default with is the same as the DOM width', () => {
    assertContainerWidth(CONTENT_WIDTH + SCROLLBAR_WIDTH);
  });

  it('setWidth() changes container width', () => {
    getGridInst().invoke('setWidth', 700);
    assertContainerWidth(700);
  });
});

describe('should calculate column widths automatically (container: 600)', () => {
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
      getGridInst().invoke('setWidth', 720 + SCROLLBAR_WIDTH);
      assertColumnWidth([240, 240, 240]);
    });

    it('setWidth(420) -> [150, 150, 120]', () => {
      getGridInst().invoke('setWidth', 420 + SCROLLBAR_WIDTH);
      assertColumnWidth([150, 150, 120]);
    });
  });

  context('when window.resize event occur', () => {
    it('reset container width and column width', () => {
      createGridWithWidths([{}, {}, {}]);
      const nextWidth = 720 + SCROLLBAR_WIDTH;

      cy.get('.' + cls('container'))
        .parent()
        .invoke('width', nextWidth);
      cy.window().trigger('resize');

      assertColumnWidth([240, 240, 240]);
      assertContainerWidth(nextWidth);
    });
  });

  context('Resize handle', () => {
    it('show resize handle if resizable: true', () => {
      createGridWithWidths([{ resizable: true }, { resizable: true }, {}]);

      assertHandleOffset(0, 200);
      assertHandleOffset(1, 400);
      assertHandleLength(2);
    });

    it('recalculate column width when dragging resize handle', () => {
      createGridWithWidths([{ resizable: true }, { resizable: true, minWidth: 200 }, {}]);

      dragHandle(0, 50);

      assertHandleOffset(0, 250);
      assertHandleOffset(1, 450);
      assertColumnWidth([250, 200, 150]);
    });
  });
});
