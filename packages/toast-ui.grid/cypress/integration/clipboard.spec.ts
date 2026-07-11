import GridEvent from '@/event/gridEvent';
import { GridEventProps } from '@t/event';

// @TODO if cypress issue is resolved, should add clipboard test case
// https://github.com/cypress-io/cypress/issues/2386

// before(() => {
//   cy.visit('/dist');
// });

// const columns = [
//   { name: 'c1', editor: { type: 'text' } },
//   { name: 'c2', editor: { type: 'text' } },
//   { name: 'c3', editor: { type: 'text' } }
// ];

// const data = [
//   { c1: 'c1', c2: 'c2', c3: 'c3' },
//   { c1: 'c1', c2: 'c2', c3: 'c3' },
//   { c1: 'c1', c2: 'c2', c3: 'c3' },
//   { c1: 'c1', c2: 'c2', c3: 'c3' }
// ];

// const defaultOptions = {
//   data,
//   columns,
//   bodyHeight: 300,
//   columnOptions: {
//     minWidth: 150
//   }
// };

// type Address = [number, number];

// describe('copy to clipboard', () => {
//   it('basic value', () => {});
//   it('formatted value', () => {});
//   it('custom value', () => {});
// });
// it('paste', () => {});

export {};

before(() => {
  cy.visit('/dist');
});

describe('paste with virtual scrolling', () => {
  it('should update rows outside the viewport when data is filtered', () => {
    const data = Array.from({ length: 20 }, (_, index) => ({
      type: index % 2 ? 'odd' : 'even',
      value: `old-${index}`,
    }));

    cy.createGrid({
      data,
      bodyHeight: 130,
      rowHeight: 40,
      columns: [
        { name: 'type', filter: 'text' },
        { name: 'value', editor: 'text' },
      ],
    });

    cy.gridInstance().then((grid) => {
      let beforeChangeCount = 0;
      let afterChangeCount = 0;
      const copiedData = Array.from({ length: 5 }, (_, index) => [`new-${index}`]);

      grid.on('beforeChange', (event: GridEventProps & GridEvent) => {
        if (event.origin === 'paste') {
          beforeChangeCount = event.changes!.length;
        }
      });
      grid.on('afterChange', (event: GridEventProps & GridEvent) => {
        if (event.origin === 'paste') {
          afterChangeCount = event.changes!.length;
        }
      });

      grid.filter('type', [{ code: 'eq', value: 'even' }]);
      grid.focus(0, 'value');
      grid.dispatch('paste', copiedData);

      [0, 2, 4, 6, 8].forEach((rowKey, index) => {
        expect(grid.getValue(rowKey, 'value')).to.eq(`new-${index}`);
      });
      expect(beforeChangeCount).to.eq(5);
      expect(afterChangeCount).to.eq(5);
      expect(grid.getModifiedRows().updatedRows).to.have.length(5);
    });

    cy.focusAndWait(8, 'value');
    cy.getCell(8, 'value').should('have.text', 'new-4');
  });
});
