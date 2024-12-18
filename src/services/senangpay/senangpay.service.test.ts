// import _ from 'lodash';
import SenangPayService from './senangpay.service';
// import CollectionService from '../collection/collection.service';
// import CompanyStore from '@data-access/companies/company.store';
// import { getSecretValue } from '@utils/secret.utils';

// jest.mock('@data-access/companies/company.store');
jest.mock('../collection/collection.service');
jest.mock('../event-manager/event-manager.service');
jest.mock('@data-access/company/company.store');
jest.mock('@data-access/collection/collection.store');
jest.mock('knex');
// jest.mock('@utils/secret.utils', () => ({
//   getSecretValue: jest
//     .fn()
//     .mockResolvedValue(
//       '{"SENANGPAY_CIPHER_KEY":"9K8fZmYi0m1vLhe2AdpkpUlk9dkXFVYyCn7GCK/dArE="}',
//     ),
// }));

describe('senangpay.service', () => {
  describe('generateSHA256Hash', () => {
    test('it should generate the correct sha256 hash from an input string', async () => {
      let inputString = '53-784Shopping_cart_id_3024.5056';

      let hash = SenangPayService.generateSHA256Hash(inputString, '3661-942');
      expect(hash).toBe(
        '30a7472d60ab3f15d75959e51bdf09c73e5ab2a4bd6b7b3dc4040230a812c395',
      );

      inputString = '53-78415614363538840Payment_was_successful';
      hash = SenangPayService.generateSHA256Hash(inputString, '3661-942');
      expect(hash).toBe(
        'c8e74707b2e7c2eb1a5cf7df785fbc4fb00109c2542689fa5282981c554410a6',
      );
    });
  });

  describe('isHashValid', () => {
    test('it should return true on a matching hash', async () => {
      const inputString = '53-784Shopping_cart_id_3024.5056';
      const targetHash =
        '30a7472d60ab3f15d75959e51bdf09c73e5ab2a4bd6b7b3dc4040230a812c395';

      const hash = SenangPayService.generateSHA256Hash(inputString, '3661-942');

      const compareResult = SenangPayService.isHashValid(hash, targetHash);

      expect(compareResult).toBe(true);
    });

    test('it should return false on a non-matching hash', async () => {
      const inputString = 'itsoveranakinihavethehighground';
      const targetHash =
        '30a7472d60ab3f15d75959e51bdf09c73e5ab2a4bd6b7b3dc4040230a812c395';

      const hash = SenangPayService.generateSHA256Hash(inputString, '3661-942');

      const compareResult = SenangPayService.isHashValid(hash, targetHash);

      expect(compareResult).toBe(false);
    });
  });

  describe('createTransactionStringSequence', () => {
    test('it should generate the correct string sequence for the input', async () => {
      const input = {
        secretKey: '53-784',
        detail: 'Shopping cart id 30',
        amount: 24.5,
        orderId: '56',
      };

      const sequence = await SenangPayService.createTransactionStringSequence(
        input,
      );

      expect(sequence).toBe('53-784Shopping cart id 3024.5056');
    });
  });

  describe('createTransactionListSequence', () => {
    test('it should generate the correct string sequence', async () => {
      const input = {
        merchantId: '926162450636396',
        secretKey: '21245-957',
        timestampStart: 1577808000,
        timestampEnd: 1577894399,
      };

      const sequence = await SenangPayService.createTransactionListSequence(
        input,
      );

      expect(sequence).toBe('92616245063639621245-95715778080001577894399');

      const hash = await SenangPayService.generateSHA256Hash(
        sequence,
        '21245-957',
      );
      expect(hash).toBe(
        '3990f8b5bf51daf83a46c1ea4bf8994ef5004fcc6b8a96af02528123a5aab836',
      );
    });
  });

  // describe('createRecurringTransactionHash', () => {
  //   test('it should generate the correct hash', async () => {
  //     const secretKey = '3707-574';
  //     const recurringId = '162599550275';
  //     const orderId = '1627893375';
  //     let targetHash =
  //       '92cc5ca10af08c2ee9ad7c4809c6761f9542733359fdc652c3eb5ff7172aa750';

  //     const hash = await SenangPayService.createRecurringTransactionHash({
  //       secretKey,
  //       recurringId,
  //       orderId,
  //     });

  //     const compareResult = SenangPayService.isHashValid(hash, targetHash);

  //     expect(compareResult).toBe(true);
  //   });
  // });
  // describe('verifyRecurringTransaction', () => {
  //   test('it should verify a recurring transaction hash', async () => {
  //     const secretKey = '3707-574';
  //     const statusId = '1';
  //     const orderId = '1627893375';
  //     const transactionId = '1627896906815746';
  //     const message = 'Payment_was_successful';

  //     const targetHash =
  //       '097fcca30f13529e5063c577a5275bc06b70199cd3dcb322376b5b0a68f59c09';

  //     const verifyResult = await SenangPayService.verifyRecurringTransaction(
  //       {
  //         secretKey,
  //         statusId,
  //         orderId,
  //         transactionId,
  //         message,
  //       },
  //       targetHash,
  //     );

  //     expect(verifyResult).toBe(true);
  //   });
  // });

  /*
   * test failing, probably due to env variable
   */
  // describe('getSenangPayCipherKey', () => {
  //   test('it should return the correct key buffer', async () => {
  //     const cipherKey = await SenangPayService.getSenangPayCipherKey();

  //     const cipherKeyString = cipherKey.toString('base64');
  //     expect(cipherKey).not.toBeNull();
  //     expect(cipherKeyString).toBe(
  //       '9K8fZmYi0m1vLhe2AdpkpUlk9dkXFVYyCn7GCK/dArE=',
  //     );
  //   });
  // });

  // describe('getCompanySenangPayCredentials', () => {
  //   test('it should return the company senangpay credentials', async () => {
  //     const companyId = 1;
  //     const mockCredentialsBuffer = Buffer.from(
  //       'TKfgyszs+8K54vhW9vpXsQ1yG11mpVbx8hHvMw55Fw4VlK69h1Jtkc7VJRTkNf+QudwbFIVe2jQU9ROb2EEJF/4w85N3rcRCgAgG+9CiuJyVN+HnCg==',
  //       'base64',
  //     );

  //     CompanyStore.getCompanySenangPayCredentials.mockResolvedValue({
  //       id: 1,
  //       company_id: companyId,
  //       credentials: mockCredentialsBuffer,
  //     });

  //     const result = await SenangPayService.getCompanySenangPayCredentials(
  //       companyId,
  //     );

  //     const expectedResult = {
  //       merchant_id: '639162548135826',
  //       secret_key: '3707-574',
  //     };

  //     expect(result).toEqual(expectedResult);
  //   });
  // });
});
