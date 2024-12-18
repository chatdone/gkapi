import { CompanyId, CompanyPublicId } from './company.model';

export type UserPublicId = string;
export type UserId = number;

export type UserModelUpdated = {
  id: UserId;
  idText: UserPublicId;
  name: string;
  email: string;
};

export type UserModel = {
  id: number;
  idText: UserPublicId;
  customerId: string; // to be deprecated with new sub system, stripe customer id

  id_text: string;
  name: string;
  email: string;
  password: string;
  contact_no: string;
  profile_image: string;
  profile_image_size: number;
  last_login: string;
  active: number;
  view_notification_at: string;

  auth0_id: string | null;
  customer_id: string; // Stripe customer id
  payment_method_id: string;
  last_active_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  signup_data: UserSignUpDataModel;

  created_by: number;
  updated_by: number;
  deleted_by: number;
  tooltips_status: string;

  /** These are inserted in the auth context ONLY **/
  activeCompany?: CompanyId | null;
  company_uuids?: CompanyPublicId[];
  company_ids?: CompanyId[];
  companyUuids?: CompanyPublicId[];
  companyIds?: CompanyId[];
  /** ****/

  facebook_id: string; // DEPRECATED
  google_id: string; // DEPRECATED
  linkedin_id: string; // DEPRECATED

  refresh_token: string; // DEPRECATED
  reset_token_validity: string; // DEPRECATED
  email_verified: number; // DEPRECATED
  email_verification_code: string; // DEPRECATED
  email_auth: number; // DEPRECATED
  registered: number; // DEPRECATED
  reset_token: string; // DEPRECATED
};

export type UserSignUpDataModel = {
  trial: boolean;
  packageIds: number[];
};

export type Auth0TokenPayload = {
  nickname: string;
  name: string;
  picture: string;
  updated_at: string;
  email: string;
  email_verified: boolean;
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  at_hash: string;
  nonce: string;
};

export type CreateUserPayload = {
  email: string;
  name?: string;
  profile_image?: string;
  email_verified?: boolean;
  auth0_id?: string;
  created_by?: UserId;
  last_login?: string;
  active?: number;
  signup_data?: string;
};

export type UserSettingsModel = {
  user_id: UserId;
  default_company_id: CompanyId;
  default_timezone: string;
  expo_push_tokens: string;
};

/* NOTE: IMPORTANT - Remember to update the graphql resolvers
 * Joi validation when changing this model
 */
export type UserViewOptionsModel = {
  homePageMode?: string;
};

/* NOTE: IMPORTANT - Remember to update the graphql resolvers
 * Joi validation when changing this model
 */
export type UserOnboardingModel = {
  hasCompletedOnboarding?: boolean;
  hasCompletedTutorial?: boolean;
};

export type UserSignUpDataPayload = {
  trial: boolean;
  packageIds: number[];
};

export type RequestAccountDeletionResponse = {
  success: boolean;
  message: string;
};
