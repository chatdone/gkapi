import dayjs from 'dayjs';
import { faker } from '@faker-js/faker';
import { camelize } from '@data-access/utils';
import { UserOnboardingModel, UserViewOptionsModel } from '@models/user.model';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);
const getRandomFromArray = (items: string[]) => {
  const randomNumber = Math.random() * (items.length - 1);
  return items[randomNumber];
};

const genericDataModel = () => {
  return {
    id: faker.datatype.number(),
    id_text: faker.datatype.uuid(),
  };
};

const userDataModel = () => {
  return {
    id: faker.datatype.number(),
    id_text: faker.datatype.uuid(),
    email: faker.internet.email(),
    profile_image: faker.internet.url(),
    email_verified: faker.datatype.boolean(),
    active: faker.datatype.boolean(),
    name: faker.name.firstName(),
    customer_id: faker.datatype.string(),
    payment_method_id: faker.datatype.string(),
    auth0_id: faker.datatype.string(),
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    created_by: faker.datatype.number(),
    updated_by: faker.datatype.number(),
    last_login: faker.date.recent(),
  };
};

const userViewOptionsDataModel = () => {
  // NOTE: Using the TS model to ensure that the fake data
  // is in the correct format.
  const model: UserViewOptionsModel = {
    homePageMode: faker.datatype.string(),
  };
  return model;
};

const userOnboardingDataModel = () => {
  const model: UserOnboardingModel = {
    hasCompletedOnboarding: faker.datatype.boolean(),
  };
  return model;
};

const companyDataModel = () => ({
  id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  name: faker.music.genre(),
  user_id: faker.datatype.number(),
  description: faker.lorem.sentence(),
  // slug: faker.lorem.sentence(),
});

const collectionDataModel = () => ({
  id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  ref_no: faker.finance.accountName(),
  contact_id: faker.datatype.number(),
  title: faker.animal.fish(),
  payable_amount: faker.finance.amount(),
  due_date: faker.date.soon(),
  remind_type: faker.datatype.number({ min: 1, max: 2 }),
  payment_type: faker.datatype.number({ min: 0, max: 1 }),
  file_name: faker.lorem.word() + '.pdf',
  invoice: faker.internet.domainName(),
  last_remind_on: faker.date.recent(),
  periodsIds: [1, 2, 3],
  description: faker.lorem.sentence(),
});

const contactDataModel = () => ({
  id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  name: faker.finance.accountName(),
});

const contactPicDataModel = () => ({
  id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  name: faker.finance.accountName(),
  contact_no: faker.phone.phoneNumber(),
  contact_id: faker.datatype.number(),
  user_id: faker.datatype.number(),
  deleted_at: faker.datatype.datetime(),
});

const collectionPeriodDataModel = () => ({
  id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  receivable_id: faker.datatype.number(),
  period: faker.datatype.number(),
  month: dayjs(faker.date.recent()).format('YYYY-MM-DD'),
  amount: faker.finance.amount(),
  due_date: faker.date.recent(),
  last_remind_on: faker.date.recent(),
  payment_accept_at: faker.date.recent(),
  status: faker.datatype.number({ min: 1, max: 2 }),
  created_at: faker.date.recent(),
  updated_at: faker.date.recent(),
});

const companySubscriptionDataModel = () => ({
  id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),

  company_id: faker.datatype.number(),
  package_id: faker.datatype.number(),
  subscription_id: faker.datatype.string(),
  product_id: faker.datatype.string(),
  price_id: faker.datatype.string(),
  package_title: faker.music.genre(),
  package_description: faker.lorem.sentence(),
  sms_quota: faker.datatype.number({ min: 0, max: 500 }),
  phone_call_quota: faker.datatype.number({ min: 0, max: 500 }),
  email_quota: faker.datatype.number({ min: 0, max: 500 }),
  whatsApp_quota: faker.datatype.number({ min: 0, max: 500 }), // YES THIS CASE IS CORRECT - TECHIES FAULT
  price: faker.datatype.number(),
  interval: 'month',
  interval_count: faker.datatype.number(),
  start_date: faker.date.recent(),
  end_date: faker.date.recent(),
  cancel_date: faker.date.recent(),
  status: faker.datatype.number({ min: 1, max: 2 }),
  active: faker.datatype.number({ min: 0, max: 1 }),
  data: { type: faker.datatype.number({ min: 1, max: 5 }) },
});

const packageDataModel = () => ({
  id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  title: faker.name.jobArea(),
  description: faker.lorem.sentence(),

  sms_quota: faker.datatype.number(),
  phone_call_quota: faker.datatype.number(),
  email_quota: faker.datatype.number(),
  whatsapp_quota: faker.datatype.number(),
});

const packagePriceDataModel = () => ({
  id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  title: faker.name.jobArea(),
  description: faker.lorem.sentence(),
  product_id: faker.datatype.string(),
  stripe_price_id: faker.datatype.string(),
  price: faker.datatype.number(),
  interval: faker.datatype.string(),
  interval_count: faker.datatype.number(),
});

const companyMemberDataModel = () => ({
  id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  company_id: faker.datatype.number(),
  user_id: faker.datatype.number(),
  report_to: faker.datatype.number(),
  type: faker.datatype.number({ min: 1, max: 3 }),
  position: faker.lorem.word(),
  invitation_code: faker.lorem.word(),
  employee_type: faker.datatype.number(),
  // setting: faker.datatype.number(),
  // created_at: faker.datatype.number(),
  // updated_at: faker.datatype.number(),
  // deleted_at: faker.datatype.number(),
});

const fileAttachmentDataModel = () => ({
  createReadStream: () => null,
  filename: faker.lorem.word() + '.csv',
  mimetype: faker.system.mimeType(),
  encoding: 'utf8',
});

const locationDataModel = () => ({
  id: faker.datatype.number(),
  company_id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  name: faker.lorem.word(),
});

const holidayDataModel = () => ({
  id: faker.datatype.number(),
  company_id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  name: faker.lorem.word(),
  start_date: faker.date.recent(),
  end_date: faker.date.recent(),
  date: faker.date.recent(),
  type: faker.datatype.number({ min: 1, max: 2 }),
  active: faker.datatype.number({ min: 0, max: 1 }),
  public_holiday_id: faker.datatype.number(),
  year: faker.datatype.number({ min: 1950, max: 3000 }),
  created_at: faker.date.recent(),
  updated_at: faker.date.recent(),
  created_by: faker.datatype.number(),
  updated_by: faker.datatype.number(),
});

const companyHolidayDataModel = () => ({
  id: faker.datatype.number(),
  company_id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  name: faker.lorem.word(),
  start_date: faker.date.recent(),
  end_date: faker.date.recent(),
  type: faker.datatype.number({ min: 1, max: 2 }),
  active: faker.datatype.boolean(),
  public_holiday_id: faker.datatype.number(),
  created_at: faker.date.recent(),
  updated_at: faker.date.recent(),
  created_by: faker.datatype.number(),
  updated_by: faker.datatype.number(),
});

const publicHolidayDataModel = () => ({
  id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  name: faker.lorem.word(),
  start_date: faker.date.recent(),
  end_date: faker.date.recent(),
  date: faker.date.recent(),
  created_at: faker.date.recent(),
  updated_at: faker.date.recent(),
  year: faker.datatype.number({ min: 1950, max: 3000 }),
  country_code: faker.lorem.word(),
});

const taskBoardDataModel = () => ({
  id: faker.datatype.number(),
  company_id: faker.datatype.number(),
  contact_id: faker.datatype.number(),
  team_id: faker.datatype.number(),
  type: getRandomFromArray(['Personal', 'Collaboration', 'Internal']),
  category: faker.datatype.number({ min: 0, max: 1 }),
  name: faker.lorem.word(),
  description: faker.lorem.sentence(),
  created_by: faker.datatype.number(),
  updated_by: faker.datatype.number(),
  created_at: faker.date.recent(),
  id_text: faker.datatype.uuid(),
  visibility: 1,
  pinned: faker.datatype.number({ min: 0, max: 1 }),
});

const taskBoardOwnerModel = () => ({
  job_id: faker.datatype.number(),
  company_member_id: faker.datatype.number(),
});

const taskDataModel = () => ({
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
});

const taskBoardFolderDataModel = () => ({
  id: faker.datatype.number(),
  companyId: faker.datatype.number(),
  idText: faker.datatype.uuid(),
  name: faker.datatype.string(),
  type: faker.datatype.number({ min: 1, max: 4 }),
  createdAt: faker.date.recent(),
  createdBy: faker.datatype.number(),
  updatedAt: faker.date.recent(),
  updatedBy: faker.datatype.number(),
});

const taskTimerEntryModel = () => ({
  id: faker.datatype.number(),
  company_member_id: faker.datatype.number(),
  task_id: faker.datatype.number(),
  start_date: faker.date.recent(),
  end_date: faker.date.recent(),
  time_total: faker.datatype.number(),
});

const teamStatusesModel = () => ({
  id: faker.datatype.number(),
  team_id: faker.datatype.number(),
  parent_status: faker.datatype.number({ min: 1, max: 3 }),
  stage: faker.datatype.number({ min: 1, max: 4 }),
  label: faker.lorem.word(),
  percentage: faker.datatype.number({ min: 0, max: 100 }),
  sequence: faker.datatype.number(),
  created_by: faker.datatype.number(),
  updated_by: faker.datatype.number(),
  created_at: faker.date.recent(),
  updated_at: faker.date.soon(),
  deleted_at: faker.date.soon(),
  id_text: faker.datatype.uuid(),
});

const timesheetDataModel = () => ({
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

const attendanceDataModel = () => ({
  company_member_id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  start_date: faker.date.recent(),
  end_date: faker.date.recent(),
  type: faker.datatype.number({ min: 0, max: 1 }),
  submitted_date: faker.date.recent(),
  comments: faker.lorem.words(),
  location_id: faker.datatype.number(),
  verification_id: faker.datatype.number(),
  time_total: faker.datatype.number(),
});

const attendanceVerificationDataModel = () => ({
  company_member_id: faker.datatype.number(),
  id_text: faker.datatype.uuid(),
  status: faker.datatype.number({ min: 0, max: 1 }),
  image_url: faker.internet.url(),
});

const weeklyTimesheetMvDataModel = () => ({
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

const activityTrackerMonthlyDataModel = () => ({
  id: faker.datatype.number(),
  company_member_id: faker.datatype.number(),
  task_id: faker.datatype.number(),
  week_number: faker.datatype.number({ max: 52 }),
  week_total: faker.datatype.number(),
  created_at: faker.date.recent(),
  updated_at: faker.date.recent(),
});

const attendanceLabelDataModel = () => ({
  id: faker.datatype.number(),
  company_id: faker.datatype.number(),
  name: faker.lorem.word(),
  color: faker.lorem.word(),
  created_at: faker.date.recent(),
  updated_at: faker.date.recent(),
});

const tagDataModel = () => ({
  id: faker.datatype.number(),
  company_id: faker.datatype.number(),
  name: faker.lorem.word(),
  color: faker.lorem.word(),
  created_at: faker.date.recent(),
  updated_at: faker.date.recent(),
  created_by: faker.datatype.number(),
});

const tagGroupDataModel = () => ({
  id: faker.datatype.number(),
  company_id: faker.datatype.number(),
  name: faker.lorem.word(),
  created_at: faker.date.recent(),
  updated_at: faker.date.recent(),
  created_by: faker.datatype.number(),
});

const resourcePermissionDataModel = () => ({
  resource_id:
    getRandomFromArray(['task', 'collection']) + '_' + faker.datatype.number(),
  company_member_ids: JSON.stringify([
    //FIXME: There is probably a better way to do these
    faker.datatype.number(),
    faker.datatype.number(),
    faker.datatype.number(),
  ]),
  team_ids: JSON.stringify([
    faker.datatype.number(),
    faker.datatype.number(),
    faker.datatype.number(),
  ]),
});

const stripeDataModel = () => ({
  id: faker.datatype.string(),
  object: faker.random.word(),
  address: faker.random.words(),
  balance: faker.datatype.number(),
  created: +dayjs(faker.datatype.datetime()).format('X'),
  currency: 'myr',
  default_currency: 'myr',
  default_source: null,
  delinquent: false,
  description: null,
  discount: null,
  email: faker.internet.email(),
  invoice_prefix: faker.datatype.string(),
  invoice_settings: {
    custom_fields: null,
    default_payment_method: null,
    footer: null,
    rendering_options: null,
  },
  livemode: false,
  metadata: {},
  name: faker.name.findName(),
  next_invoice_sequence: faker.datatype.number(),
  phone: null,
  preferred_locales: [],
  shipping: null,
  tax_exempt: 'none',
  test_clock: null,
});

const fixtures = {
  activityTrackerMonthly: activityTrackerMonthlyDataModel,
  collection: collectionDataModel,
  collectionPeriod: collectionPeriodDataModel,
  company: companyDataModel,
  companyHoliday: companyHolidayDataModel,
  companyMember: companyMemberDataModel,
  companySubscription: companySubscriptionDataModel,
  contact: contactDataModel,
  contactPic: contactPicDataModel,
  fileAttachment: fileAttachmentDataModel,
  generic: genericDataModel,
  holiday: holidayDataModel,
  location: locationDataModel,
  package: packageDataModel,
  packagePrice: packagePriceDataModel,
  publicHoliday: publicHolidayDataModel,
  taskBoard: taskBoardDataModel,
  project: taskBoardDataModel,
  taskBoardOwner: taskBoardOwnerModel,
  task: taskDataModel,
  taskBoardFolder: taskBoardFolderDataModel,
  taskTimerEntry: taskTimerEntryModel,
  teamStatus: teamStatusesModel, // FIXME: To be deprecated to taskStatus
  taskStatus: teamStatusesModel,
  timesheet: timesheetDataModel,
  attendance: attendanceDataModel,
  attendanceVerification: attendanceVerificationDataModel,
  attendanceLabel: attendanceLabelDataModel,
  user: userDataModel,
  userViewOptions: userViewOptionsDataModel,
  userOnboarding: userOnboardingDataModel,
  weeklyTimesheetMv: weeklyTimesheetMvDataModel,
  resourcePermission: resourcePermissionDataModel,
  tag: tagDataModel,
  tagGroup: tagGroupDataModel,
  stripe: stripeDataModel,
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const generate = (type: string, count = 1) => {
  if (count === 1) {
    // @ts-ignore
    return camelize(fixtures[type]());
  } else {
    const items = [];
    for (let i = 0; i < count; i++) {
      // @ts-ignore
      items.push(fixtures[type]());
    }
    return camelize(items);
  }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const generateCustom = (
  type: string,
  customFields: { [key: string]: unknown },
  count = 1,
) => {
  if (count === 1) {
    const item = {
      // @ts-ignore
      ...fixtures[type](),
      ...customFields,
    };
    return item;
  } else {
    const items = [];
    for (let i = 0; i < count; i++) {
      const item = {
        // @ts-ignore
        ...fixtures[type](),
        ...customFields,
      };
      items.push(item);
    }

    return camelize(items);
  }
};

export default {
  generate,
  generateCustom,
};
