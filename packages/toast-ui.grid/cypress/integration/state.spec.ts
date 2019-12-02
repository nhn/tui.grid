import { OptColumn } from '../../src/types';
import { cls } from '@/helper/dom';
import { runMockServer } from '../helper/runMockServer';

const columns: OptColumn[] = [{ name: 'A' }, { name: 'B' }];

before(() => {
  cy.visit('/dist');
});

const data = {
  initialRequest: false,
  api: {
    readData: { url: '/api/read', method: 'GET' }
  }
};

it('should show "No data." text when there is no data.', () => {
  cy.createGrid({ columns });
  cy.get(`.${cls('layer-state-content')}`).should('have.text', 'No data.');
});

it('should show "Loading data." text when fetch data.', () => {
  runMockServer();
  cy.createGrid({ columns, data });

  cy.gridInstance().invoke('readData');
  cy.get(`.${cls('layer-state-content')}`).should('have.text', 'Loading data.');
});
