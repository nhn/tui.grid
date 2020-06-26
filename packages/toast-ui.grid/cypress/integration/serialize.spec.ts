import { serialize } from '@/dataSource/ajax/serializer';

function encode(target: string) {
  return target.replace(/\[|\]/g, (param: string) => encodeURIComponent(param));
}

describe('serialize array format', () => {
  it('basic array format is bracket format', () => {
    const obj = { a: [1, 2, 3] };
    const serialized = serialize(obj);
    const encoded = encode('a[]=1&a[]=2&a[]=3');

    expect(serialized).eq(encoded);
  });

  it('nested array format is mixed by indice and bracket format', () => {
    const obj = { a: [[1], 2] };
    const serialized = serialize(obj);
    const encoded = encode('a[0][]=1&a[]=2');

    expect(serialized).eq(encoded);
  });
});

describe('serialize object format', () => {
  it('basic object format is bracket format', () => {
    const obj = {
      a: {
        b: 1,
        c: { nested: 2 },
      },
    };
    const serialized = serialize(obj);
    const encoded = encode('a[b]=1&a[c][nested]=2');

    expect(serialized).eq(encoded);
  });
});

it('null or undfined value is replaced to empty string', () => {
  // eslint-disable-next-line
  const obj = { a: null, b: undefined };
  const serialized = serialize(obj);
  const encoded = encode('a=&b=');

  expect(serialized).eq(encoded);
});
