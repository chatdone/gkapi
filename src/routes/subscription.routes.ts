import express from 'express';

import { SubscriptionController } from '@controllers';
import { StripeService } from '@services';
import Stripe from 'stripe';

const router = express.Router();

export interface RequestWithRawBody extends express.Request {
  rawBody?: string | undefined;
}

const stripeAuth = async (
  req: RequestWithRawBody,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'development'
  ) {
    res.locals.stripeEvent = req.body;
  } else {
    try {
      const sig = req.headers['stripe-signature'] || '';
      const event = await StripeService.constructEvent(
        req.rawBody as string,
        sig,
      );
      // TODO: move to logger w/ cloudwatch
      // console.log('============ STRIPE EVENT BEGIN ===========');
      // console.log(event);
      // console.log('============ STRIPE EVENT END ===========');

      res.locals.stripeEvent = event;
    } catch (err) {
      console.log(err);
      // @ts-ignore
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  next();
};

router.post(
  '/stripe-webhook',
  express.raw({ type: 'application/json' }),
  stripeAuth,
  SubscriptionController.handleStripeWebhook,
);

router.post(
  '/stripe-fail',
  express.raw({ type: 'application/json' }),
  stripeAuth,
  SubscriptionController.handleStripeFailWebhook,
);

router.post('/customer', SubscriptionController.createStripeCustomer);

export default router;
