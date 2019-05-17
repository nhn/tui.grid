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
      const firstCallProps = {
        column: { name: 'age' },
        row: data[0],
        value: 30
      };
      const secondCallProps = {
        column: { name: 'age' },
        row: data[1],
        value: 40
      };

      expect(isSubSetOf(firstCallProps, formatterStub.args[0][0])).to.be.true;
      expect(isSubSetOf(secondCallProps, formatterStub.args[1][0])).to.be.true;
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
      const firstCallProps = {
        column: { name: 'age' },
        row: data[0],
        value: 30
      };
      const secondCallProps = {
        column: { name: 'age' },
        row: data[1],
        value: 40
      };

      expect(isSubSetOf(firstCallProps, prefixStub.args[0][0])).to.be.true;
      expect(isSubSetOf(secondCallProps, prefixStub.args[1][0])).to.be.true;
    });
  });

  it('postfix should be displayed after the value', async () => {
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

    cy.createGrid({ data, columns }).then(() => {
      cy.getCell(0, 'name').should('to.contain', 'Kim!!');
      cy.getCell(1, 'name').should('to.contain', 'Lee!!');
      cy.getCell(0, 'age').should('to.contain', '30 Old');
      cy.getCell(1, 'age').should('to.contain', '40 Old');

      const firstCallProps = {
        column: { name: 'age' },
        row: data[0],
        value: 30
      };
      const secondCallProps = {
        column: { name: 'age' },
        row: data[1],
        value: 40
      };

      expect(isSubSetOf(firstCallProps, postfixStub.args[0][0])).to.be.true;
      expect(isSubSetOf(secondCallProps, postfixStub.args[1][0])).to.be.true;
    });
  });
});
