import { OptRow } from '@t/options';
import { cls } from '@/helper/dom';

const data = [
  {
    name: 'Kim',
    age: 30,
  },
  {
    name: 'Lee',
    age: 40,
  },
] as OptRow[];
const columns = [{ name: 'name', editor: 'text' }, { name: 'age' }];

before(() => {
  cy.visit('/dist');
});

function assertBackgroundColor($el: JQuery<HTMLElement>, color: string) {
  expect($el.css('background-color')).to.eql(color);
}

function assertBorderColor($el: JQuery<HTMLElement>, color: string) {
  expect($el.css('border-color')).to.eql(color);
}

it('should have background color when mouse hover. And The background color disappears when the mouse leaves the row.', () => {
  const TEST_BG_COLOR = 'rgb(206, 147, 216)';
  const extOptions = { row: { hover: { background: TEST_BG_COLOR } } };
  cy.createGrid({
    data,
    columns,
    theme: { preset: 'clean', extOptions },
  });

  cy.getCell(0, 'name').trigger('mouseover');
  cy.get('[data-row-key=0]').each(($el) => {
    assertBackgroundColor($el, TEST_BG_COLOR);
  });
  cy.getCell(0, 'name').trigger('mouseout');
  cy.get('[data-row-key=0]').each(($el) => {
    expect($el.css('background-color')).not.to.eql(TEST_BG_COLOR);
  });
});

it('should apply custom theme properly', () => {
  const extOptions = {
    cell: {
      normal: {
        background: 'rgb(232, 237, 255)',
        border: 'rgb(255, 255, 255)',
      },
      header: {
        background: 'rgb(185, 201, 254)',
        border: 'rgb(170, 188, 254)',
        text: 'rgb(0, 51, 153)',
      },
      editable: {
        background: 'rgb(251, 251, 251)',
      },
      selectedHeader: {
        background: 'rgb(216, 216, 216)',
      },
      focused: {
        border: 'rgb(255, 155, 125)',
      },
    },
  };

  cy.createGrid({
    data,
    columns,
    theme: { preset: 'clean', extOptions },
  });

  cy.get(`.${cls('cell-header')}`).each(($el) => {
    assertBackgroundColor($el, 'rgb(185, 201, 254)');
    assertBorderColor($el, 'rgb(170, 188, 254)');
    expect($el.css('color')).to.eql('rgb(0, 51, 153)');
  });

  cy.getBodyCells().each(($el) => {
    assertBorderColor($el, 'rgb(255, 255, 255)');
  });

  cy.getColumnCells('name').each(($el) => {
    assertBackgroundColor($el, 'rgb(251, 251, 251)');
  });

  cy.getColumnCells('age').each(($el) => {
    assertBackgroundColor($el, 'rgb(232, 237, 255)');
  });

  cy.getHeaderCell('name').click();
  cy.getHeaderCell('name').should('have.css', 'background-color', 'rgb(216, 216, 216)');
  cy.get(`.${cls('layer-focus-border')}`).should(
    'have.css',
    'background-color',
    'rgb(255, 155, 125)'
  );
});
