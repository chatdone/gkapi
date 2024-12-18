import express, { Request, Response } from 'express';
import { CollectionController } from '@controllers/index';

const { downloadInvoice, downloadPaymentReceipt, downloadPaymentProof } =
  CollectionController;

const router = express.Router();

router.get('/invoice/:collectionId/download', (req: Request, res: Response) => {
  downloadInvoice(req, res);
});

router.get(
  '/payment-receipt/:collectionPaymentId/download',
  (req: Request, res: Response) => {
    downloadPaymentReceipt(req, res);
  },
);
router.get(
  '/payment-proof/:collectionPaymentId/download',
  (req: Request, res: Response) => {
    downloadPaymentProof(req, res);
  },
);

export default router;
