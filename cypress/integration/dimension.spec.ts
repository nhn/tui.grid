import {cls} from '../../src/helper/common';

it('default with is the same as the DOM width', () => {
  cy.visit('http://localhost:6006/iframe.html?id=dimension--simple');

  const WIDTH = 600;

  cy.get('.' + cls('container')).within($container => {
    expect($container.width()).to.be.eql(WIDTH);
    // expect($container.height()).to.be.eql(300);
  });

  cy.get('.' + cls('rside-area')).within($rside => {
    expect($rside.width()).to.be.eql(WIDTH);

    expect($rside.find('.' + cls('head-area')).width()).to.be.eql(WIDTH - 17);
    expect($rside.find('.' + cls('body-area')).width()).to.be.eql(WIDTH - 17);
  });
});
