import { OptColumn } from '@t/options';

const columns: OptColumn[] = [{ name: 'A' }, { name: 'B' }];

before(() => {
  cy.visit('/dist');
});

function runMockServer() {
  cy.server();
  cy.route({
    method: 'GET',
    url: '/api/read?perPage=10&page=1',
    delay: 5000,
    response: {
      result: true,
      data: {
        contents: [{ A: 'test', B: 'test' }],
        pagination: {
          page: 1,
          totalCount: 2,
        },
      },
    },
  });
}

const data = {
  api: {
    readData: { url: '/api/read', method: 'GET' },
  },
};

it('should show "No data." text when there is no data.', () => {
  cy.createGrid({ columns });
  cy.getByCls('layer-state-content').should('have.text', 'No data.');
});

it('should show "Loading data." text when fetch data.', () => {
  runMockServer();
  cy.createGrid({ columns, data });

  cy.getByCls('layer-state-content').should('have.text', 'Loading data.');
});
