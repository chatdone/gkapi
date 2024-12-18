import { BillingStore } from '@data-access';
import { BillingService } from '@services';

jest.mock('../../data-access/billing/billing.store');

describe('billing.service.ts', () => {
  describe('getDocNo', () => {
    test('it should return the correct doc no', async () => {
      const projectId = 1;

      (
        BillingStore.getNumberOfBillingInvoicesByCompanyId as jest.Mock
      ).mockResolvedValue(3);

      (BillingStore.getInvoiceStartForCompany as jest.Mock).mockResolvedValue(
        undefined,
      );

      const res = await BillingService.getDocNo(projectId);
      expect(res).toEqual('0000004');
    });

    test('it should return the correct with 100s', async () => {
      const projectId = 1;

      (
        BillingStore.getNumberOfBillingInvoicesByCompanyId as jest.Mock
      ).mockResolvedValue(99);

      (BillingStore.getInvoiceStartForCompany as jest.Mock).mockResolvedValue(
        undefined,
      );

      const res = await BillingService.getDocNo(projectId);
      expect(res).toEqual('0000100');
    });

    test('it should return the correct docNo with invoice start', async () => {
      const projectId = 1;

      (
        BillingStore.getNumberOfBillingInvoicesByCompanyId as jest.Mock
      ).mockResolvedValue(99);

      (BillingStore.getInvoiceStartForCompany as jest.Mock).mockResolvedValue(
        100,
      );

      const res = await BillingService.getDocNo(projectId);
      expect(res).toEqual('200');
    });
  });
});
