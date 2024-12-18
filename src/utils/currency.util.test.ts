import { CompanyService } from '@services';
import { getCurrencyCodeByCompanyTimeZone } from './currency.util';

jest.mock('@services');

describe('currency.util.ts', () => {
  describe('getCurrencyCodeByCompanyTimezone', () => {
    test('it should return the code of currency if given a companyId', async () => {
      (CompanyService.getCompanyDefaultTimezone as jest.Mock).mockResolvedValue(
        'Asia/Kuala_Lumpur',
      );

      const res = await getCurrencyCodeByCompanyTimeZone(1);

      expect(res).toEqual('MYR');
    });
  });
});
