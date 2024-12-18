import { Router, Request, Response } from 'express';

import { downloadTaskAttachment } from '../controllers/task.controller';

const router = new (Router as any)();

router.get(
  '/attachment/:attachmentId/download',
  (req: Request, res: Response) => {
    downloadTaskAttachment(req, res);
  },
);

export default router;
