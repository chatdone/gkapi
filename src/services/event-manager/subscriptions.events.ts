import { CompanyStore } from '@data-access';
import { CompanyId, CompanyModel } from '@models/company.model';
import { SubscriptionModel } from '@models/subscription.model';
import { UserModel } from '@models/user.model';
import { CompanyService, EmailService, EventManagerService } from '@services';
import { parseMoney } from '@services/collection/util';
import {
  SUBSCRIPTION_FAILED,
  SUBSCRIPTION_SUCCESS,
} from '@tools/email-templates';

const notifySubscriptionStart = async (input: {
  subscription: SubscriptionModel;
  companyId: CompanyId;
  userPayer: UserModel;
  subscriptionAmount: number;
}): Promise<void> => {
  try {
    const { companyId, userPayer, subscriptionAmount } = input;

    const company = (await CompanyStore.getCompaniesById(
      companyId,
    )) as CompanyModel;

    const option = await EventManagerService.createEmailOption({
      email: userPayer.email,
      receiverName: userPayer?.name || userPayer?.email,
      templateId: SUBSCRIPTION_SUCCESS,
      companyLogoUrl: company.logoUrl,
      companyName: company?.name,
      subscriptionAmount: `RM${parseMoney(subscriptionAmount / 100)}`,
    });
    await EmailService.sendEmail(option);
  } catch (error) {
    console.error(error);
  }
};

const notifySubscriptionFailed = async (input: { company: any }) => {
  try {
    const { company } = input;

    const admins = (await CompanyStore.getCompanyAdmins(
      company.id,
    )) as UserModel[];

    const adminsAndGkPeople = [
      { email: 'gerard@6biz.ai', name: 'Gerard' },
      { email: 'woon@6biz.ai', name: 'Woon' },
      ...admins,
    ];

    for (const admin of adminsAndGkPeople) {
      const option = await EventManagerService.createEmailOption({
        email: admin?.email,
        receiverName: admin?.name || admin?.email,
        templateId: SUBSCRIPTION_FAILED,
        companyLogoUrl: company?.logoUrl,
        companyName: company?.name,
      });

      await EmailService.sendEmail(option);
    }
  } catch (error) {
    console.error(error);
  }
};

export { notifySubscriptionStart, notifySubscriptionFailed };
