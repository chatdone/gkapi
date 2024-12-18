import { gql } from 'apollo-server-express';

export const schema = gql`
  scalar JSON

  type User {
    id: String
    email: String
    name: String
    active: Boolean
    registered: Boolean
    companies: [Company]
    defaultCompany: Company
    defaultTimezone: String
    contactNo: String
    profileImage: String
    profileImages: ImageGroup
    profileImageSize: Float
    lastLogin: DateTime
    refreshToken: String
    resetTokenValidity: DateTime
    emailVerified: Boolean
    emailVerificationCode: String
    emailAuth: Boolean
    viewNotificationAt: DateTime
    resetToken: String
    facebookId: String
    googleId: String
    linkedinId: String
    customerId: String
    paymentMethodId: String
    paymentMethods: [PaymentMethod]
    stripeCustomerDetails: StripeCustomerDetails
    lastActiveAt: DateTime
    createdBy: User
    updatedBy: User
    deletedBy: User
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt: DateTime
    auth0Id: String
    tooltipsStatus: ToolTipsStatus
    signUpData: JSON

    viewOptions: JSON
    onboarding: JSON

    default_company: Company # deprecated
    default_timezone: String # deprecated
    contact_no: String # deprecated
    profile_image: String # deprecated
    last_login: DateTime # deprecated
    refresh_token: String # deprecated
    reset_token_validity: DateTime # deprecated
    email_verified: Boolean # deprecated
    email_verification_code: String # deprecated
    email_auth: Boolean # deprecated
    view_notification_at: DateTime # deprecated
    reset_token: String # deprecated
    facebook_id: String # deprecated
    google_id: String # deprecated
    linkedin_id: String # deprecated
    customer_id: String # deprecated
    payment_method_id: String # deprecated
    payment_methods: [PaymentMethod] # deprecated
    last_active_at: DateTime # deprecated
    created_by: User # deprecated
    updated_by: User # deprecated
    deleted_by: User # deprecated
    created_at: DateTime # deprecated
    updated_at: DateTime # deprecated
    deleted_at: DateTime # deprecated
    auth0_id: String # deprecated
    tooltips_status: ToolTipsStatus # deprecated
  }

  type StripeCustomerDetails {
    id: String
    default_currency: String
  }

  type ToolTipsStatus {
    INITIAL: Boolean
    CREATE_COMPANY: Boolean
    EDIT_COMPANY: Boolean
    ADD_COMPANY_MEMBERS: Boolean
    ADD_COMPANY_TEAM: Boolean
    EDIT_COMPANY_TEAM: Boolean
    SETUP_PAYMENT_DETAILS: Boolean
    SUBSCRIBE_PACKAGE: Boolean
    ADD_CONTACT_GROUP: Boolean
    ADD_CONTACT: Boolean
    SWITCH_CONTACT_GROUP_TAB: Boolean
    ASSIGN_CONTACT_GROUP_FOR_CONTACT: Boolean
    VIEW_CONTACT_DETAIL: Boolean
    ADD_INTERNAL_TASK_BOARD: Boolean
    ADD_TASK_BOARD_TEAM: Boolean
    ADD_TASK: Boolean
    EDIT_TASK: Boolean
    TASK_VIEW_MODE: Boolean
    TASK_SHARED_WITH_ME: Boolean
    ADD_CLIENT_COLLECTOR: Boolean
    CREATE_COLLECTION: Boolean
    VIEW_COLLECTION: Boolean
    COLLECTION_LIST_VIEW_TYPE_AND_STATUS_SORTING: Boolean
    PAYMENTS_PAGE: Boolean
  }

  input UpdateToolTipsStatusInput {
    INITIAL: Boolean
    CREATE_COMPANY: Boolean
    EDIT_COMPANY: Boolean
    ADD_COMPANY_MEMBERS: Boolean
    ADD_COMPANY_TEAM: Boolean
    EDIT_COMPANY_TEAM: Boolean
    SETUP_PAYMENT_DETAILS: Boolean
    SUBSCRIBE_PACKAGE: Boolean
    ADD_CONTACT_GROUP: Boolean
    ADD_CONTACT: Boolean
    SWITCH_CONTACT_GROUP_TAB: Boolean
    ASSIGN_CONTACT_GROUP_FOR_CONTACT: Boolean
    VIEW_CONTACT_DETAIL: Boolean
    ADD_INTERNAL_TASK_BOARD: Boolean
    ADD_TASK_BOARD_TEAM: Boolean
    ADD_TASK: Boolean
    EDIT_TASK: Boolean
    TASK_VIEW_MODE: Boolean
    TASK_SHARED_WITH_ME: Boolean
    ADD_CLIENT_COLLECTOR: Boolean
    CREATE_COLLECTION: Boolean
    VIEW_COLLECTION: Boolean
    COLLECTION_LIST_VIEW_TYPE_AND_STATUS_SORTING: Boolean
    PAYMENTS_PAGE: Boolean
  }

  type PaymentMethod {
    id: String!
    card: PaymentMethodCard
    created: Int
    customer: String
    type: String
  }

  type PaymentMethodCard {
    brand: String
    country: String
    last4: String
    expMonth: Int
    expYear: Int

    exp_month: Int #deprecated
    exp_year: Int #deprecated
  }

  type RequestAccountDeletionResponse {
    success: Boolean
    message: String
  }

  input UpdateUserNameInput {
    name: String!
  }

  input UpdateProfileInput {
    name: String
    email: String
    contactNo: String
    profileImage: String
    contact_no: String #deprecated
    profile_image: String #deprecated
  }

  input RequestAccountDeletionInput {
    reason: String!
    alternateEmail: String
  }

  extend type Query {
    currentUser: User
    user(id: ID!): User

    redisTest: [String]

    me: User
  }

  extend type Mutation {
    loginUser: User
    updateProfile(input: UpdateProfileInput!): User
    attachPaymentMethod(paymentMethodId: String!): User
    updatePaymentMethodId(paymentMethodId: String!): User
    detachPaymentMethod(paymentMethodId: String!, companyId: String!): User
    uploadProfileImage(attachment: Upload!): User
    updateToolTipsStatus(input: UpdateToolTipsStatusInput!): User
    setDefaultCompany(companyId: ID): User
    setDefaultUserTimezone(timezone: String!): User
    addExpoPushToken(token: String!): User
    removeExpoPushToken(token: String!): User

    updateUserViewOptions(payload: JSON): User
    updateUserOnboarding(payload: JSON): User

    requestAccountDeletion(
      input: RequestAccountDeletionInput!
    ): RequestAccountDeletionResponse
  }
`;
