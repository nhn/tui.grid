import { FormatterProps } from '@/store/types';
import { isSubSetOf } from '../helper/compare';

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
});

describe('formatter', () => {
  const data = [{ name: 'Kim', age: 30 }, { name: 'Lee', age: 40 }];

  const ageFormatterProps1 = {
    column: { name: 'age' },
    row: data[0],
    value: 30
  };

  const ageFormatterProps2 = {
    column: { name: 'age' },
    row: data[1],
    value: 40
  };

  function assertAgeFormatterCallProps(formatterStub: any) {
    expect(isSubSetOf(ageFormatterProps1, formatterStub.args[0][0])).to.be.true;
    expect(isSubSetOf(ageFormatterProps2, formatterStub.args[1][0])).to.be.true;
  }

  it('formatter should be applied to the value', () => {
    const formatterStub = cy.stub();
    const columns = [
      {
        name: 'name',
        formatter: ({ value }: FormatterProps) => `Mr. ${value}`
      },
      {
        name: 'age',
        formatter: formatterStub.returns('AGE')
      }
    ];

    cy.createGrid({ data, columns });

    cy.getCell(0, 'name').should('to.have.text', 'Mr. Kim');
    cy.getCell(1, 'name').should('to.have.text', 'Mr. Lee');
    cy.getCell(0, 'age').should('to.have.text', 'AGE');
    cy.getCell(1, 'age').should('to.have.text', 'AGE');

    cy.waitForGrid().then(() => {
      assertAgeFormatterCallProps(formatterStub);
    });
  });

  it('prefix should be displayed before the value', () => {
    const prefixStub = cy.stub();
    const columns = [
      {
        name: 'name',
        prefix: 'Mr. '
      },
      {
        name: 'age',
        prefix: prefixStub.returns('Age: ')
      }
    ];

    cy.createGrid({ data, columns });

    cy.getCell(0, 'name').should('to.have.text', 'Mr. Kim');
    cy.getCell(1, 'name').should('to.have.text', 'Mr. Lee');
    cy.getCell(0, 'age').should('to.have.text', 'Age: 30');
    cy.getCell(1, 'age').should('to.have.text', 'Age: 40');

    cy.waitForGrid().then(() => {
      assertAgeFormatterCallProps(prefixStub);
    });
  });

  it('postfix should be displayed after the value', () => {
    const postfixStub = cy.stub();
    const columns = [
      {
        name: 'name',
        postfix: '!!'
      },
      {
        name: 'age',
        postfix: postfixStub.returns(' Old')
      }
    ];

    cy.createGrid({ data, columns });
    cy.getCell(0, 'name').should('to.have.text', 'Kim!!');
    cy.getCell(1, 'name').should('to.have.text', 'Lee!!');
    cy.getCell(0, 'age').should('to.have.text', '30 Old');
    cy.getCell(1, 'age').should('to.have.text', '40 Old');

    cy.waitForGrid().then(() => {
      assertAgeFormatterCallProps(postfixStub);
    });
  });
});

describe('escapeHTML / defaultValue', () => {
  it('if escapeHTML is true, HTML Entities should be escaped', () => {
    const data = [{ name: '<b>Kim</b>', age: 10 }];
    const columns = [
      {
        name: 'name',
        escapeHTML: true
      },
      {
        name: 'age',
        prefix: '<b>',
        postfix: '</b>',
        formatter: ({ value }: FormatterProps) => `${value}<br/>`,
        escapeHTML: true
      }
    ];

    cy.createGrid({ data, columns });
    cy.getCell(0, 'name').should('to.have.text', '<b>Kim</b>');
    cy.getCell(0, 'age').should('to.have.text', '<b>10<br/></b>');
  });
});

describe('defaultValue', () => {
  it('if the vlaue is empty, defaultValue should be applied', () => {
    const data = [{ name: 'Lee', age: 20 }, {}];
    const columns = [
      {
        name: 'name',
        defaultValue: 'Kim'
      },
      {
        name: 'age',
        defaultValue: '30'
      }
    ];

    cy.createGrid({ data, columns });

    cy.getCell(0, 'name').should('to.have.text', 'Lee');
    cy.getCell(0, 'age').should('to.have.text', '20');
    cy.getCell(1, 'name').should('to.have.text', 'Kim');
    cy.getCell(1, 'age').should('to.have.text', '30');
  });
});

describe('cell align styles', () => {
  it('align/valign should be applied to the cell element', () => {
    const data = [
      {
        col1: '1',
        col2: '2'
      }
    ];
    const columns = [
      {
        name: 'col1',
        align: 'right'
      },
      {
        name: 'col2',
        valign: 'bottom'
      }
    ];

    cy.createGrid({ data, columns });
    cy.getCell(0, 'col1').should('have.css', 'text-align', 'right');
    cy.getCell(0, 'col2').should('have.css', 'vertical-align', 'bottom');
  });
});

describe('cell content ellipsis/whitespace', () => {
  it('ellipsis and whitespace style should be applied to the cell-content', () => {
    const data = [
      {
        col1: 'something very long text to exceed with of the cell',
        col2: 'something very long text to\nexceed with of the cell'
      }
    ];
    const columns = [
      {
        name: 'col1',
        ellipsis: true
      },
      {
        name: 'col2',
        whiteSpace: 'pre'
      }
    ];

    cy.createGrid({ data, columns }, { width: '400px' });
    cy.getCellContent(0, 'col1').should('have.css', 'text-overflow', 'ellipsis');
    cy.getCellContent(0, 'col2').should('have.css', 'white-space', 'pre');
  });
});
