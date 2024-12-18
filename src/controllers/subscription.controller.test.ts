import SubscriptionService from '@services/subscription/subscription.service';
jest.mock('@services/subscription/subscription.service');
jest.mock('knex');

describe('subscription.controller.js', () => {
  describe('handleStripeWebhook', () => {
    test('should handle a stripe webhook request', async () => {
      (
        SubscriptionService.handleStripeWebhookEvent as jest.Mock
      ).mockResolvedValue({});
    });
  });
});
