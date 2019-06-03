import { data } from '../../samples/datasource/data';
import { data as sortedData } from '../../samples/datasource/sortedData';

const successResponse = {
  result: true,
  data: {}
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
          totalCount: 20
        }
      }
    }
  })
    .as('readPage1')
    .route({
      method: 'GET',
      url: '/api/read?perPage=10&page=2',
      response: {
        result: true,
        data: {
          contents: data.slice(10),
          pagination: {
            page: 2,
            totalCount: 20
          }
        }
      }
    })
    .as('readPage2')
    .route({
      method: 'GET',
      url: 'api/read?perPage=10&sortColumn=id&sortAscending=true&page=1',
      response: {
        result: true,
        data: {
          contents: sortedData.slice(0, 10),
          pagination: {
            page: 1,
            totalCount: 20
          }
        }
      }
    })
    .as('readAscData')
    .route({
      method: 'GET',
      url: 'api/read?perPage=10&sortColumn=id&sortAscending=false&page=1',
      response: {
        result: true,
        data: {
          contents: data.slice(0, 10),
          pagination: {
            page: 1,
            totalCount: 20
          }
        }
      }
    })
    .as('readDescData')
    .route({
      method: 'POST',
      url: '/api/create',
      response: successResponse
    })
    .as('createData')
    .route({
      method: 'PUT',
      url: '/api/update',
      response: successResponse
    })
    .as('updateData')
    .route({
      method: 'DELETE',
      url:
        '/api/delete?deletedRows[0][id]=19&deletedRows[0][name]=The+Magic+Whip&deletedRows[0][artist]=Blur&deletedRows[0][rowKey]=1',
      response: successResponse
    })
    .as('deleteData')
    .route({
      method: 'POST',
      url: '/api/modify',
      response: successResponse
    })
    .as('modifyData');
}
