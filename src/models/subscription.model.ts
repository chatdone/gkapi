import Stripe from 'stripe';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
} from './company.model';
import { UserId } from './user.model';

export type SubscriptionPackagePublicId = string;
export type SubscriptionPackageId = number;
export type SubscriptionPackagePriceId = number;
export type SubscriptionId = number;
export type SubscriptionPublicId = string;
export type SubscriptionProductId = number;
export type SubscriptionProductPublicId = string;

// FIXME: To be deprecated
export type CompanySubscriptionPublicId = string;
export type CompanySubscriptionId = number;
// --------------------------

// This is camelized data from the Stripe price object
export type SubscriptionPriceModel = {
  id: string;
  active: boolean;
  currency: string;
  product: string;
  recurring: {
    interval: string;
    intervalCount: number;
    trialPeriodDays: number;
  };
  type: string;
  unitAmount: number;
  unitAmountDecimal: string;
};

export type CompanySubscriptionModel = {
  id: number;
  id_text: string;

  company_id: number;
  package_id: number;
  subscription_id: string;
  product_id: string;
  price_id: string;
  package_title: string;
  package_description: string;
  sms_quota: number;
  phone_call_quota: number;
  email_quota: number;
  whatsApp_quota: number; // YES THIS CASE IS CORRECT - TECHIES FAULT
  signature_quota: number;
  price: number;
  interval: string;
  interval_count: number;
  start_date: string;
  end_date: string;
  cancel_date: string;
  status: number;
  active: number;
  item_id: string;
  quantity: number;

  created_at: string;
  updated_at: string;
  deleted_at: string;

  created_by: number;
  updated_by: number;
  deleted_by: number;

  idText: string;

  companyId: number;
  packageId: number;
  subscriptionId: string;
  productId: string;
  priceId: string;
  packageTitle: string;
  packageDescription: string;
  smsQuota: number;
  phoneCallQuota: number;
  emailQuota: number;
  whatsAppQuota: number; // YES THIS CASE IS CORRECT - TECHIES FAULT
  intervalCount: number;
  startDate: string;
  endDate: string;
  cancelDate: string;
  itemId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;

  createdBy: number;
  updatedBy: number;
  deletedBy: number;

  data: SubscriptionPackageModel;
};

export type StripeIdsModel = {
  product_id: string;
};

export interface CompanySubscriptionWithQuotaRefreshModel
  extends CompanySubscriptionModel {
  add_sms: number;
  add_phone: number;
  add_email: number;
  add_whatsapp: number;
}

export interface CompanySubscriptionWithPackageModel
  extends CompanySubscriptionModel {
  title: string;
  type: number;
  description: string;
  storage: string;
  published: boolean;
  slug: string;
}

export type SubscriptionPackageModel = {
  id: number;
  id_text: string;

  product_id: string;
  title: string;
  description: string;
  sms_quota: number;
  phone_call_quota: number;
  email_quota: number;
  whatsapp_quota: number;
  signature_quota: number;
  type: number;
  storage: number;
};

export type SubscriptionPromoCodeModel = {
  id: number;
  subscription_id: number;
  promo_code_id: string;
  code: string;
  percent_off: number;
  amount_off: number;
  created_at: string;
};

export type UpdateSubscriptionQuotaPayload = {
  product_id: string;
  whatsApp_quota: number;
  email_quota: number;
};

export type SubscriptionPackagePriceModel = {
  id: number;
  id_text: string;

  package_id: number;
  stripe_price_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  interval_count: number;
  coupon_id: string;
  coupon_duration: string;
  coupon_currency: string;
  coupon_amount_off: number;
  coupon_percent_off: number;
  active: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  quantity?: number;

  created_by: number;
  updated_by: number;
  deleted_by: number;
};

export type QuotaPayload = {
  email_quota: number;
  whatsApp_quota: number;

  id: number;
};

export type InsertSubscriptionPayload = {
  companyId: CompanyId;
  packageId: SubscriptionPackageId;
  productId: string;
  priceId: string;
  packageTitle: string;
  packageDescription: string;
  smsQuota: number;
  phoneCallQuota: number;
  emailQuota: number;
  whatsAppQuota: number;
  price: number;
  interval: string;
  intervalCount: number;
  startDate: string;
  endDate: string;
  createdBy: UserId;
  packageData: string;
  status: number;
  promo?: StripePromoCodeModel;
};

export type InsertOmniSubscriptionPayload = {
  company_id: CompanyId;
  package_id: SubscriptionPackageId;
  subscription_id: string;
  product_id: string;
  price_id: string;
  package_title: string;
  package_description: string;
  sms_quota: number;
  phone_call_quota: number;
  email_quota: number;
  whatsApp_quota: number;
  price: number;
  interval: string;
  interval_count: number;
  start_date: string;
  end_date: string;
  created_by: UserId;
  data: string;
  status: number;
  promo?: StripePromoCodeModel;
};

export type InsertDedocoSubscriptionPayload = {
  company_id: CompanyId;
  package_id: SubscriptionPackageId;
  product_id: string;
  price_id: string;
  package_title: string;
  item_id: string;
  sms_quota: number;
  phone_call_quota: number;
  email_quota: number;
  whatsApp_quota: number;
  signature_quota: number;
  price: number;
  interval: string;
  interval_count: number;
  start_date: string;
  end_date: string;
  created_by: UserId;
  data: string;
};

export type CreateInsertSubscriptionPayload = {
  price: SubscriptionPackagePriceModel;
  quantity?: number;
  subscriptionPackage: SubscriptionPackageModel;
  endDate: string;
};

export type CreateSubscriptionInput = {
  package_price_id: string;
  quantity: number;
};

export interface PricesWithProductIdModel
  extends SubscriptionPackagePriceModel {
  quantity: number;
  productId: string;
}

export interface DiscountedPriceModel extends PricesWithProductIdModel {
  discounted_price?: number;
  price_per_unit: number;
}

export interface PaymentMethodModel extends Stripe.PaymentMethod {}

export interface StripeInvoiceModel extends Stripe.Invoice {}

export interface StripePromoCodeModel extends Stripe.PromotionCode {}
export interface StripeCouponModel extends Stripe.Coupon {}

export type SubscriptionQuantityResultModel = {
  total: number;
  assigned: number;
  company_members: CompanyMemberModel[];
};

export type SubscriptionQuantityAssignmentModel = {
  subscription_id: SubscriptionId;
  company_member_id: CompanyMemberId;
};

/* NEW MODELS, everything above is legacy */

export type SubscriptionProductModel = {
  id: SubscriptionProductId;
  idText: SubscriptionProductPublicId;
  stripeProductId: string;
  name: string;
  createdBy: UserId;
  updatedBy: UserId;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionModel = {
  id: SubscriptionId;
  stripeSubscriptionId: string;
  packageId: SubscriptionPackageId;
  companyId: CompanyId;
  intervalType: string;
  userQuota: number;
  taskQuota: number;
  invoiceQuota: number;
  reportQuota: number;
  teamQuota: number;
  storageQuota: number;
  createdAt: string;
  updatedAt: string;
  createdBy: CompanyMemberId;
  updatedBy: CompanyMemberId;
  idText: SubscriptionPublicId;
};

export type SubscriptionPackageNewModel = {
  id: number;
  idText: string;
  name: string;
  published: boolean;
  userQuota: number;
  taskQuota: number;
  invoiceQuota: number;
  reportQuota: number;
  teamQuota: number;
  storageQuota: number;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionChangeModel = {
  id: number;
  subscriptionId: SubscriptionId;
  companyId: CompanyId;
  action: string;
  actionData: { packageId: number; packageName: string };
  createdAt: string;
  createdBy: UserId;
  runAt: string;
  completedAt: string;
  completedBy: string;
};
