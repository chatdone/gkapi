import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import {
  CompanyDbModel,
  CompanyPaymentMethodDbModel,
  SubscriptionDbModel,
  SubscriptionProductDbModel,
  WorkspaceDbModel,
} from '../types';

dayjs.extend(advancedFormat);

const companyDbModel = (): CompanyDbModel => {
  return {
    id: faker.datatype.number(),
    id_text: faker.datatype.uuid(),
    user_id: faker.datatype.number(),
    name: faker.random.words(),
    description: faker.random.words(),
    account_code: faker.datatype.string(),
    logo_url: faker.internet.url(),
    logo_size: faker.datatype.number(),
    invitation_code: faker.datatype.string(),
    invitation_validity: faker.date.recent().toString(),
    email_enabled: faker.datatype.boolean(),
    sms_enabled: faker.datatype.boolean(),
    whatsapp_enabled: faker.datatype.boolean(),
    phone_call_enabled: faker.datatype.boolean(),
    created_at: faker.date.recent().toString(),
    updated_at: faker.date.recent().toString(),
    deleted_at: faker.date.recent().toString(),
    created_by: faker.datatype.number(),
    updated_by: faker.datatype.number(),
    deleted_by: faker.datatype.number(),
    idle_timing: faker.datatype.number(),
    settings: faker.datatype.json(),
    slug: faker.datatype.string(),
  };
};

const subscriptionDbModel = (): SubscriptionDbModel => {
  return {
    id: faker.datatype.number(),
    id_text: faker.datatype.uuid(),
    stripe_subscription_id: faker.datatype.uuid(),
    interval_type: faker.helpers.arrayElement(['month', 'year']),
    package_id: faker.datatype.number(),
    company_id: faker.datatype.number(),
    user_quota: faker.datatype.number(),
    task_quota: faker.datatype.number(),
    invoice_quota: faker.datatype.number(),
    report_quota: faker.datatype.number(),
    team_quota: faker.datatype.number(),
    storage_quota: faker.datatype.number(),
    created_at: faker.date.recent().toString(),
    updated_at: faker.date.recent().toString(),
    created_by: faker.datatype.number(),
    updated_by: faker.datatype.number(),
  };
};

const subscriptionProductDbModel = (): SubscriptionProductDbModel => {
  return {
    id: faker.datatype.number(),
    id_text: faker.datatype.uuid(),
    name: faker.random.words(),
    stripe_product_id: faker.datatype.uuid(),
    created_at: faker.date.recent().toString(),
    updated_at: faker.date.recent().toString(),
    created_by: faker.datatype.number(),
    updated_by: faker.datatype.number(),
  };
};

const companyPaymentMethodDbModel = (): CompanyPaymentMethodDbModel => {
  return {
    id: faker.datatype.number(),
    user_id: faker.datatype.number(),
    company_id: faker.datatype.number(),
    stripe_customer_id: faker.datatype.uuid(),
    stripe_payment_method_id: faker.datatype.uuid(),
    is_default: faker.datatype.boolean(),
    created_at: faker.date.recent().toString(),
    updated_at: faker.date.recent().toString(),
    created_by: faker.datatype.number(),
    updated_by: faker.datatype.number(),
  };
};

const workspaceDbModel = (): WorkspaceDbModel => {
  return {
    id: faker.datatype.number(),
    id_text: faker.datatype.uuid(),
    name: faker.random.words(),
    bg_color: faker.color.rgb({ prefix: '#' }),
    created_at: faker.date.recent().toString(),
    updated_at: faker.date.recent().toString(),
    created_by: faker.datatype.number(),
    updated_by: faker.datatype.number(),
    company_id: faker.datatype.number(),
  };
};

const projectDbModel = () => {
  return {
    id: faker.datatype.number(),
    id_text: faker.datatype.uuid(),
    company_id: faker.datatype.number(),
    contact_id: faker.datatype.number(),
    team_id: faker.datatype.number(),
    type: faker.helpers.arrayElement(['Internal', 'Collaboration', 'Personal']),
    category: faker.datatype.number({ min: 0, max: 1 }),
    name: faker.random.words(),
    description: faker.lorem.lines(),
    comment: faker.lorem.lines(),
    color: faker.color.rgb({ prefix: '#' }),
    associate_by: faker.datatype.number(),
    status: faker.datatype.number({ min: 1, max: 3 }),
    created_at: faker.date.recent().toString(),
    updated_at: faker.date.recent().toString(),
    deleted_at: faker.date.recent().toString(),
    created_by: faker.datatype.number(),
    updated_by: faker.datatype.number(),
    deleted_by: faker.datatype.number(),
    slug: faker.datatype.string(),
    archived: faker.datatype.boolean(),
    visibility: faker.datatype.number({ min: 0, max: 1 }),
    folder_id: faker.datatype.number(),
    pinned: faker.datatype.boolean(),
    published: faker.datatype.boolean(),
  };
};

const taskDbModel = () => {
  return {
    name: faker.animal.bear(),
    id: faker.datatype.number(),
    job_id: faker.datatype.number(),
    team_id: faker.datatype.number(),
    id_text: faker.datatype.uuid(),
    start_date: faker.date.recent(),
    end_date: faker.date.soon(),
    due_date: faker.date.future(),
    actual_start: faker.date.recent(),
    actual_end: faker.date.soon(),
  };
};

const userDbModel = () => {
  return {
    id: faker.datatype.number(),
    id_text: faker.datatype.uuid(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.name.firstName(),
    contact_no: faker.phone.phoneNumber(),
    profile_image: faker.internet.url(),
    profile_image_size: faker.datatype.number(),
    last_login: faker.date.recent(),
    active: faker.datatype.boolean(),
    email_verified: faker.datatype.boolean(),
    last_active_at: faker.date.recent(),

    customer_id: faker.datatype.string(),
    payment_method_id: faker.datatype.string(),
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    created_by: faker.datatype.number(),
    updated_by: faker.datatype.number(),
    signup_data: faker.datatype.json(),
    tooltips_status: faker.datatype.json(),
  };
};

const projectStatusDbModel = () => {
  return {
    project_id: faker.datatype.number(),
    id: faker.datatype.number(),
    id_text: faker.datatype.uuid(),
    name: faker.random.words(),
    color: faker.color.rgb({ prefix: '#' }),
    company_id: faker.datatype.number(),
    notify: faker.datatype.boolean(),
  };
};

const projectTemplateStatusDbModel = () => {
  return {
    template_id: faker.datatype.number(),
    id: faker.datatype.number(),
    id_text: faker.datatype.uuid(),
    name: faker.random.words(),
    color: faker.color.rgb({ prefix: '#' }),
    notify: faker.datatype.boolean(),
  };
};

const projectTemplateDbModel = () => {
  return {
    id: faker.datatype.number(),
    id_text: faker.datatype.uuid(),
    name: faker.random.words(),
    columns: JSON.stringify([
      { name: faker.random.word(), order: 1 },
      { name: faker.random.word(), order: 2 },
    ]),
    company_id: faker.datatype.number(),
  };
};

const projectSettingsDbModel = () => {
  return {
    project_id: faker.datatype.number(),
    columns: faker.datatype.json(),
  };
};

const fixtures = {
  'db.company': companyDbModel,
  'db.companyPaymentMethod': companyPaymentMethodDbModel,
  'db.project': projectDbModel,
  'db.projectSettings': projectSettingsDbModel,
  'db.projectStatus': projectStatusDbModel,
  'db.projectTemplate': projectTemplateDbModel,
  'db.projectTemplateStatus': projectTemplateStatusDbModel,
  'db.subscription': subscriptionDbModel,
  'db.subscriptionProduct': subscriptionProductDbModel,
  'db.task': taskDbModel,
  'db.user': userDbModel,
  'db.workspace': workspaceDbModel,
};

const generate = <T>(
  type: keyof typeof fixtures,
  count = 1,
  customFields: { [key: string]: unknown }[] = [],
): T | T[] => {
  if (count === 1) {
    const item = {
      ...fixtures[type](),
      ...customFields[0],
    };

    // @ts-ignore
    return item as T;
  } else {
    const items: T[] = [];

    for (let i = 0; i < count; i++) {
      const item = {
        // @ts-ignore
        ...fixtures[type](),
        // @ts-ignore
        ...customFields[i],
      };
      // @ts-ignore
      items.push(item as T);
    }

    return items;
  }
};

export default {
  generate,
};
