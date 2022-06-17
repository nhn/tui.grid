import { OptRow } from '@t/options';
import { data as sampleData } from '../../samples/basic';

const CONTENT_WIDTH = 600;
// @TODO: Retrieve scrollbar-width from real browser
const SCROLLBAR_WIDTH = 17;
const containerStyle = { width: `${CONTENT_WIDTH + SCROLLBAR_WIDTH}px` };
const HALF_WIDTH = 3;

function getRside() {
  return cy.getByCls('rside-area');
}

function getRsideHeader() {
  return cy.getByCls('rside-area', 'header-area');
}

function getColumnResizeHandle() {
  return cy.getByCls('column-resize-handle');
}

function assertWidth(width: number) {
  cy.getByCls('container').invoke('width').should('eql', width);

  getRside().invoke('width').should('eql', width);

  getRsideHeader()
    .invoke('width')
    .should('eql', width - 17);

  cy.getRsideBody().invoke('width').should('eql', width);
}

function assertColumnWidth(widths: number[]) {
  getRsideHeader().get('th').as('headCols');

  cy.getRsideBody().get('tr:first-child td').as('bodyCols');

  widths.forEach((width, index) => {
    cy.get('@headCols').eq(index).invoke('outerWidth').should('eql', width);

    cy.get('@bodyCols').eq(index).invoke('outerWidth').should('eql', width);
  });
}

function assertHandleOffset(index: number, offsetLeft: number) {
  getColumnResizeHandle()
    .eq(index)
    .invoke('position')
    // @ts-ignore
    .its('left')
    .should('eql', offsetLeft - HALF_WIDTH);
}

function assertHandleLength(length: number) {
  getColumnResizeHandle().its('length').should('eql', length);
}

function assertBodyHeight(height: number) {
  cy.getByCls('body-area').each(($body) => {
    expect($body.height()).to.eq(height);
  });
}

interface WidthInfo {
  width?: number | 'auto';
  minWidth?: number;
  resizable?: boolean;
}

interface HeightInfo {
  minBodyHeight?: number;
  bodyHeight?: number | 'fitToParent';
  heightResizable?: boolean;
}

interface RowHeightInfo {
  rowHeight?: number;
  minRowHeight?: number;
  data?: OptRow[];
}

function createGridWithWidths(widths: WidthInfo[], commonMinWidth?: number) {
  const columns = widths.map(({ width, minWidth, resizable }, index) => ({
    name: `c${index}`,
    width,
    minWidth,
    resizable,
  }));

  const data: OptRow[] = [{}];
  columns.forEach(({ name }) => {
    data[0][name] = name;
  });

  const columnOptions = { minWidth: commonMinWidth };

  cy.createGrid({ data, columns, columnOptions }, containerStyle);
}

function createGridWithBodyHeight(heightInfo: HeightInfo, parentEl?: HTMLElement) {
  const columns = [{ name: 'c1' }];
  const data = [{ c1: 'test' }];
  cy.createGrid({ data, columns, ...heightInfo }, containerStyle, parentEl);
}

function createGridWithRowHeight(rowHeightInfo: RowHeightInfo) {
  const columns = [{ name: 'c1' }];
  const data = [{ c1: 'test1' }, { c1: 'test2' }];
  cy.createGrid({ data, columns, ...rowHeightInfo }, containerStyle);
}

before(() => {
  cy.visit('/dist');
});

describe('container width', () => {
  beforeEach(() => {
    const data = sampleData.slice(10);
    const columns = [{ name: 'name' }, { name: 'artist' }];

    cy.createGrid({ data, columns }, containerStyle);
  });

  it('default width is the same as the DOM width', () => {
    assertWidth(CONTENT_WIDTH + SCROLLBAR_WIDTH);
  });

  it('setWidth() changes container width', () => {
    cy.gridInstance().invoke('setWidth', 700);
    assertWidth(700);
  });
});

describe('auto calculate column widths (container: 600)', () => {
  it(`['auto', 'auto'] -> [300, 300]`, () => {
    createGridWithWidths([
      { width: 'auto', minWidth: 300 },
      { width: 'auto', minWidth: 300 },
    ]);
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

      cy.getByCls('container').parent().invoke('width', nextWidth);
      cy.window().trigger('resize');

      assertColumnWidth([240, 240, 240]);
      assertWidth(nextWidth);
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

      cy.dragColumnResizeHandle(0, 50);

      assertHandleOffset(0, 250);
      assertHandleOffset(1, 450);
      assertColumnWidth([250, 200, 150]);
    });
  });

  context('should extend the width with `width: auto` option as text length', () => {
    function createGrid({ hasLongText = true, hasAutoWidth = true } = {}) {
      const data: OptRow[] = [{}];
      const names = ['c1', 'c2', 'c3', 'c4', 'c5'];
      const columns = names.map((name) => ({ name, minWidth: 150 }));

      columns.forEach(({ name }) => {
        data[0][name] = name;
      });
      if (hasAutoWidth) {
        // @ts-ignore
        columns[0].width = 'auto';
      }
      if (hasLongText) {
        data[0].c1 = 'looooooooooooooong contents';
      }

      cy.createGrid({ data, columns });
    }

    it('initial rendering', () => {
      createGrid();

      assertColumnWidth([189, 150, 150, 150, 150]);
    });

    it('after calling resetData()', () => {
      createGrid({ hasLongText: false });

      cy.gridInstance().invoke('resetData', [{ c1: 'looooooooooooooong contents' }]);

      assertColumnWidth([189, 150, 150, 150, 150]);
    });

    it('after calling setColumns()', () => {
      createGrid({ hasAutoWidth: false });

      const columns = ['c1', 'c2', 'c3', 'c4', 'c5'].map((name) => ({ name, minWidth: 150 }));
      // @ts-ignore
      columns[0].width = 'auto';
      cy.gridInstance().invoke('setColumns', columns);

      assertColumnWidth([189, 150, 150, 150, 150]);
    });

    it('after calling setValue()', () => {
      createGrid({ hasLongText: false });

      cy.gridInstance().invoke('setValue', 0, 'c1', 'looooooooooooooong contents');

      assertColumnWidth([189, 150, 150, 150, 150]);
    });

    it('after calling setRow()', () => {
      createGrid({ hasLongText: false });

      cy.gridInstance().invoke('setRow', 0, { c1: 'looooooooooooooong contents' });

      assertColumnWidth([189, 150, 150, 150, 150]);
    });

    it('after calling appendRow()', () => {
      createGrid({ hasLongText: false });

      cy.gridInstance().invoke('appendRow', { c1: 'looooooooooooooong contents' });

      assertColumnWidth([189, 150, 150, 150, 150]);
    });

    it('after calling removeRow()', () => {
      createGrid({ hasLongText: false });

      cy.gridInstance().invoke('appendRow', { c1: 'looooooooooooooong contents' });
      cy.gridInstance().invoke('removeRow', 1);

      assertColumnWidth([150, 158, 158, 158, 159]);
    });

    it('after calling appendRows()', () => {
      createGrid({ hasLongText: false });

      cy.gridInstance().invoke('appendRows', [{ c1: 'looooooooooooooong contents' }]);

      assertColumnWidth([189, 150, 150, 150, 150]);
    });

    it('after calling setColumnValues()', () => {
      createGrid({ hasLongText: false });

      cy.gridInstance().invoke('setColumnValues', 'c1', 'looooooooooooooong contents');

      assertColumnWidth([189, 150, 150, 150, 150]);
    });
  });
});

describe('body height', () => {
  function dragHeightReiszeHandle(distance: number) {
    cy.getByCls('height-resize-handle').within(($el) => {
      const { top } = $el.offset()!;

      cy.root()
        .trigger('mousedown', { pageY: top })
        .trigger('mousemove', { pageY: top + distance })
        .trigger('mouseup');
    });
  }

  it('fitToParent', () => {
    const PARENT_HEIGHT = 400;
    const DEF_HEADER_HEIGHT = 40;
    const BORER_WIDTH = 1;
    const parentEl = document.createElement('div');

    parentEl.style.height = `${PARENT_HEIGHT}px`;

    createGridWithBodyHeight({ bodyHeight: 'fitToParent' }, parentEl);

    assertBodyHeight(400 - DEF_HEADER_HEIGHT - BORER_WIDTH);
  });

  it('bodyHeight: 200', () => {
    createGridWithBodyHeight({ bodyHeight: 200 });
    assertBodyHeight(200);
  });

  it('minBodyHeight: 200', () => {
    createGridWithBodyHeight({ minBodyHeight: 200 });
    assertBodyHeight(200);
  });

  it('minBodyHeight takes precedence over bodyHeight', () => {
    createGridWithBodyHeight({ minBodyHeight: 300, bodyHeight: 200 });
    assertBodyHeight(300);
  });

  it('reset bodyHeight when dragging height resize handle', () => {
    createGridWithBodyHeight({ bodyHeight: 200, heightResizable: true });
    dragHeightReiszeHandle(100);

    assertBodyHeight(300);
  });

  it('setBodyHeight() changes body height', () => {
    createGridWithBodyHeight({ minBodyHeight: 300, bodyHeight: 200 });
    cy.gridInstance().invoke('setBodyHeight', 300);

    assertBodyHeight(300);
  });
});

describe('row height', () => {
  it('rowHeight: 70', () => {
    createGridWithRowHeight({ rowHeight: 70 });

    cy.getRsideBody()
      .find('tr')
      .each(($el) => {
        expect($el.height()).to.eql(70);
      });
  });

  it('rowHeight: 15', () => {
    // The default value of minRowHeight is 40.
    // If the value of rowHeight is less than minRowHeight, the actual row height is set as minRowHeight.
    // Therefore, the minRowHeight value also needs to be set.
    createGridWithRowHeight({ rowHeight: 15, minRowHeight: 15 });

    cy.getRsideBody()
      .find('tr')
      .each(($el) => {
        expect($el.height()).to.eql(15);
      });
  });

  it('rowHeight: custom', () => {
    const data = [{ c1: 'test1', _attributes: { height: 70 } }, { c2: 'test2' }];
    createGridWithRowHeight({ data });

    cy.getByCls('row-odd').invoke('height').should('eq', 70);
    cy.getByCls('row-even').invoke('height').should('eq', 40);
  });

  it('rowHeight: auto - The rowHeight changes according to the text longest content.', () => {
    const data = [
      {
        col1: 'something very long text to exceed with of the cell',
        col2: 'something very long text to\nexceed with of the cell',
        col3:
          'grid         example\ngrid newline example\n\ngrid newline example\n\ngrid newline example\n\n',
        col4: 'grid         example\ngrid newline example\n\ngrid newline example\n\n',
        col5: 'grid         example\ngrid newline example\n\ngrid newline example\n\n',
      },
    ];
    const columns = [
      { name: 'col1' },
      { name: 'col2' },
      {
        name: 'col3',
        whiteSpace: 'normal',
        editor: 'text',
      },
      { name: 'col4' },
      { name: 'col5' },
    ];

    cy.createGrid({ data, columns, rowHeight: 'auto' });

    cy.getByCls('row-odd').invoke('height').should('eq', 69);

    cy.gridInstance().invoke('startEditing', 0, 'col3');
    cy.getByCls('content-text').type('Kim');
    cy.gridInstance().invoke('finishEditing');

    cy.getByCls('row-odd').invoke('height').should('eq', 40);
  });

  it('rowHeight: auto - The rowHeight changes properly when showing the hidden column dynamically', () => {
    const data = [
      {
        col1: 'something very long text to exceed with of the cell',
        col2: 'something very long text to\nexceed with of the cell',
        col3:
          'grid         example\ngrid newline example\n\ngrid newline example\n\ngrid newline example\n\n',
        col4: 'grid         example\ngrid newline example\n\ngrid newline example\n\n',
        col5: 'grid         example\ngrid newline example\n\ngrid newline example\n\n',
      },
    ];
    const columns = [
      { name: 'col1' },
      { name: 'col2', hidden: true },
      {
        name: 'col3',
        whiteSpace: 'normal',
        editor: 'text',
      },
      { name: 'col4' },
      { name: 'col5' },
    ];

    cy.createGrid({ data, columns, rowHeight: 'auto', rowHeaders: ['rowNum'], width: 500 });

    cy.getByCls('row-odd').invoke('height').should('eq', 84);

    cy.gridInstance().invoke('showColumn', 'col2');

    cy.getByCls('row-odd').invoke('height').should('eq', 114);
  });
});
