// /* eslint-disable global-require */
import openRoutes from './open.routes';
import commonRoutes from './common.routes';
import devRoutes from './dev.routes';
import dedocoRoutes from './integrations/dedoco.routes';
import senangpayRoutes from './integrations/senangpay.routes';
import collectionRoutes from './collection.routes';
import reportRoutes from './report.routes';
import subscriptionRoutes from './subscription.routes';
import taskRoutes from './task.routes';
import billingRoutes from './billing.routes';

export default (app: any) => {
  app.use('/api/collections', collectionRoutes);
  app.use('/api/reports', reportRoutes);

  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/billing', billingRoutes);
  app.use('/api/integrations/dedoco', dedocoRoutes);
  app.use('/api/integrations/senangpay', senangpayRoutes);
  //   /*
  //    * Private API
  //    */
  //   app.use(
  //     '/api/admin/manage/',
  //     adminAuth,
  //     require('./admin/admin.routes').default
  //   );
  //   app.use(
  //     '/api/admin/users/',
  //     adminAuth,
  //     require('./admin/users.routes').default
  //   );
  //   app.use(
  //     '/api/admin/packages/',
  //     adminAuth,
  //     require('./admin/packages.routes').default
  //   );
  //   app.use(
  //     '/api/admin/companies/',
  //     adminAuth,
  //     require('./admin/companies.routes').default
  //   );
  //   /*
  //    * CLIENT API
  //    */
  //   clientRoutes(app);
  //   /*
  //    * PUBLIC API
  //    */
  //   app.use('/api/auth/', authentication);
  app.use('/api/open/', openRoutes);
  //   /*
  //    * COMMONS API
  //    */
  app.use('/api/commons/', commonRoutes);
  //   app.use('/api/contacts/', auth, contactRoutes);
  //   app.use('/api/collection/', auth, collectionRoutes);
  //   app.use('/api/companies/', auth, companyRoutes);
  //   app.use('/api/subscription/', auth, subscriptionsRoutes);
  //   app.use('/api/notifications/', auth, notificationRoutes);
  //   app.use('/api/packages', auth, packageRoutes);
  //   app.use('/api/url', urlRoutes);
  //   app.use('/api/integrations/dedoco', dedocoRoutes);
  //   app.use('/api/integrations/senangpay', senangpayRoutes);
  if (
    process.env.GK_ENVIRONMENT !== 'production' &&
    process.env.GK_ENVIRONMENT !== 'staging'
  ) {
    app.use('/api/dev/', devRoutes);
  }
};
