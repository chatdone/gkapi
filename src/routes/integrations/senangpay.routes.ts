import { CollectionController, SenangPayController } from '@controllers';
import express from 'express';
import dotenv from 'dotenv';
import { SenangPayService } from '@services';
dotenv.config();

const router = express.Router();

router.post('/login', SenangPayController.login);
router.post('/payment', SenangPayController.initiatePayment);
router.post('/payment-complete', SenangPayController.transactionComplete);
router.post('/webhook-recurring', SenangPayController.webhookRecurring);
router.post('/webhook', SenangPayController.webhookRecurring);

if (
  process.env.GK_ENVIRONMENT === 'sandbox' ||
  process.env.GK_ENVIRONMENT === 'development'
) {
  router.post(
    '/test-send-senangpay/:id',
    CollectionController.testSendPaymentLink,
  );

  router.get('/get-company-credentials/:companyId', async (req, res) => {
    try {
      const result = await SenangPayService.getCompanySenangPayCredentials(
        parseInt(req.params.companyId, 10),
      );

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error });
    }
  });

  router.post('/update-company-credentials', async (req, res) => {
    try {
      const result = await SenangPayService.updateCompanySenangPayCredentials({
        companyId: req.body.company_id,
        credentialData: req.body.credentials,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error });
    }
  });
}

export default router;
