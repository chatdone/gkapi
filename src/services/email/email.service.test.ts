import { EmailService } from '@services';

describe('email.service', () => {
  describe('parseSenangPayTo', () => {
    test('it should parse incoming SenangPay email', async () => {
      const mockInput =
        '"senangpay+ritzza-at-tymbaedu-dot-com@parse.gokudos.io" <senangpay+ritzza-at-tymbaedu-dot-com@parse.gokudos.io>';

      const result = EmailService.parseSenangPayTo(mockInput);
      expect(result).toEqual('ritzza@tymbaedu.com');
    });
  });
});
