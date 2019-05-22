import { reactive, watch } from '@/helper/reactive';

it('reactive() and watch()', () => {
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

  expect(callback1).to.be.calledWith('Kim', 'JS Guide');
  expect(callback2).to.be.calledWith(20, 'Lee');

  person.age = 11;
  expect(callback1.args[1]).to.be.undefined;
  expect(callback2.args[1]).to.eql([11, 'Lee']);

  book.title = 'Java Guide';
  expect(callback1.args[1]).to.eql(['Kim', 'Java Guide']);
  expect(callback2.args[2]).to.be.undefined;
});

it('array index property should not be reactive', () => {
  const numbers = reactive([1, 2, 3]);
  const callback = cy.stub();

  watch(() => callback(numbers[0]));
  numbers[0] = 10;

  expect(callback).to.be.calledOnce;
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

  person.p1 = 'A';
  expect(callback2.args.length).to.be.eql(2);
  expect(callback3.args.length).to.be.eql(2);

  expect(callback2.args[1]).to.be.eql(['A2']);
  expect(callback3.args[1]).to.be.eql(['A23']);

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
