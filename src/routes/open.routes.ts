import emailController from '@controllers/email.controller';
import express from 'express';
// import * as controller from '@controllers/open.controller';
import multer from 'multer';
const upload = multer();

const router = express.Router();

// router.post(
//   '/stripe/subscriptions/updated',
//   controller.stripeSubscriptionStateUpdated
// );
// router.post('/sendgrid/webhook', controller.sendgridWebhook);
router.post(
  '/sendgrid/webhook/parse',
  upload.any(),
  emailController.parseIncomingEmail,
);
router.get('/sendgrid/webhook/convert', emailController.convertEmail);

router.get(
  '/hello',
  async (req: express.Request, res: express.Response): Promise<void> => {
    res.status(200).json({ hello: 'GoKudos' });
  },
);

/* This is a temp endpoint for technical interviews, it will be removed after done -Enoch */
router.get(
  '/groceries',
  async (req: express.Request, res: express.Response): Promise<void> => {
    res.status(200).json({
      items: [
        { name: 'Milk', quantity: 2 },
        { name: 'Apples', quantity: 1 },
        { name: 'Tofu', quantity: 4 },
        { name: 'Beans', quantity: 3 },
        { name: 'Pasta', quantity: 5 },
      ],
    });
  },
);

// router.post('/twilio/webhook', controller.twilioWebhook);
// router.get('/health', controller.healthCheck);
// router.get('/email-test', controller.emailTest);

// router.get('/hash-test', controller.hashTest);

export default router;
