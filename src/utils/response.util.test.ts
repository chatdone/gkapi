import { formatResponse } from './response.util';

describe('response.util.js', () => {
  describe('formatResponse', () => {
    test('it should remove the numeric ids and replace with id_text', async () => {
      const payload = {
        id: 1,
        id_bin: Buffer.from('some random id'),
        id_text: 'c0f3743f-e5e8-11eb-8d31-0ac918f2132a',
        name: 'Hololive Friends',
        company_id: 1,
        created_at: '2021-07-15T19:48:59.000Z',
        modified_at: '2021-07-15T19:48:59.000Z',
      };

      const result = formatResponse(payload);
      expect(result).toHaveProperty('id');
      expect(result).not.toHaveProperty('id_bin');
      expect(result).not.toHaveProperty('id_text');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('company_id');
      expect(result.id).toBe('c0f3743f-e5e8-11eb-8d31-0ac918f2132a');
    });

    test('it should omit additional properties if specified', async () => {
      const payload = {
        id: 1,
        id_bin: Buffer.from('some random id'),
        id_text: 'c0f3743f-e5e8-11eb-8d31-0ac918f2132a',
        name: 'Hololive Friends',
        company_id: 1,
        created_at: '2021-07-15T19:48:59.000Z',
        modified_at: '2021-07-15T19:48:59.000Z',
      };
      const result = formatResponse(payload, ['company_id', 'modified_at']);
      expect(result).not.toHaveProperty('company_id');
      expect(result).not.toHaveProperty('modified_at');
      expect(result).toHaveProperty('created_at');
    });
  });
});
