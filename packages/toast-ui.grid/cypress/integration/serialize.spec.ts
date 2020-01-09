import { serialize } from '@/dataSource/ajax/serializer';

it('test', () => {
  const obj = {
    a: 1,
    b: [1, 2, 3],
    c: {
      d: 'data'
    },
    e: [
      {
        f: 'nested data'
      }
    ],
    k: null,
    p: [1, [['2 ']]]
  };
  const serialized = serialize(obj);
  expect(serialized).to.eq(Cypress.$.param(obj));
});
