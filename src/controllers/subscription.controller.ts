import { StatusCodes } from 'http-status-codes';
import express from 'express';
import dotenv from 'dotenv';
import {
  CompanyService,
  EventManagerService,
  StripeService,
  SubscriptionService,
} from '@services';
dotenv.config();
import Stripe from 'stripe';
import { CompanyStore } from '@data-access';
import { CompanyModel } from '@models/company.model';

export const stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
  apiVersion: '2020-08-27',
});

const handleStripeWebhook = async (
  req: express.Request,
  res: express.Response,
): Promise<void> => {
  try {
    console.log('trigger');
    const event = res.locals.stripeEvent as Stripe.Event;
    const result = await SubscriptionService.handleStripeWebhookEvent(event);
    if (result) {
      res.sendStatus(StatusCodes.OK);
    } else {
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }

    console.log(event);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error });
  }
};

const createStripeCustomer = async (
  req: express.Request,
  res: express.Response,
): Promise<any> => {
  try {
    const { email } = req.body;
    const customer = await stripe.customers.create({
      email: email,
      description: 'Testing creating customer',
    });
    console.log(customer);
    return res.status(StatusCodes.OK).json(customer);
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error });
  }
};

const getStripeCustomer = async (
  req: express.Request,
  res: express.Response,
): Promise<any> => {
  try {
    const customer = await stripe.customers.create({
      email: 'stripe_cust@gmail.com',
      description: 'Testing creating customer',
    });
    console.log(customer);
    return res.status(StatusCodes.OK).json(customer);
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error });
  }
};

const handleStripeFailWebhook = async (
  req: express.Request,
  res: express.Response,
): Promise<void> => {
  try {
    const event = res.locals.stripeEvent as Stripe.Event;
    const result = await SubscriptionService.handleStripeWebhookEvent(event);
    if (result) {
      res.sendStatus(StatusCodes.OK);
    } else {
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
    if (
      event.type === 'charge.failed'
      //  ||
      // event.type === 'invoice.payment_failed' ||
      // event.type === 'payment_intent.payment_failed'
    ) {
      // @ts-ignore
      const customerId = event.data.object.customer;

      // get company by stripe customer id
      const company = (await CompanyStore.getCompanyByStripeCusId(
        customerId,
      )) as CompanyModel;

      await EventManagerService.notifySubscriptionFailed({
        company,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error });
  }
};

export default {
  handleStripeWebhook,
  createStripeCustomer,
  handleStripeFailWebhook,
};
