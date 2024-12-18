export type CompanyDbModel = {
  id: number;
  id_text: string;
  user_id: number;
  name: string;
  description: string;
  account_code: string;
  logo_url: string;
  logo_size: number;
  invitation_code: string;
  invitation_validity: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  phone_call_enabled: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  idle_timing: number;
  settings: unknown; // JSON or null
  slug: string;
};

export type WorkspaceDbModel = {
  id: number;
  id_text: string;
  name: string;
  bg_color: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  company_id: number;
};

export type ProjectDbModel = {
  id: number;
  id_text: string;
  company_id: number;
  contact_id: number;
  team_id: number;
  type: 'Internal' | 'Collaboration' | 'Personal';
  category: number;
  name: string;
  description: string;
  comment: string;
  color: string;
  associate_by: number;
  status: number;
  slug: string;
  archived: boolean;
  visibility: number;
  folder_id: number;
  pinned: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
};

export type ProjectTemplateDbModel = {
  id: number;
  name: string;
  description: string;
  company_id: number;
  id_text: string;
};

export type ProjectSettingsDbModel = {
  project_id: number;
  columns: string;
};

export type ProjectStatusDbModel = {
  id: number;
  project_id: number;
  color: string;
  name: string;
  sequence: number;
  notify: number;
  id_text: string;
};

export type ProjectTemplateStatusDbModel = {
  id: number;
  template_id: number;
  color: string;
  name: string;
  notify: number;
  id_text: string;
};

export type UserDbModel = {
  id: number;
  id_text: string;
  email: string;
  password: string;
  name: string;
  contact_no: string;
  profile_image: string;
  profile_image_size: string;
  last_login: string;
  active: number;
  email_verified: number;
  last_active_at: string;

  customer_id: string;
  payment_method_id: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  signup_data: { [key: string]: any };
  tooltips_status: { [key: string]: any };
};

export type TaskKanbanPositionDbModel = {
  taskId: number;
  posY: number;
};

export type ProjectGroupDbModel = {
  id: number;
  name: string;
  projectId: number;
};

export type SubscriptionProductDbModel = {
  id: number;
  id_text: string;
  name: string;
  stripe_product_id: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
};

export type CompanyPaymentMethodDbModel = {
  id: number;
  company_id: number;
  user_id: number;
  stripe_customer_id: string;
  stripe_payment_method_id: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
};

export type SubscriptionDbModel = {
  id: number;
  id_text: string;
  stripe_subscription_id: string | null;
  interval_type: string;
  user_quota: number;
  task_quota: number;
  invoice_quota: number;
  report_quota: number;
  team_quota: number;
  storage_quota: number;
  package_id: number;
  company_id: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
};

export type SubscriptionPackageDbModel = {
  id: number;
  id_text: string;
  name: string;
  sequence: number;
  is_default: boolean;
  is_custom: boolean;
  published: boolean;
  user_quota: number;
  task_quota: number;
  invoice_quota: number;
  report_quota: number;
  team_quota: number;
  storage_quota: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
};

export type SubscriptionChangeDbModel = {
  id: number;
  subscription_id: string;
  action: string;
  action_data: { [key: string]: any };
  created_at: string;
  created_by: number;
  run_at: string;
  completed_at: string;
  completed_by: string; // is a string because it could be a user or a system
};
