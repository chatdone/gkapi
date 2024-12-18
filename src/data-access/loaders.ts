import DataLoader from 'dataloader';
import { batchGet } from '@db/utils';
import knex from '@db/knex';
import _ from 'lodash';
import { camelize } from './utils';
import { TableNames } from '@db-tables';

export const createLoaders = (): {
  [key: string]: DataLoader<number | string, unknown>;
} => {
  return {
    contacts: generateLoader('contacts'),
    contactGroups: generateLoader('contact_groups'),
    contactPics: generateLoader('contacts_pic'),
    companies: generateLoader('companies'),
    companyMembers: generateLoader('company_members'),
    companyTeams: generateLoader('teams'),
    companyTeamMembers: generateLoader('team_members'),
    users: generateLoader('users'),

    collectors: generateLoader('collectors'),
    notifications: generateLoader('notifications'),
    usersNotifications: generateLoader('users_notifications'),
    companySubscriptions: generateLoader('company_subscriptions'),
    subscriptionPackages: generateLoader('packages'),
    subscriptionPackagePrices: generateLoader('package_prices'),

    teamStatuses: generateLoader('card_statuses'),
    taskComments: generateLoader('card_comments'),
    subtasks: generateLoader('card_checklist'),
    taskAttachments: generateLoader('card_attachments'),
    taskBoards: generateLoader('projects'),
    taskBoardTeams: generateLoader('jobs_teams'),
    tasks: generateLoader('cards'),
    collections: generateLoader('receivable_reminders'),
    collectionPeriods: generateLoader('receivable_periods'),
    collectionPayments: generateLoader('receivable_payments'),
    subStatuses: generateLoader('card_statuses'),
    taskMembers: generateLoader('card_members'),
    timesheetActivities: generateLoader('timesheet_activities'),
    attendances: generateLoader('attendances'),
    attendanceVerifications: generateLoader('attendance_verifications'),
    attendanceLabels: generateLoader('attendance_labels'),
    timesheets: generateLoader('timesheets'),
    employeeTypes: generateLoader('employee_types'),
    templates: generateLoader('templates'),

    workFlows: generateLoader('signing_workflows'),
    workFlowDoc: generateLoader('signing_workflow_documents'),

    paymentOrders: generateLoader('payment_orders'),

    locations: generateLoader('locations'),
    publicHolidays: generateLoader('public_holidays'),
    companyHolidays: generateLoader('company_holidays'),
    contactNotes: generateLoader('contact_notes'),

    tags: generateLoader(TableNames.TAGS),
    tagGroups: generateLoader(TableNames.TAG_GROUPS),
    boardFolders: generateLoader(TableNames.TASK_BOARD_FOLDERS),
    projectInvoices: generateLoader(TableNames.PROJECT_INVOICES),
    projectClaims: generateLoader(TableNames.PROJECT_CLAIMS),
    projectTimeCosts: generateLoader(TableNames.PROJECT_TIME_COSTS),
    projectTemplates: generateLoader(TableNames.PROJECT_TEMPLATES),
    projectGroups: generateLoader(TableNames.PROJECT_GROUPS),
    projectStatuses: generateLoader(TableNames.PROJECT_STATUSES),
    billingInvoices: generateLoader(TableNames.BILLING_INVOICES),
    billingInvoiceItems: generateLoader(TableNames.BILLING_INVOICE_ITEMS),
    projects: generateLoader(TableNames.PROJECTS),
    groupCustomAttributes: generateLoader(
      TableNames.PROJECT_GROUPS_CUSTOM_ATTRIBUTES,
    ),

    getUserByAuth0Id: new DataLoader(
      async (ids: readonly (number | string)[]) => {
        const userId = _.head(ids);
        if (!userId) {
          return [];
        }

        const res = await knex
          .from('users')
          .where('auth0_id', userId)
          .limit(1)
          .select();
        return res.map((e) => {
          if (!e) {
            return undefined;
          } else {
            return {
              ...e,
              ...camelize(e),
            };
          }
        });
      },
    ),
    getUserByEmail: new DataLoader(
      async (ids: readonly (number | string)[]) => {
        try {
          const email = _.head(ids);
          if (!email) {
            return [];
          }

          const res = await knex.from('users').where('email', email).select();
          return res.map((e) => {
            if (!e) {
              return undefined;
            } else {
              return {
                ...e,
                ...camelize(e),
              };
            }
          });
        } catch (error) {
          return [];
        }
      },
    ),
    getShortUrl: new DataLoader(async (ids: readonly (number | string)[]) => {
      try {
        const shortId = _.head(ids);
        if (!shortId) {
          return [];
        }

        const res = await knex
          .from('short_urls')
          .where('short_id', shortId)
          .select();
        return res;
      } catch (error) {
        return [];
      }
    }),
    getByCompanySlug: new DataLoader(
      async (slugs: readonly (number | string)[]) => {
        try {
          const slug = _.head(slugs);
          if (!slug) {
            return [];
          }

          const res = await knex.from('companies').where('slug', slug).select();
          return res.map((e) => {
            if (!e) {
              return undefined;
            } else {
              return {
                ...e,
                ...camelize(e),
              };
            }
          });
        } catch (error) {
          return [];
        }
      },
    ),
    resourcePermissions: new DataLoader(
      async (ids: readonly (number | string)[]) => {
        try {
          const id = _.head(ids);
          if (!ids) {
            return [];
          }

          if (ids?.length === 1) {
            const res = await knex
              .from('resource_permissions')
              .where('resource_id', id)
              .select();
            return res;
          } else {
            const res = await knex
              .from('resource_permissions')
              .whereIn('resource_id', ids)
              .select();
            return res;
          }
        } catch (error) {
          return [];
        }
      },
    ),
  };
};

const generateLoader = <T>(
  tableName: string,
): DataLoader<string | number, T> => {
  //@ts-ignore
  return new DataLoader(async (ids: readonly (number | string)[]) => {
    if (_.isEmpty(ids)) {
      return [];
    }

    const results = (await batchGet(tableName, ids)) as T[];

    if (typeof _.head(ids) === 'string') {
      const items = ids.map((id) => _.find(results, { id_text: id })) as T[];
      return items.map((e) => {
        if (!e) {
          return undefined;
        } else {
          return {
            ...e,
            ...camelize(e),
          };
        }
      });
    } else {
      const items = ids.map((id) => _.find(results, { id })) as T[];
      return items.map((e) => {
        if (!e) {
          return undefined;
        } else {
          return {
            ...e,
            ...camelize(e),
          };
        }
      });
    }
  });
};
