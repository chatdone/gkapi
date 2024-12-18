import { Router, Request, Response } from 'express';

import { downloadInvoice } from '../controllers/billing.controller';

const router = new (Router as any)();

router.get('/invoice/:invoiceId/download', (req: Request, res: Response) => {
  downloadInvoice(req, res);
});

export default router;
