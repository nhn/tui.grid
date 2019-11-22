import { cls } from '@/helper/dom';
import Grid from '@/grid';
import { OptRow } from '@/types';
import { data as sampleData } from '../../samples/basic';

interface GridGlobal {
  tui: { Grid: typeof Grid };
  grid: Grid;
}

const CONTENT_WIDTH = 600;
// @TODO: Retrieve scrollbar-width from real browser
const SCROLLBAR_WIDTH = 17;
const CELL_BORDER_WIDTH = 1;
const containerStyle = { width: `${CONTENT_WIDTH + SCROLLBAR_WIDTH}px` };
const HALF_WIDTH = 3;

function assertContainerWidth(width: number) {
  cy.get(`.${cls('container')}`)
    .invoke('width')
    .should('be.eql', width);

  cy.get(`.${cls('rside-area')}`).within(() => {
    cy.root()
      .invoke('width')
      .should('be.eql', width);

    cy.get(`.${cls('header-area')}`)
      .invoke('width')
      .should('be.eql', width - 17);

    cy.get(`.${cls('body-area')}`)
      .invoke('width')
      .should('be.eql', width);
  });
}

function assertColumnWidth(widths: number[]) {
  cy.get(`.${cls('rside-area')}`).within(() => {
    cy.get(`.${cls('header-area')} th`).as('headCols');
    cy.get(`.${cls('body-area')} tr:first-child td`).as('bodyCols');

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

interface WidthInfo {
  width?: number | 'auto';
  minWidth?: number;
  resizable?: boolean;
}

function createGridWithWidths(widths: WidthInfo[], commonMinWidth?: number) {
  const columns = widths.map(({ width, minWidth, resizable }, index) => ({
    name: `c${index}`,
    width,
    minWidth,
    resizable
  }));

  const data: OptRow[] = [{}];
  columns.forEach(({ name }) => {
    data[0][name] = name;
  });

  const columnOptions = { minWidth: commonMinWidth };

  cy.createGrid({ data, columns, columnOptions }, containerStyle);
}

function assertHandleOffset(index: number, offsetLeft: number) {
  cy.get(`.${cls('column-resize-handle')}`)
    .as('handles')
    .eq(index)
    .invoke('position')
    // @ts-ignore
    .its('left')
    .should('be.eq', offsetLeft - HALF_WIDTH);
}

function assertHandleLength(length: number) {
  cy.get(`.${cls('column-resize-handle')}`)
    .its('length')
    .should('be.eql', length);
}

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
});

describe('container width', () => {
  beforeEach(() => {
    const data = sampleData.slice(10);
    const columns = [{ name: 'name' }, { name: 'artist' }];

    cy.createGrid({ data, columns }, containerStyle);
  });

  it('default with is the same as the DOM width', () => {
    assertContainerWidth(CONTENT_WIDTH + SCROLLBAR_WIDTH);
  });

  it('setWidth() changes container width', () => {
    cy.gridInstance().invoke('setWidth', 700);
    assertContainerWidth(700);
  });
});

describe('auto calculate column widths (container: 600)', () => {
  it(`['auto', 'auto'] -> [300, 300]`, () => {
    createGridWithWidths([{ width: 'auto' }, { width: 'auto' }]);
    assertColumnWidth([300, 300]);
  });

  it(`[empty, empty] -> [300, 300] (default is 'auto')`, () => {
    createGridWithWidths([{}, {}]);
    assertColumnWidth([300, 300]);
  });

  it('[empty, empty, empty] -> [200, 200, 200]', () => {
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
      cy.gridInstance().invoke('setWidth', 720 + SCROLLBAR_WIDTH);
      assertColumnWidth([240, 240, 240]);
    });

    it('setWidth(420) -> [150, 150, 120]', () => {
      cy.gridInstance().invoke('setWidth', 420 + SCROLLBAR_WIDTH);
      assertColumnWidth([150, 150, 120]);
    });
  });

  context('resetColumnWidths', () => {
    it('[150, 150, 300]', () => {
      createGridWithWidths([{}, {}, {}]);
      cy.gridInstance().invoke('resetColumnWidths', [150, 150, 300]);
      assertColumnWidth([150, 150, 300]);
    });
  });

  context('when window.resize event occur', () => {
    it('reset container width and column width', () => {
      createGridWithWidths([{}, {}, {}]);
      const nextWidth = 720 + SCROLLBAR_WIDTH;

      cy.get(`.${cls('container')}`)
        .parent()
        .invoke('width', nextWidth);
      cy.window().trigger('resize');

      assertColumnWidth([240, 240, 240]);
      assertContainerWidth(nextWidth);
    });
  });

  context('Resize handle', () => {
    function dragColumnResizeHandle(index: number, distance: number) {
      cy.get(`.${cls('column-resize-handle')}`)
        .eq(index)
        .trigger('mousedown')
        .then($el => {
          const { left, top } = $el.offset()!;
          const pageX = left + distance + CELL_BORDER_WIDTH + HALF_WIDTH;
          const pageY = top;

          cy.root().trigger('mousemove', { pageX, pageY });
        })
        .trigger('mouseup');
    }

    it('show resize handle if resizable: true', () => {
      createGridWithWidths([{ resizable: true }, { resizable: true }, {}]);

      assertHandleOffset(0, 200);
      assertHandleOffset(1, 400);
      assertHandleLength(2);
    });

    it('recalculate column width when dragging resize handle', () => {
      createGridWithWidths([{ resizable: true }, { resizable: true, minWidth: 200 }, {}]);

      dragColumnResizeHandle(0, 50);

      assertHandleOffset(0, 250);
      assertHandleOffset(1, 450);
      assertColumnWidth([250, 200, 150]);
    });
  });
});

describe('height', () => {
  const DEF_HEADER_HEIGHT = 40;
  const BORER_WIDTH = 1;
  const columns = [{ name: 'c1' }];
  const data = [{ c1: 'test' }];

  function assertBodyHeight(height: number) {
    cy.get(`.${cls('body-area')}`).each($body => {
      expect($body.height()).to.eq(height);
    });
  }

  it('fitToParent', () => {
    const PARENT_HEIGHT = 400;

    cy.window().then((win: Window & Partial<GridGlobal>) => {
      const { document, tui } = win;
      const parentEl = document.createElement('div');
      const el = document.createElement('div');

      parentEl.style.height = `${PARENT_HEIGHT}px`;
      document.body.appendChild(parentEl);
      parentEl.appendChild(el);

      new tui!.Grid({ el, columns, data, bodyHeight: 'fitToParent' });
      cy.wait(10);
    });

    assertBodyHeight(400 - DEF_HEADER_HEIGHT - BORER_WIDTH);
  });

  it('bodyHeight: 200', () => {
    cy.createGrid({ data, columns, bodyHeight: 200 }, containerStyle);
    assertBodyHeight(200);
  });

  it('minBodyHeight: 200', () => {
    cy.createGrid({ data, columns, minBodyHeight: 200 }, containerStyle);
    assertBodyHeight(200);
  });

  it('minBodyHeight takes precedence over bodyHeight', () => {
    cy.createGrid({ data, columns, minBodyHeight: 300, bodyHeight: 200 }, containerStyle);
    assertBodyHeight(300);
  });

  context('height resize handle', () => {
    function dragHeightReiszeHandle(distance: number) {
      cy.get(`.${cls('height-resize-handle')}`).within($el => {
        const { top } = $el.offset()!;

        cy.root()
          .trigger('mousedown', { pageY: top })
          .trigger('mousemove', { pageY: top + distance })
          .trigger('mouseup');
      });
    }

    it('reset bodyHeight when dragging', () => {
      cy.createGrid({ data, columns, bodyHeight: 200, heightResizable: true }, containerStyle);

      dragHeightReiszeHandle(100);
      assertBodyHeight(300);
    });
  });

  it('setBodyHeight() changes body height', () => {
    cy.createGrid({ data, columns, minBodyHeight: 300, bodyHeight: 200 }, containerStyle);
    cy.gridInstance().invoke('setBodyHeight', 300);
    assertBodyHeight(300);
  });
});

describe('rowHeight', () => {
  it('rowHeight: 70', () => {
    const columns = [{ name: 'c1' }];
    const data = [{ c1: 'test' }];
    cy.createGrid({ data, columns, bodyHeight: 300, rowHeight: 70 });
    cy.get('.tui-grid-row-odd').within($el => {
      expect($el.height()).to.eql(70);
    });
  });

  it('rowHeight: custom', () => {
    const columns = [{ name: 'c1' }];
    const data = [{ c1: 'test', _attributes: { height: 70 } }];
    cy.createGrid({ data, columns, bodyHeight: 300 });
    cy.get('.tui-grid-row-odd').within($el => {
      expect($el.height()).to.eql(70);
    });
  });
});
