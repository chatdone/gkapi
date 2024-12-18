import { gql } from 'apollo-server-express';

import _ from 'lodash';

export const schema = gql`
  scalar DateTime

  """
  New subscription type for the new subscription model
  """
  type Subscription {
    id: ID!
    stripeSubscriptionId: String
    package: SubscriptionPackage
    company: Company
    intervalType: SubscriptionPriceInterval

    upcomingChanges: [SubscriptionChange]

    ########## Quota
    userQuota: Int
    taskQuota: Int
    invoiceQuota: Int
    reportQuota: Int
    teamQuota: Int
    """
    In bytes
    """
    storageQuota: Float
    ########## Quota End

    createdAt: DateTime
    updatedAt: DateTime
  }

  """
  Covers new and legacy subscription types. The legacy one goes to 'packages' table while
  the new one goes to the 'subscription_packages' table.
  """
  type SubscriptionPackage {
    id: ID!
    name: String
    products: [SubscriptionProduct]

    """
    Published would be shown on the frontend, unpublished covers custom packages or internal use ones
    """
    published: Boolean
    """
    This indicates which is the free tier package, for the system to know which package to assign to a new company.
    There's no error checking on this, it's up to the admin to make sure there's only one default package.
    """
    isDefault: Boolean
    """
    This indicates whether it's a custom package created by admin
    """
    isCustom: Boolean
    sequence: Int

    ########## Quota
    userQuota: Int
    taskQuota: Int
    invoiceQuota: Int
    reportQuota: Int
    teamQuota: Int
    """
    In bytes
    """
    storageQuota: Float
    ########## Quota End

    """
    Deactivated packages should not be renewed automatically [not implemented yet] and
    cannot be activated on a user's account
    """
    active: Boolean

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: User
    updatedBy: User
  }

  type SubscriptionChange {
    action: String
    actionData: JSON
    runAt: DateTime
  }

  """
  Each product is a module/feature and can be enabled/disabled for a subscription package
  """
  type SubscriptionProduct {
    id: ID!
    name: String
    stripeProductId: String
    createdAt: DateTime
    updatedAt: DateTime
    createdBy: User
    updatedBy: User

    """
    After creating a new price, it takes a few seconds to be available in Stripe, so
    it will not be available in the API until it's available in Stripe
    """
    prices: [SubscriptionPrice]
  }

  """
  This data comes from Stripe and is not stored in DB
  """
  type SubscriptionPrice {
    stripePriceId: String
    stripeProductId: String
    type: String
    amount: Float
    interval: String
    currency: String
  }

  input CreateSubscriptionProductInput {
    name: String!
  }

  input UpdateSubscriptionProductInput {
    name: String!
  }

  input CreateSubscriptionPriceInput {
    productId: String!
    amount: Float!
    interval: SubscriptionPriceInterval
  }

  input StartSubscriptionInput {
    companyId: ID!
    packageId: ID!
    interval: SubscriptionPriceInterval!
  }

  input CreateSubscriptionPackageInput {
    name: String!
    userQuota: Int
    taskQuota: Int
    invoiceQuota: Int
    reportQuota: Int
    teamQuota: Int
    storageQuota: Int
  }

  input UpgradeSubscriptionInput {
    subscriptionId: ID!
    companyId: ID!
    packageId: ID!
    interval: SubscriptionPriceInterval!
  }

  input DowngradeSubscriptionInput {
    subscriptionId: ID!
    companyId: ID!
    packageId: ID!
    interval: SubscriptionPriceInterval!
  }

  input CancelSubscriptionInput {
    subscriptionId: ID!
    companyId: ID!
    reason: String
  }

  input UpdateSubscriptionPackageProductsInput {
    packageId: ID!
    productId: ID!
  }

  input DowngradeSubscriptionPackageProductsInput {
    packageId: ID!
    productId: ID!
  }

  enum SubscriptionPriceInterval {
    MONTH
    YEAR
  }

  extend type Query {
    """
    If you specify an id then it will only return if you are an admin. Otherwise it will return the subscription
    for the currently active company
    """
    subscription(id: ID): Subscription
    """
    This is not implemented yet
    """
    subscriptions(companyId: ID): [Subscription] # TODO: implement this
    subscriptionProduct(productId: ID!): SubscriptionProduct
    subscriptionProducts: [SubscriptionProduct]
    subscriptionPackageV2(packageId: ID!): SubscriptionPackage
    subscriptionPackagesV2(listAll: Boolean): [SubscriptionPackage]
  }

  extend type Mutation {
    # These are admin-only mutations
    createSubscriptionProduct(
      input: CreateSubscriptionProductInput!
    ): SubscriptionProduct
    updateSubscriptionProduct(
      id: ID!
      input: UpdateSubscriptionProductInput!
    ): SubscriptionProduct
    deleteSubscriptionProduct(id: ID!): SubscriptionProduct

    """
    After creating a new price, it takes a few seconds to be available in Stripe, so
    it will not be available in SubscriptionProduct until it's available in Stripe
    """
    createSubscriptionPrice(
      input: CreateSubscriptionPriceInput!
    ): SubscriptionProduct

    """
    Create a product first before creating a package
    """
    createSubscriptionPackage(
      input: CreateSubscriptionPackageInput!
    ): SubscriptionPackage
    addSubscriptionProductToPackage(
      input: UpdateSubscriptionPackageProductsInput!
    ): SubscriptionPackage
    removeSubscriptionProductFromPackage(
      input: UpdateSubscriptionPackageProductsInput!
    ): SubscriptionPackage

    """
    This is the new implementation of creating subscriptions
    """
    startSubscription(input: StartSubscriptionInput!): Subscription

    """
    This is for changing to a higher subscription plan only. Downgrading is done with the downgradeSubscription mutation.
    """
    upgradeSubscription(input: UpgradeSubscriptionInput!): Subscription
    """
    Only for downgrading to a lower subscription plan. If moving to free plan use cancelSubscription.
    """
    downgradeSubscription(input: DowngradeSubscriptionInput!): Subscription
    """
    Cancel subscription in this case means switching to a free plan package but there will still be a subscription
    object available
    """
    cancelSubscriptionV2(input: CancelSubscriptionInput!): Subscription
  }

  # ----------------------------------------
  # ----- BELOW ARE LEGACY TYPES -----
  # ----------------------------------------

  # TODO: DEPRECATE
  type CompanySubscription {
    id: ID!
    price: Float
    interval: String
    status: SubscriptionStatuses
    active: Boolean
    quantity: Int
    type: PackageTypes
    subscriptionPackagePrice: SubscriptionPackagePrice
    whiteListedMembers: SubscriptionQuantityResult
    company: Company
    discount: SubscriptionDiscount
    package: SubscriptionPackage

    stripeSubscriptionId: String
    productId: String
    smsQuota: Int
    phoneCallQuota: Int
    emailQuota: Int
    whatsappQuota: Int
    signatureQuota: Int
    packageTitle: String # This is the title at the time the subscription was made
    packageDescription: String # This is the description at the time the subscription was made
    intervalCount: Int
    startDate: DateTime
    endDate: DateTime
    cancelDate: DateTime
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt: DateTime
    createdBy: User
    updatedBy: User
    deletedBy: User

    stripe_subscription_id: String #deprecated
    product_id: String #deprecated
    sms_quota: Int #deprecated
    phone_call_quota: Int #deprecated
    email_quota: Int #deprecated
    whatsapp_quota: Int #deprecated
    signature_quota: Int #deprecated
    package_title: String #deprecated
    package_description: String #deprecated
    interval_count: Int #deprecated
    start_date: DateTime #deprecated
    end_date: DateTime #deprecated
    cancel_date: DateTime #deprecated
    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
    deleted_at: DateTime #deprecated
    created_by: User #deprecated
    updated_by: User #deprecated
    deleted_by: User #deprecated

    #data: String
  }

  # TODO: DEPRECATE
  extend type SubscriptionPackage {
    title: String
    description: String
    slug: String
    storage: Float
    type: PackageTypes

    productId: String
    smsQuota: Int
    phoneCallQuota: Int
    emailQuota: Int
    whatsappQuota: Int
    signatureQuota: Int
    deletedAt: DateTime
    deletedBy: User
    packagePrices: [SubscriptionPackagePrice]

    product_id: String #deprecated
    sms_quota: Int #deprecated
    phone_call_quota: Int #deprecated
    email_quota: Int #deprecated
    whatsapp_quota: Int #deprecated
    signature_quota: Int #deprecated
    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
    deleted_at: DateTime #deprecated
    created_by: User #deprecated
    updated_by: User #deprecated
    deleted_by: User #deprecated
    package_prices: [SubscriptionPackagePrice] #deprecated
  }

  # TODO: DEPRECATE
  type SubscriptionPackagePrice {
    id: ID!
    package: SubscriptionPackage
    name: String
    description: String
    price: Float
    currency: String
    interval: String
    # There's coupon properties omitted
    active: Boolean

    intervalCount: Int
    stripePriceId: String
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt: DateTime
    createdBy: User
    updatedBy: User
    deletedBy: User

    interval_count: Int #deprecated
    stripe_price_id: String #deprecated
    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
    deleted_at: DateTime #deprecated
    created_by: User #deprecated
    updated_by: User #deprecated
    deleted_by: User #deprecated
  }

  # TODO: DEPRECATE
  type SubscriptionPromoCode {
    id: ID
    subscription: CompanySubscription
    code: String

    promoCodeId: String
    percentOff: Int
    amountOff: Float
    createdAt: DateTime

    promo_code_id: String #deprecated
    percent_off: Int #deprecated
    amount_off: Float #deprecated
    created_at: DateTime #deprecated
  }

  # TODO: DEPRECATE
  type StripeInvoice {
    id: String
    object: String
    attempted: Boolean
    charge: String
    collection_method: String
    created: Int
    currency: String
    customer: String
    number: String
    paid: Boolean
    status: String
    subscription: String
    subtotal: Int
    tax: Int
    total: Int

    accountCountry: String
    accountName: String
    amountDue: Int
    amountPaid: Int
    amountRemaining: Int
    attemptCount: Int
    billingReason: String
    customerAddress: String
    customerEmail: String
    customerName: String
    customerPhone: String
    customerShipping: String
    customerTaxExempt: String
    defaultPaymentMethod: String
    dueDate: String
    endingBalance: Int
    hostedInvoiceUrl: String
    invoicePdf: String
    nextPaymentAttempt: Int
    paymentIntent: String
    periodEnd: Int
    periodStart: Int
    receiptNumber: String
    webhooksDeliveredAt: Int

    account_country: String #deprecated
    account_name: String #deprecated
    amount_due: Int #deprecated
    amount_paid: Int #deprecated
    amount_remaining: Int #deprecated
    attempt_count: Int #deprecated
    billing_reason: String #deprecated
    customer_address: String #deprecated
    customer_email: String #deprecated
    customer_name: String #deprecated
    customer_phone: String #deprecated
    customer_shipping: String #deprecated
    customer_tax_exempt: String #deprecated
    default_payment_method: String #deprecated
    due_date: String #deprecated
    ending_balance: Int #deprecated
    hosted_invoice_url: String #deprecated
    invoice_pdf: String #deprecated
    next_payment_attempt: Int #deprecated
    payment_intent: String #deprecated
    period_end: Int #deprecated
    period_start: Int #deprecated
    receipt_number: String #deprecated
    webhooks_delivered_at: Int #deprecated
  }

  # TODO: DEPRECATE
  type StripePromoCode {
    id: ID
    active: Boolean
    code: String
    coupon: StripeCoupon
    created: Int
    customer: String

    expiresAt: Int
    maxRedemptions: Int
    timesRedeemed: Int

    expires_at: Int #deprecated
    max_redemptions: Int #deprecated
    times_redeemed: Int #deprecated
  }

  # TODO: DEPRECATE
  type StripeCoupon {
    id: ID
    object: String
    created: Int
    currency: String
    duration: String
    metadata: StripeCouponMetaData
    name: String
    valid: Boolean

    amountOff: Float
    maxRedemptions: Int
    percentOff: Float
    redeemBy: Int
    timesRedeemed: Int
    appliesTo: ProductInCoupon

    amount_off: Float #deprecated
    max_redemptions: Int #deprecated
    percent_off: Float #deprecated
    redeem_by: Int #deprecated
    times_redeemed: Int #deprecated
    applies_to: ProductInCoupon #deprecated
  }

  # TODO: DEPRECATE
  type StripeCouponMetaData {
    applicable_products: [ID] #deprecated
    applicableProducts: [ID]
  }

  # TODO: DEPRECATE
  type ProductInCoupon {
    products: [String]
  }

  # TODO: DEPRECATE
  type SubscriptionDiscount {
    id: ID
    customer: String
    start: Int
    subscription: String
    coupon: StripeCoupon
    promotionCode: String
    promotion_code: String #deprecated
  }

  # TODO: DEPRECATE
  type DiscountedPrice {
    id: Int
    package: SubscriptionPackage
    name: String
    description: String
    interval: String
    active: Int
    price: Float
    quantity: Int

    stripePriceId: String
    intervalCount: Int
    discountedPrice: Float
    pricePerUnit: Float

    stripe_price_id: String #deprecated
    interval_count: Int #deprecated
    discounted_price: Float #deprecated
    price_per_unit: Float #deprecated
  }

  # TODO: DEPRECATE
  type SubscriptionQuantityResult {
    total: Int
    assigned: Int
    companyMembers: [CompanyMember]
    company_members: [CompanyMember] #deprecated
  }

  # TODO: DEPRECATE
  input CreateSubscriptionInput {
    quantity: Int
    package_price_id: ID! #deprecated
    packagePriceId: ID #make this as mandatory once V3 is up
  }

  # TODO: DEPRECATE
  input AddPackageInput {
    quantity: Int
    package_price_id: ID! #deprecated
    packagePriceId: ID #make this as mandatory once V3 is up
  }

  # TODO: DEPRECATE
  input SwitchSubscriptionPackageInput {
    quantity: Int
    package_price_id: ID! #deprecated
    packagePriceId: ID #make this as mandatory once V3 is up
  }

  # TODO: DEPRECATE
  enum SubscriptionStatuses {
    ACTIVE
    OVERDUE
    CANCELLED
    INCOMPLETE
    TRIAL
  }

  # TODO: DEPRECATE
  enum PackageTypes {
    BASIC
    TIME_ATTENDANCE
    PROJECT_MANAGEMENT_TOOL
    PAYMENT_COLLECTION_REMINDER
    DEDOCO
    LEGACY
  }

  extend type Query {
    subscription(id: ID!): Subscription

    """
    This query is deprecated. Please use the new query 'subscription' instead.
    """
    companySubscription(subscriptionId: ID!): CompanySubscription
    companySubscriptions(companyId: ID!): [CompanySubscription]
    userSubscriptions: [CompanySubscription]
    subscriptionPackages: [SubscriptionPackage]
    dedocoPackages: [SubscriptionPackage]
    userInvoices: [StripeInvoice]
    subscriptionQuantitiesAssigned(
      stripeProductId: String!
      companyId: ID!
    ): SubscriptionQuantityResult

    promoCodeInfo(
      code: String!
      createSubscriptionInput: [CreateSubscriptionInput]!
    ): [DiscountedPrice]
  }

  extend type Mutation {
    requestSubscription(
      companyId: ID!
      packagePriceId: ID!
      promoCode: String
    ): CompanySubscription
    requestOmniSubscription(
      companyId: ID!
      createSubscriptionInput: [CreateSubscriptionInput]!
      promoCode: String
    ): [CompanySubscription]
    requestTrialOmniSubscription(
      companyId: ID!
      createSubscriptionInput: [CreateSubscriptionInput]!
      trialDays: Int!
    ): [CompanySubscription]
    cancelOmniTrialSubscription(
      companyId: ID!
      companySubscriptionId: ID!
    ): CompanySubscription
    requestDedocoSubscription(
      companyId: ID!
      packagePriceId: ID!
    ): CompanySubscription
    addPackageToSubscription(
      companyId: ID!
      addPackageInput: [AddPackageInput]!
    ): [CompanySubscription]
    removePackagesFromSubscription(
      companyId: ID!
      companySubscriptionIds: [ID]!
    ): [CompanySubscription]
    cancelSubscription(
      companyId: ID!
      companySubscriptionId: ID!
    ): CompanySubscription
    cancelAllSubscriptions(companyId: ID!): [CompanySubscription]
    switchSubscriptionPackage(
      companyId: ID!
      switchSubscriptionPackageInput: SwitchSubscriptionPackageInput!
      companySubscriptionId: ID!
    ): CompanySubscription
    editPackageQuantity(
      companyId: ID!
      companySubscriptionId: ID!
      quantity: Int!
    ): CompanySubscription

    assignSubscriptionQuantityToMember(
      companyMemberId: ID!
      stripeProductId: String!
    ): [CompanyMember]
    removeSubscriptionQuantityFromMember(
      companyMemberId: ID!
      stripeProductId: String!
    ): [CompanyMember]
  }
`;
