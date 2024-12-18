import { camelize } from './utils';

describe('utils.ts', () => {
  describe('camelize', () => {
    test('it should return both camelCase and snake_case', async () => {
      const mockData = { foo_bar: 'fb' };

      const res = camelize(mockData);

      expect(res).toEqual({ fooBar: 'fb', foo_bar: 'fb' });
    });

    test('it should return undefined if mockData is undefined', async () => {
      const mockData = undefined;

      const res = camelize(mockData);

      expect(res).toEqual(undefined);
    });

    test('it should return both camelCase and snake_case in an array', async () => {
      const mockData = [{ foo_bar: 'fb' }, { fu_pa: 'fp' }];

      const res = camelize(mockData);

      expect(res).toHaveLength(2);
      expect(res).toEqual(
        expect.arrayContaining([
          { fooBar: 'fb', foo_bar: 'fb' },
          { fuPa: 'fp', fu_pa: 'fp' },
        ]),
      );
    });

    test('it should return empty array if array data is undefined', async () => {
      const mockData = [undefined];

      const res = camelize(mockData);

      expect(res).toHaveLength(0);
      expect(res).toEqual(expect.arrayContaining([]));
    });

    test('it should return an array and filter out empty object', async () => {
      const mockData = [undefined, { foo_bar: 'fb' }];

      const res = camelize(mockData);

      expect(res).toHaveLength(1);
      expect(res).toEqual(
        expect.arrayContaining([{ foo_bar: 'fb', fooBar: 'fb' }]),
      );
    });

    test('it should return a number as it is without camelizing anything', async () => {
      const mockData = 69;

      const res = camelize(mockData);
      expect(res).toEqual(69);
    });
  });
});
