import { faker } from '@faker-js/faker';
import { ProjectModel } from '@models/workspace.model';
import { UserModelUpdated as UserModel } from '@models/user.model';
import { WorkspaceModel } from '@models/workspace.model';
import {
  TaskStatusModelRefactor as TaskStatusModel,
  TaskModelRefactor as TaskModel,
} from '@models/task.model';
import {
  SubscriptionModel,
  SubscriptionProductModel,
} from '@models/subscription.model';
import Stripe from 'stripe';
import { CompanyPaymentMethodModel } from '@models/company.model';

const stripeProductModel = (): Stripe.Product => {
  // NOTE: Only the faker generated fields are used in the tests. If you need to use more fields
  // add the generation here.
  return {
    id: faker.datatype.string(10),
    object: 'product',
    active: true,
    created: 1650874796,
    default_price: null,
    description: null,
    images: [],
    livemode: false,
    metadata: {},
    name: faker.random.words(),
    package_dimensions: null,
    shippable: null,
    statement_descriptor: null,
    tax_code: null,
    unit_label: null,
    updated: 1650879629,
    url: null,
    attributes: [],
    caption: null,
    type: 'service',
  };
};

const stripePriceModel = (): Stripe.Price => {
  // NOTE: Only the faker generated fields are used in the tests. If you need to use more fields
  // add the generation here.
  return {
    id: faker.datatype.string(10),
    object: 'price',
    active: true,
    billing_scheme: 'per_unit',
    created: 1647517293,
    currency: 'myr',
    livemode: false,
    lookup_key: null,
    metadata: {},
    nickname: null,
    product: 'prod_L27Ghd3dAVNdQr',
    recurring: {
      aggregate_usage: null,
      interval: faker.helpers.arrayElement(['day', 'week', 'month', 'year']),
      interval_count: 1,
      usage_type: 'licensed',
      trial_period_days: null,
    },
    tax_behavior: 'unspecified',
    tiers_mode: null,
    transform_quantity: null,
    type: 'recurring',
    unit_amount: faker.datatype.number(),
    unit_amount_decimal: '66000',
  };
};

const subscriptionModel = (): SubscriptionModel => {
  return {
    id: faker.datatype.number(),
    idText: faker.datatype.uuid(),
    stripeSubscriptionId: faker.datatype.uuid(),
    packageId: faker.datatype.number(),
    companyId: faker.datatype.number(),
    intervalType: faker.helpers.arrayElement(['month', 'year']),
    userQuota: faker.datatype.number(),
    taskQuota: faker.datatype.number(),
    invoiceQuota: faker.datatype.number(),
    reportQuota: faker.datatype.number(),
    teamQuota: faker.datatype.number(),
    storageQuota: faker.datatype.number(),
    createdAt: faker.date.recent().toString(),
    updatedAt: faker.date.recent().toString(),
    createdBy: faker.datatype.number(),
    updatedBy: faker.datatype.number(),
  };
};

const subscriptionProductModel = (): SubscriptionProductModel => {
  return {
    id: faker.datatype.number(),
    idText: faker.datatype.uuid(),
    name: faker.random.words(),
    stripeProductId: faker.datatype.uuid(),
    createdAt: faker.date.recent().toString(),
    updatedAt: faker.date.recent().toString(),
    createdBy: faker.datatype.number(),
    updatedBy: faker.datatype.number(),
  };
};

const companyPaymentMethodModel = (): CompanyPaymentMethodModel => {
  return {
    id: faker.datatype.number(),
    companyId: faker.datatype.number(),
    stripeCustomerId: faker.datatype.string(10),
    stripePaymentMethodId: faker.datatype.string(10),
    isDefault: faker.datatype.boolean(),
    userId: faker.datatype.number(),
    createdAt: faker.date.recent().toString(),
    updatedAt: faker.date.recent().toString(),
    createdBy: faker.datatype.number(),
    updatedBy: faker.datatype.number(),
  };
};

const workspaceModel = (): WorkspaceModel => {
  return {
    id: faker.datatype.number(),
    idText: faker.datatype.uuid(),
    name: faker.random.words(),
    bgColor: faker.color.rgb({ prefix: '#' }),
    createdAt: faker.date.recent().toString(),
    updatedAt: faker.date.recent().toString(),
    createdBy: faker.datatype.number(),
    updatedBy: faker.datatype.number(),
    companyId: faker.datatype.number(),
    visibility: faker.datatype.number({ min: 1, max: 3 }),
  };
};

const taskModel = (): TaskModel => {
  return {
    id: faker.datatype.number(),
    jobId: faker.datatype.number(),
    parentId: faker.datatype.number(),
    idText: faker.datatype.uuid(),
    name: faker.random.words(),
    description: faker.random.words(),
    value: faker.datatype.number(),
    dueDate: faker.date.recent().toString(),
    dueReminder: faker.datatype.number(),
    lastRemindOn: faker.date.recent().toString(),
    startDate: faker.date.recent().toString(),
    endDate: faker.date.recent().toString(),
    plannedEffort: faker.datatype.number(),
    projectedCost: faker.datatype.number(),
    actualCost: faker.datatype.number(),
    actualStart: faker.date.recent().toString(),
    actualEnd: faker.date.recent().toString(),
    fileType: faker.system.mimeType(),
    status: faker.datatype.number(),
    sequence: faker.datatype.number(),
    subStatusId: faker.datatype.number(),
    completed: faker.datatype.number(),
    archived: faker.datatype.number(),
    boardType: faker.random.words(),

    createdAt: faker.date.recent().toString(),
    updatedAt: faker.date.recent().toString(),
    deletedAt: faker.date.recent().toString(),

    createdBy: faker.datatype.number(),
    type: faker.datatype.number(),
    teamId: faker.datatype.number(),
    templateId: faker.datatype.number(),
    priority: faker.datatype.number(),
    visibility: faker.datatype.number(),
    pinned: faker.datatype.number(),
    published: faker.datatype.number(),
    statusId: faker.datatype.number(),
    groupId: faker.datatype.number(),

    posY: faker.datatype.number(), // NOTE: not always available, need to join tables
  };
};

const taskStatusModel = (): TaskStatusModel => {
  return {
    id: faker.datatype.number(),
    idText: faker.datatype.uuid(),
    createdAt: faker.date.recent().toString(),
    updatedAt: faker.date.recent().toString(),
    deletedAt: faker.date.recent().toString(),
    createdBy: faker.datatype.number(),
    updatedBy: faker.datatype.number(),
    deletedBy: faker.datatype.number(),
    teamId: faker.datatype.number(),
    parentStatus: faker.datatype.number(),
    stage: faker.datatype.number(),
    label: faker.word.noun(),
    percentage: faker.datatype.number(),
    sequence: faker.datatype.number(),
    color: faker.color.rgb(),
  };
};

// TODO: Populate fully later
const companyModel = () => ({
  id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  name: faker.music.genre(),
  user_id: faker.datatype.number(),
  description: faker.lorem.sentence(),
  // slug: faker.lorem.sentence(),
});
const projectModel = (): ProjectModel => {
  return {
    id: faker.datatype.number(),
    idText: faker.datatype.uuid(),

    companyId: faker.datatype.number(),
    contactId: faker.datatype.number(),
    teamId: faker.datatype.number(),
    type: faker.helpers.arrayElement(['Internal', 'Collaboration', 'Personal']),
    category: faker.datatype.number(),
    name: faker.random.words(),
    description: faker.random.words(),
    comment: faker.random.words(),
    color: faker.color.rgb(),
    associateBy: faker.datatype.number(),
    status: faker.datatype.number({ min: 1, max: 4 }),
    createdAt: faker.date.recent().toString(),
    updatedAt: faker.date.recent().toString(),
    deletedAt: faker.date.recent().toString(),
    slug: faker.datatype.string(),
    archived: faker.datatype.number({ min: 0, max: 1 }),
    visibility: faker.datatype.number({ min: 1, max: 4 }),
  };
};

const userModel = (): UserModel => {
  return {
    id: faker.datatype.number(),
    idText: faker.datatype.uuid(),
    name: faker.name.firstName(),
    email: faker.internet.email(),
  };
};

const timesheetModel = () => ({
  company_member_id: faker.datatype.number(),
  activity_id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  start_date: faker.date.recent(),
  end_date: faker.date.recent(),
  submitted_date: faker.date.recent(),
  comments: faker.lorem.words(),
  location_id: faker.datatype.number(),
  time_total: faker.datatype.number(),
});

const weeklyTimesheetMvModel = () => ({
  id: faker.datatype.number(),
  company_member_id: faker.datatype.number(),
  week_number: faker.datatype.number(),
  year: faker.datatype.number(),
  task_id: faker.datatype.number(),
  monday: faker.datatype.number(),
  tuesday: faker.datatype.number(),
  wednesday: faker.datatype.number(),
  thursday: faker.datatype.number(),
  friday: faker.datatype.number(),
  saturday: faker.datatype.number(),
  sunday: faker.datatype.number(),
  total_weekly: faker.datatype.number(),
  created_at: faker.date.recent(),
  updated_at: faker.date.recent(),
});

const contactPicModel = () => ({
  id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  name: faker.finance.accountName(),
  contact_no: faker.phone.phoneNumber(),
  contact_id: faker.datatype.number(),
  user_id: faker.datatype.number(),
  deleted_at: faker.datatype.datetime(),
});

const fixtures = {
  company: companyModel,
  project: projectModel,
  user: userModel,
  task: taskModel,
  taskStatus: taskStatusModel,
  workspace: workspaceModel,
  subscription: subscriptionModel,
  subscriptionProduct: subscriptionProductModel,
  companyPaymentMethod: companyPaymentMethodModel,
  timesheet: timesheetModel,
  weeklyTimesheetMv: weeklyTimesheetMvModel,
  contactPic: contactPicModel,
  /* Stripe fixtures */
  stripeProduct: stripeProductModel,
  stripePrice: stripePriceModel,
};

const generate = <T>(
  type: keyof typeof fixtures,
  count = 1,
  customFields: { [key: string]: unknown }[] = [],
): T | T[] => {
  if (count === 1) {
    const item = {
      // @ts-ignore
      ...fixtures[type](),
      // @ts-ignore
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
      items.push(item);
    }

    return items;
  }
};

export default {
  generate,
};
