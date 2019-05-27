import { notify, reactive, watch } from '@/helper/reactive';

it('watch() should invoke callback function whenever related props changed', () => {
  const person = reactive({
    name: 'Kim',
    age: 20
  });

  const book = reactive({
    title: 'JS Guide',
    author: 'Lee'
  });

  const callback1 = cy.stub();
  const callback2 = cy.stub();
  watch(() => callback1(person.name, book.title));
  watch(() => callback2(person.age, book.author));

  // invoke callback function immediately
  expect(callback1).to.be.calledWith('Kim', 'JS Guide');
  expect(callback2).to.be.calledWith(20, 'Lee');

  callback1.reset();
  callback2.reset();

  person.age = 11;
  expect(callback1).not.to.be.called;
  expect(callback2).to.be.calledWith(11, 'Lee');

  callback1.reset();
  callback2.reset();

  book.title = 'Java Guide';
  expect(callback1).to.be.calledWith('Kim', 'Java Guide');
  expect(callback2).not.to.be.called;
});

it('computed (getter) property and watch', () => {
  const person = reactive({
    p1: '1',
    get p2() {
      return `${this.p1}2`;
    },
    get p3() {
      return `${this.p2}3`;
    }
  });

  expect(person.p2).to.eql('12');
  expect(person.p3).to.eql('123');

  const callback2 = cy.stub();
  const callback3 = cy.stub();
  watch(() => callback2(person.p2));
  watch(() => callback3(person.p3));

  expect(callback2).to.be.calledWith('12');
  expect(callback3).to.be.calledWith('123');

  callback2.reset();
  callback3.reset();

  person.p1 = 'A';
  expect(callback2).to.be.calledWith('A2');
  expect(callback3).to.be.calledWith('A23');

  expect(person.p2).to.eql('A2');
  expect(person.p3).to.eql('A23');
});

it('watch returns a function which stops watching', () => {
  const person = reactive({
    p1: '1',
    get p2() {
      return `${this.p1}2`;
    },
    get p3() {
      return `${this.p2}3`;
    }
  });

  const callback1 = cy.stub();
  const callback2 = cy.stub();
  const callback3 = cy.stub();

  const unwatch1 = watch(() => callback1(person.p1));
  const unwatch2 = watch(() => callback2(person.p2));
  const unwatch3 = watch(() => callback3(person.p3));
  unwatch1();
  unwatch2();
  unwatch3();

  person.p1 = 'A';

  expect(callback1).to.be.calledOnce;
  expect(callback2).to.be.calledOnce;
  expect(callback3).to.be.calledOnce;
});

it('array index property cannot be reactive', () => {
  expect(() => {
    reactive([1, 2, 3]);
  }).to.throw(Error, 'Array object cannot be Reactive');
});

it('notify methods should invoke watching functions', () => {
  const person = reactive({
    p1: '1',
    get p2() {
      return `${this.p1}2`;
    }
  });

  const callback1 = cy.stub();
  const callback2 = cy.stub();

  watch(() => callback1(person.p1));
  watch(() => callback2(person.p2));

  callback1.reset();
  notify(person, 'p1');
  expect(callback1).to.be.calledWith('1');

  callback2.reset();
  notify(person, 'p2');
  expect(callback2).to.be.calledWith('12');
});

it('watch should react to conditional logic', () => {
  const person = reactive({
    flag: false,
    name: 'Kim'
  });

  const callback = cy.stub();
  watch(() => {
    if (person.flag) {
      callback(person.name);
    }
  });

  person.flag = true;

  callback.reset();

  person.name = 'Lee';

  expect(callback).to.be.calledWith('Lee');
});

it('recursive watches should work properly with dynamic watch', () => {
  const callback1 = cy.stub();
  const callback2 = cy.stub();
  const callback3 = cy.stub();

  const obj1 = reactive({ num: 0 });
  const obj2 = reactive({ num: 0 });
  const obj3 = reactive({ num: 0 });

  watch(() => {
    callback1(obj1.num);
  });

  watch(() => {
    // This is recursive call (trigger callback2);
    obj2.num = obj1.num + 10;
    if (obj1.num === 0) {
      callback1(obj1.num);
    } else {
      // This is dynamic watch (should add watch for obj3.num)
      callback3(obj3.num);
    }
  });

  watch(() => {
    callback2(obj2.num);
  });

  callback1.reset();
  callback2.reset();
  callback3.reset();

  obj1.num = 10;

  expect(callback1).to.be.calledWith(10);
  expect(callback2).to.be.calledWith(20);
  expect(callback3).to.be.calledWith(0);

  callback3.reset();

  obj3.num = 10;

  expect(callback3).to.be.calledWith(10);
});
