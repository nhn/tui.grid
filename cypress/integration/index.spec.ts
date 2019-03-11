import { reactive, watch } from '@/store/reactive';

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

  watch(() => {
    callback1(person.name, book.title);
  });

  watch(() => {
    callback2(person.age, book.author);
  })

  expect(callback1.args[0]).to.eql(['Kim', 'JS Guide']);
  expect(callback2.args[0]).to.eql([20, 'Lee']);

  person.age = 11;
  expect(callback1.args[1]).to.be.undefined;
  expect(callback2.args[1]).to.eql([11, 'Lee']);

  book.title = 'Java Guide';
  expect(callback1.args[1]).to.eql(['Kim', 'Java Guide']);
  expect(callback2.args[2]).to.be.undefined;
});