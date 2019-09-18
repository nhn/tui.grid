import { data } from '../../samples/basic';
import { isSubsetOf } from '../helper/compare';

const columns = [
  { name: 'name', minWidth: 150 },
  { name: 'artist', minWidth: 150 },
  { name: 'type', minWidth: 150 },
  { name: 'release', minWidth: 150 },
  { name: 'genre', minWidth: 150 }
];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
  cy.createGrid({
    data: data.slice(0, 3),
    rowHeaders: ['checkbox'],
    columns
  });
});

describe('row header API', () => {
  it('check, uncheck', () => {
    cy.gridInstance().invoke('check', 0);
    cy.get(`[data-row-key=0] input`).should('be.checked');

    cy.gridInstance().invoke('uncheck', 0);
    cy.get(`[data-row-key=0] input`).should('not.be.checked');
  });

  it('checkAll, uncheckAll', () => {
    cy.gridInstance().invoke('checkAll');

    cy.get('input').should($el => {
      $el.each((_, elem) => {
        expect(elem.checked).to.be.true;
      });
    });

    cy.gridInstance().invoke('uncheckAll');

    cy.get('input').should($el => {
      $el.each((_, elem) => {
        expect(elem.checked).to.be.false;
      });
    });
  });

  it('getCheckedRowKeys', () => {
    cy.gridInstance().invoke('check', 0);
    cy.gridInstance().invoke('check', 2);

    cy.gridInstance()
      .invoke('getCheckedRowKeys')
      .should(result => {
        expect(isSubsetOf([0, 2], result)).to.be.true;
      });
  });

  it('getCheckedRows', () => {
    cy.gridInstance().invoke('check', 0);
    cy.gridInstance().invoke('check', 2);

    cy.gridInstance()
      .invoke('getCheckedRows')
      .should(result => {
        expect(
          isSubsetOf(
            [{ rowKey: 0, name: 'Beautiful Lies' }, { rowKey: 2, name: 'Moves Like Jagger' }],
            result
          )
        ).to.be.true;
      });
  });

  it('checkAll, uncheckAll (Dynamic rendering)', () => {
    const gridData = [];
    for (let i = 0; i < 1000; i += 1) {
      gridData.push({
        id: i,
        name: `name${i}`,
        artist: `artist${i}`,
        type: `type${i}`
      });
    }
    cy.gridInstance().invoke('setBodyHeight', 300);
    cy.gridInstance().invoke('resetData', gridData);
    cy.gridInstance().invoke('checkAll');

    cy.get('input').should($el => {
      $el.each((_, elem) => {
        expect(elem.checked).to.be.true;
      });
    });

    cy.gridInstance().invoke('uncheckAll');

    cy.get('input').should($el => {
      $el.each((_, elem) => {
        expect(elem.checked).to.be.false;
      });
    });
  });
});
