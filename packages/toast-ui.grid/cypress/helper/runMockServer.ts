import { data } from '../../samples/dataSource/data';
import { data as sortedData } from '../../samples/dataSource/sortedData';

const successResponse = {
  result: true,
  data: {},
};

export function runMockServer() {
  cy.server();
  cy.route({
    method: 'GET',
    url: '/api/read?perPage=10&page=1',
    response: {
      result: true,
      data: {
        contents: data.slice(0, 10),
        pagination: {
          page: 1,
          totalCount: 20,
        },
      },
    },
  }).as('readPage1');

  cy.route({
    method: 'GET',
    url: '/api/read?perPage=10&page=2',
    response: {
      result: true,
      data: {
        contents: data.slice(10),
        pagination: {
          page: 2,
          totalCount: 20,
        },
      },
    },
  }).as('readPage2');

  cy.route({
    method: 'GET',
    url: 'api/read?perPage=10&page=1&sortColumn=id&sortAscending=true',
    response: {
      result: true,
      data: {
        contents: sortedData.slice(0, 10),
        pagination: {
          page: 1,
          totalCount: 20,
        },
      },
    },
  }).as('readAscData');

  cy.route({
    method: 'GET',
    url: 'api/read?perPage=10&page=1&sortColumn=id&sortAscending=false',
    response: {
      result: true,
      data: {
        contents: sortedData.slice(0, 10).reverse(),
        pagination: {
          page: 1,
          totalCount: 20,
        },
      },
    },
  }).as('readDescData');

  cy.route({
    method: 'GET',
    url: 'api/read?perPage=5&page=1',
    response: {
      result: true,
      data: {
        contents: data.slice(0, 5),
        pagination: {
          page: 1,
          totalCount: 20,
        },
      },
    },
  }).as('perPage5');

  cy.route({
    method: 'GET',
    url: 'api/read?perPage=8&page=1&id=5',
    response: {
      result: true,
      data: {
        contents: data.slice(0, 8).filter(({ id }) => id > 5),
        pagination: {
          page: 1,
          totalCount: 20,
        },
      },
    },
  }).as('perPage8');

  cy.route({
    method: 'GET',
    url: '/api/read?perPage=10&a=1&page=1',
    delay: 1000,
    response: {
      result: true,
      data: {
        contents: data.slice(0, 10),
        pagination: {
          page: 1,
          totalCount: 20,
        },
      },
    },
  }).as('readPageWithInitParams');

  cy.route({
    method: 'GET',
    url: '/api/read?a=2&perPage=10&page=1',
    response: {
      result: true,
      data: {
        contents: data.slice(0, 10),
        pagination: {
          page: 1,
          totalCount: 20,
        },
      },
    },
  }).as('readPageWithRequestParams');

  cy.route({
    method: 'POST',
    url: '/api/create',
    response: successResponse,
  }).as('createData');

  cy.route({
    method: 'PUT',
    url: '/api/update',
    response: successResponse,
  }).as('updateData');

  cy.route({
    method: 'DELETE',
    url:
      '/api/delete?deletedRows[0][id]=19&deletedRows[0][name]=The Magic Whip&deletedRows[0][artist]=Blur&deletedRows[0][rowKey]=1',
    response: successResponse,
  }).as('deleteData');

  cy.route({
    method: 'POST',
    url: '/api/modify',
    response: successResponse,
  }).as('modifyData');
}
