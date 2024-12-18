import { parseMoney } from './util';

describe('util.js', () => {
  describe('parseMoney', () => {
    test('it should parse number to currency format', async () => {
      const res = parseMoney(65);

      expect(res).toEqual('65.00');
    });
  });
});
