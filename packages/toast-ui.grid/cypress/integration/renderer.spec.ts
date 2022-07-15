import { createCustomLayerRenderer, CustomSvgRenderer } from '../helper/customRenderer';
import { CellRendererProps } from '@t/renderer';

before(() => {
  cy.visit('/dist');
});

describe('CREATE TYPE', () => {
  const CustomRenderer = createCustomLayerRenderer();
  const data = [
    { name: 'Lee', age: 20 },
    { name: 'Han', age: 28 },
    { name: 'Ryu', age: 22 },
  ];

  ['renderer', 'renderer type'].forEach((option) => {
    it(`create custom renderer by ${option} property`, () => {
      const columns = [
        { name: 'name' },
        {
          name: 'age',
          renderer: option === 'renderer' ? CustomRenderer : { type: CustomRenderer },
        },
      ];

      cy.createGrid({ data, columns });

      cy.get('input[type=range]').should('have.length', data.length);
    });
  });
});

it('mousedown event should be worked on svg custom renderer', () => {
  const data = [{ name: 'Lee', age: 20 }];
  const columns = [
    { name: 'name' },
    {
      name: 'age',
      renderer: CustomSvgRenderer,
    },
  ];

  cy.createGrid({ data, columns });
  cy.getCell(0, 'age').click();

  cy.getByCls('layer-focus').should('exist');
});

it('should apply the options to default renderer', () => {
  const data = [{ name: 'Lee' }];
  const columns = [
    {
      name: 'name',
      renderer: {
        styles: {
          fontWeight: '500',
        },
        attributes: {
          myCustom: 'my-custom',
          title: (props: CellRendererProps) => `my ${props.value}`,
        },
        classNames: ['my-class'],
      },
    },
  ];

  cy.createGrid({ data, columns });

  cy.getByCls('cell-content')
    .should('have.class', 'my-class')
    .and('have.css', 'font-weight', '500')
    .should('have.attr', 'myCustom', 'my-custom')
    .should('have.attr', 'title', 'my Lee');
});

it('should render data to plain text in default renderer', () => {
  const data = [{ tag: '<img src="" onerror="alert(123)" />' }];
  const columns = [
    {
      name: 'tag',
    },
  ];

  cy.createGrid({ data, columns });

  cy.getByCls('cell-content').invoke('html').should('to.eq', '<img src="">');
});
