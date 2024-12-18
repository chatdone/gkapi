import {
  downloadFileRequest,
  sentryToSlack,
} from '@controllers/common.controller';
import { Router, Request, Response, NextFunction } from 'express';
// import * as controller from '../controllers/commons.controller';

//DEPRECATED 11NOV
const router = new (Router as any)();
router.get('/download', (req: Request, res: Response, next: NextFunction) => {
  downloadFileRequest(req, res, next, false);
});

router.post('/sentry-webhook', sentryToSlack);
// router.get('/constants', controller.getConstants);
// router.post('/field/validation', controller.uniqueFieldValidation);
// router.get('/download', downloadFileRequest);
// router.post('/phone-number/validation', controller.validateMalaysiaPhoneNumber);

export default router;
