import {
  notify,
  observable,
  observe,
  batchObserver,
  asyncInvokeObserver,
} from '@/helper/observable';

it('observe() should invoke callback function whenever related props changed', () => {
  const person = observable({
    name: 'Kim',
    age: 20,
  });

  const book = observable({
    title: 'JS Guide',
    author: 'Lee',
  });

  const callback1 = cy.stub();
  const callback2 = cy.stub();
  observe(() => callback1(person.name, book.title));
  observe(() => callback2(person.age, book.author));

  // invoke callback function immediately
  expect(callback1).to.be.calledWith('Kim', 'JS Guide');
  expect(callback2).to.be.calledWith(20, 'Lee');

  callback1.resetHistory();
  callback2.resetHistory();

  person.age = 11;
  expect(callback1).not.to.be.called;
  expect(callback2).to.be.calledWith(11, 'Lee');

  callback1.resetHistory();
  callback2.resetHistory();

  book.title = 'Java Guide';
  expect(callback1).to.be.calledWith('Kim', 'Java Guide');
  expect(callback2).not.to.be.called;
});

it('computed (getter) property and observe', () => {
  const person = observable({
    p1: '1',
    get p2() {
      return `${this.p1}2`;
    },
    get p3() {
      return `${this.p2}3`;
    },
  });

  expect(person.p2).to.eql('12');
  expect(person.p3).to.eql('123');

  const callback2 = cy.stub();
  const callback3 = cy.stub();
  observe(() => callback2(person.p2));
  observe(() => callback3(person.p3));

  expect(callback2).to.be.calledWith('12');
  expect(callback3).to.be.calledWith('123');

  callback2.resetHistory();
  callback3.resetHistory();

  person.p1 = 'A';
  expect(callback2).to.be.calledWith('A2');
  expect(callback3).to.be.calledWith('A23');

  expect(person.p2).to.eql('A2');
  expect(person.p3).to.eql('A23');
});

it('observe returns a function which stops observing', () => {
  const person = observable({
    p1: '1',
    get p2() {
      return `${this.p1}2`;
    },
    get p3() {
      return `${this.p2}3`;
    },
  });

  const callback1 = cy.stub();
  const callback2 = cy.stub();
  const callback3 = cy.stub();

  const unobserve1 = observe(() => callback1(person.p1));
  const unobserve2 = observe(() => callback2(person.p2));
  const unobserve3 = observe(() => callback3(person.p3));
  unobserve1();
  unobserve2();
  unobserve3();

  person.p1 = 'A';

  expect(callback1).to.be.calledOnce;
  expect(callback2).to.be.calledOnce;
  expect(callback3).to.be.calledOnce;
});

it('array index property cannot be observable', () => {
  expect(() => {
    observable([1, 2, 3]);
  }).to.throw('Array object cannot be Reactive');
});

it('notify methods should invoke observers', () => {
  const person = observable({
    p1: '1',
    get p2() {
      return `${this.p1}2`;
    },
  });

  const callback1 = cy.stub();
  const callback2 = cy.stub();

  observe(() => callback1(person.p1));
  observe(() => callback2(person.p2));

  callback1.resetHistory();
  notify(person, 'p1');

  expect(callback1).to.be.calledWith('1');

  callback2.resetHistory();
  notify(person, 'p2');

  expect(callback2).to.be.calledWith('12');
});

it('observe should react to conditional logic', () => {
  const person = observable({
    flag: false,
    name: 'Kim',
  });

  const callback = cy.stub();
  observe(() => {
    if (person.flag) {
      callback(person.name);
    }
  });

  person.flag = true;

  callback.resetHistory();

  person.name = 'Lee';

  expect(callback).to.be.calledWith('Lee');
});

it('recursive observe should work properly with dynamic observe', () => {
  const callback1 = cy.stub();
  const callback2 = cy.stub();
  const callback3 = cy.stub();

  const obj1 = observable({ num: 0 });
  const obj2 = observable({ num: 0 });
  const obj3 = observable({ num: 0 });

  observe(() => {
    callback1(obj1.num);
  });

  observe(() => {
    // This is recursive call (trigger callback2);
    obj2.num = obj1.num + 10;
    if (obj1.num === 0) {
      callback1(obj1.num);
    } else {
      // This is dynamic observe (should add observe for obj3.num)
      callback3(obj3.num);
    }
  });

  observe(() => {
    callback2(obj2.num);
  });

  callback1.resetHistory();
  callback2.resetHistory();
  callback3.resetHistory();

  obj1.num = 10;

  expect(callback1).to.be.calledWith(10);
  expect(callback2).to.be.calledWith(20);
  expect(callback3).to.be.calledWith(0);

  callback3.resetHistory();

  obj3.num = 10;

  expect(callback3).to.be.calledWith(10);
});

describe('batch update', () => {
  it('duplicated update is not executed in batch update', () => {
    const callback = cy.stub();
    const obj = observable({ num: 0 });

    observe(() => {
      callback(obj.num);
    });

    observe(() => {
      obj.num = 20;
      obj.num = 10;
    });

    expect(callback).to.be.calledTwice;
    expect(callback).to.not.be.calledWith(20);
    expect(callback).to.be.calledWith(10);
  });

  it('duplicated update is executed in sync batch update', () => {
    const callback = cy.stub();
    const obj = observable({ num: 0 });

    observe(() => {
      callback(obj.num);
    });

    observe(() => {
      obj.num = 20;
      obj.num = 10;
    }, true);

    expect(callback).to.be.calledThrice;
    expect(callback).to.be.calledWith(20);
    expect(callback).to.be.calledWith(10);
  });

  it('`sync` of computed observer is set by creating observable object', () => {
    const callback1 = cy.stub();
    const callback2 = cy.stub();

    const obj1 = observable(
      {
        start: 0,
        end: 0,
        get sum() {
          callback1();
          return this.start + this.end;
        },
      },
      true
    );

    const obj2 = observable({
      start: 0,
      end: 0,
      get sum() {
        callback2();
        return this.start + this.end;
      },
    });

    observe(() => {
      obj1.start = 20;
      obj1.end = 10;
    });

    observe(() => {
      obj2.start = 20;
      obj2.end = 10;
    });

    expect(callback1).to.be.calledThrice;
    expect(callback2).to.be.calledTwice;
  });

  it('should excute update independently based `sync` type of each observe function', () => {
    const callback1 = cy.stub();
    const callback2 = cy.stub();

    const obj = observable(
      {
        start: 0,
        end: 0,
        get sum() {
          callback1();
          return this.start + this.end;
        },
      },
      true
    );

    observe(() => {
      callback2(obj.start, obj.end);
    });

    observe(() => {
      obj.start = 20;
      obj.start = 10;
      obj.end = 10;
    });

    expect(callback1).to.be.callCount(4);
    expect(callback2).to.be.calledTwice;
  });
});

it('batched observer should not invoke observer', () => {
  const callback = cy.stub();
  const obj = observable({ num: 0 });

  observe(() => {
    callback(obj.num);
  });

  batchObserver(() => {
    obj.num = 20;
  });

  expect(callback).to.be.calledOnce;
});

it('asyncInvokeObserver API should invoke observer asynchronously', () => {
  const callback = cy.stub();
  const obj = observable({ num: 0 });

  for (let i = 0; i < 100; i += 1) {
    asyncInvokeObserver(() => {
      callback();
      obj.num = 20;
    });
  }

  cy.wrap(callback).should('be.calledOnce');
  cy.wrap(obj).should('eql', { num: 20 });
});
