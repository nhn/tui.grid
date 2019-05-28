const data = [{ name: 'Kim', age: 10 }, { name: 'Lee', age: 20 }];
const columns = [{ name: 'name' }, { name: 'age' }];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });

  cy.createGrid({ data, columns });
});

describe('eventBus', () => {
  it('callback', () => {
    const callbackFnMap = {
      click() {}
    };
    cy.spy(callbackFnMap, 'click');
    cy.gridInstance().invoke('on', 'aa', callbackFnMap.click);
    cy.getCell(0, 'name').click();
    expect(callbackFnMap.click).to.be.called;
  });
});
