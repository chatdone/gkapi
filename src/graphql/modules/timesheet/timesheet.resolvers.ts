import {
  ApolloError,
  AuthenticationError,
  UserInputError,
} from 'apollo-server-express';
import { Resolvers } from '@generated/graphql-types';
import { withAuth } from '@graphql/wrappers';
import { TaskModel } from '@models/task.model';
import {
  CompanyMemberId,
  CompanyMemberModel,
  CompanyModel,
} from '@models/company.model';
import { LocationModel } from '@models/location.model';
import { CompanyService, TimesheetService } from '@services';
import { handleResolverError } from '@graphql/errors';
import {
  TimesheetActivityModel,
  TimesheetModel,
  ActivityTrackerWeeklyModel,
  ActivityTrackerMonthlyModel,
  ActivityTrackerDailyModel,
} from '@models/timesheet.model';
import { TeamId, TeamModel } from '@models/team.model';
import { FilterOptionsModel } from '@models/filter.model';
import {
  getCompany,
  getCompanyMember,
  getCompanyMembers,
  getTask,
  getTasks,
} from '@data-access/getters';
import { TimesheetStore } from '@data-access';
import dayjs from 'dayjs';
import { groupBy } from 'lodash';

export const resolvers: Resolvers = {
  Timesheet: {
    id: ({ id_text }) => id_text,
    activity: async ({ activity_id }, args, { loaders }) => {
      const activity = await loaders.timesheetActivities.load(activity_id);

      return activity;
    },
    location: async ({ location_id }, args, { loaders }) => {
      return location_id
        ? await loaders.locations.load(location_id)
        : location_id;
    },
    startDate: ({ start_date }) => (start_date ? start_date : null),
    endDate: ({ end_date }) => (end_date ? end_date : null),
    timeTotal: ({ time_total }) => {
      if (time_total) {
        return time_total;
      } else {
        return 0;
      }
    },
    companyMember: async ({ company_member_id }, args, { loaders }) => {
      return company_member_id
        ? await loaders.companyMembers.load(company_member_id)
        : company_member_id;
    },
    company_member: async ({ company_member_id }, args, { loaders }) => {
      return company_member_id
        ? await loaders.companyMembers.load(company_member_id)
        : company_member_id;
    },
  },
  TimesheetActivity: {
    id: ({ id_text }) => id_text,
    task: async ({ task_id }, args, { loaders }) => {
      return task_id ? await loaders.tasks.load(task_id) : task_id;
    },
  },

  ActivityWeekSummary: {
    company_member: async ({ company_member_id }, args, { loaders }) => {
      return await loaders.companyMembers.load(company_member_id);
    },
    task: async ({ task_id }, args, { loaders }) => {
      return await loaders.tasks.load(task_id);
    },
  },
  ActivityMonthSummary: {
    company_member: async ({ company_member_id }, args, { loaders }) => {
      return await loaders.companyMembers.load(company_member_id);
    },
    task: async ({ task_id }, args, { loaders }) => {
      return await loaders.tasks.load(task_id);
    },
  },
  MonthlyActivityTracking: {
    company_member: async ({ company_member_id }, args, { loaders }) => {
      return await loaders.companyMembers.load(company_member_id);
    },
    task: async ({ task_id }, args, { loaders }) => {
      return await loaders.tasks.load(task_id);
    },
  },
  ActivityDaySummary: {
    company_member: async ({ company_member_id }, args, { loaders }) => {
      return await loaders.companyMembers.load(company_member_id);
    },
    task: async ({ task_id }, args, { loaders }) => {
      return await loaders.tasks.load(task_id);
    },
  },
  TimesheetArchiveStatus: {
    TRUE: 1,
    FALSE: 0,
  },
  TimesheetApprovalStatus: {
    REJECTED: 0,
    APPROVED: 1,
  },
  TimesheetDayApproval: {
    companyMember: async ({ companyMemberId }, args, { loaders }) => {
      return await loaders.companyMembers.load(companyMemberId);
    },
    task: async ({ taskId }, args, { loaders }) => {
      return await loaders.tasks.load(taskId);
    },
  },
  CustomTimesheetDayApproval: {
    companyMember: async ({ companyMemberId }, args, { loaders }) => {
      return await loaders.companyMembers.load(companyMemberId);
    },
  },

  Mutation: {
    createTimesheetEntry: withAuth(
      async (
        root,
        { taskId, memberId, locationId, input },
        { loaders, auth: { user } },
      ) => {
        try {
          const task = (await loaders.tasks.load(taskId)) as TaskModel;

          if (!task) {
            throw new UserInputError('Task does not exist');
          }

          let activity = (await TimesheetService.getTimesheetActivityByTaskId({
            taskId: task.id,
          })) as TimesheetActivityModel;

          if (!activity) {
            // throw new UserInputError('Activity does not exist');

            activity = (await TimesheetService.createTimesheetActivity({
              taskId: task?.id,
            })) as TimesheetActivityModel;
          }

          const member = (await loaders.companyMembers.load(
            memberId,
          )) as CompanyMemberModel;

          if (!member) {
            throw new UserInputError('Member does not exist');
          }

          let locationPId;

          if (locationId) {
            const location = (await loaders.locations.load(
              locationId,
            )) as LocationModel;

            if (!location) {
              throw new UserInputError('Location does not exist');
            }
            locationPId = location.id;
          }

          const startDate = input?.start_date || input?.startDate;
          const endDate = input?.end_date || input?.endDate;
          const timeTotal = input.time_total || input.timeTotal;
          const comments = input?.comments;
          const submittedDate = input?.submitted_date || input?.submittedDate;

          const res = await TimesheetService.createTimesheet({
            payload: {
              start_date: startDate,
              comments,
              submitted_date: submittedDate,
              activity_id: activity.id,
              location_id: locationPId,
              company_member_id: member.id,
            },
            task,
            userId: user.id,
          });
          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    updateTimesheet: withAuth(
      async (
        root,
        { timesheetId, locationId, input },
        { loaders, auth: { user } },
      ) => {
        try {
          let location;
          const timesheet = (await loaders.timesheets.load(
            timesheetId,
          )) as TimesheetModel;

          if (!timesheet) {
            throw new UserInputError('That timesheet does not exist');
          }

          const companyMember = (await loaders.companyMembers.load(
            timesheet.company_member_id,
          )) as CompanyMemberModel;

          if (!companyMember) {
            throw new UserInputError(
              'Company member in timesheet does not exist',
            );
          }

          if (locationId) {
            location = (await loaders.locations.load(
              locationId,
            )) as LocationModel;
            if (!location) {
              throw new UserInputError('That location does not exist');
            }
          }

          const comments = input?.comments;
          const endDate = input?.end_date || input?.endDate;

          const res = await TimesheetService.updateTimesheet({
            timesheetId: timesheet.id,
            payload: {
              comments,
              end_date: endDate,
              location_id: location ? location.id : timesheet.location_id,
            },
            companyId: companyMember.company_id,
          });
          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    updateTimeSheetArchivedStatus: withAuth(
      async (root, { timesheetIds, archived }, { loaders, auth: { user } }) => {
        try {
          const timesheets = (await loaders.timesheets.loadMany(
            timesheetIds,
          )) as TimesheetModel[];
          if (timesheets.length !== timesheetIds.length || !timesheets) {
            throw new UserInputError('One or more timesheet does not exist');
          }
          const res = await TimesheetService.updateTimeSheetArchivedStatus({
            timesheetIds: timesheets.map((ts) => ts.id),
            archived,
          });
          return res;
        } catch (error) {
          handleResolverError(error);
          return [];
        }
      },
    ),
    stopMemberActivityTracker: withAuth(
      async (root, { memberId }, { loaders, auth: { user } }) => {
        try {
          const member = (await loaders.companyMembers.load(
            memberId,
          )) as CompanyMemberModel;

          if (!member) {
            throw new UserInputError('Member does not exist');
          }
          const company = await loaders.companies.load(member.company_id);
          if (!company) {
            throw new UserInputError('Company does not exist');
          }

          const isValid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });

          if (!isValid) {
            throw new AuthenticationError('User not in company');
          }
          const res = (await TimesheetService.stopMemberActivityTracker({
            memberId: member.id,
          })) as TimesheetModel;

          return res;
        } catch (error) {
          handleResolverError(error);
          return [];
        }
      },
    ),

    createTimesheetApprovals: async (root, { input }, { auth: { user } }) => {
      try {
        const { companyMemberId, tasksInput } = input;

        const inputPayload = [] as {
          taskId: number;
          days: { day: number; month: number; year: number; total: number };
        }[];

        for (const taskInput of tasksInput) {
          const { taskId, daysInput } = taskInput;
          const task = await getTask(taskId);

          inputPayload.push({ taskId: task.id, days: daysInput });
        }

        const member = await getCompanyMember(companyMemberId);

        const res = await TimesheetStore.createTimesheetApproval({
          memberId: member.id,
          taskInput: inputPayload,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    createCustomTimesheetApprovals: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { companyMemberId, customInput } = input;

        const inputPayload = [] as {
          customName: string;
          days: { day: number; month: number; year: number; total: number };
        }[];

        for (const ci of customInput) {
          const { customName, daysInput } = ci;

          inputPayload.push({ customName, days: daysInput });
        }

        const member = await getCompanyMember(companyMemberId);

        const res = await TimesheetStore.createTimesheetCustomApproval({
          memberId: member.id,
          customInput: inputPayload,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    updateTimesheetApprovals: async (root, { input }, { auth: { user } }) => {
      try {
        const { date, status, sheets, billable } = input;

        let taskPrivateIds = [] as number[];
        let memberPrivateIds = [] as number[];
        let dates = [] as { day: number; month: number; year: number }[];

        for (const sheet of sheets) {
          const { companyMemberId, taskId } = sheet;

          if (taskId) {
            const task = await getTask(taskId);

            taskPrivateIds.push(task.id);
          }

          if (companyMemberId) {
            const member = await getCompanyMember(companyMemberId);
            memberPrivateIds.push(member.id);
          }
        }

        const daysNumber = dayjs(date).daysInMonth();
        for (let i = 1; i <= daysNumber; i++) {
          dates.push({
            day: i,
            month: dayjs(date).month() + 1,
            year: dayjs(date).year(),
          });
        }

        const res = await TimesheetStore.updateTimesheetApprovals({
          dates,
          ...(typeof status === 'number' && {
            status,
          }),
          ...(typeof billable === 'boolean' && {
            billable: billable ? 1 : 0,
          }),
          sheets: {
            taskIds: taskPrivateIds,
            ...(memberPrivateIds?.length > 0 && {
              memberIds: memberPrivateIds,
            }),
          },
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    updateCustomTimesheetApprovals: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { date, status, sheets, billable } = input;

        let customNames = [] as string[];
        let memberPrivateIds = [] as number[];
        let dates = [] as { day: number; month: number; year: number }[];

        for (const sheet of sheets) {
          const { companyMemberId, customName } = sheet;

          customNames.push(customName);

          if (companyMemberId) {
            const member = await getCompanyMember(companyMemberId);
            memberPrivateIds.push(member.id);
          }
        }

        const daysNumber = dayjs(date).daysInMonth();
        for (let i = 1; i <= daysNumber; i++) {
          dates.push({
            day: i,
            month: dayjs(date).month() + 1,
            year: dayjs(date).year(),
          });
        }

        const res = await TimesheetStore.updateCustomTimesheetApprovals({
          dates,
          ...(typeof status === 'number' && {
            status,
          }),
          ...(typeof billable === 'boolean' && {
            billable: billable ? 1 : 0,
          }),
          sheets: {
            customNames,
            ...(memberPrivateIds?.length > 0 && {
              memberIds: memberPrivateIds,
            }),
          },
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    deleteCustomTimesheetApprovals: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { companyMemberId, customInput } = input;

        const inputPayload = [] as {
          customName: string;
          days: { day: number; month: number; year: number };
        }[];

        for (const ci of customInput) {
          const { customName, daysInput } = ci;

          inputPayload.push({ customName, days: daysInput });
        }

        const member = await getCompanyMember(companyMemberId);

        const res = await TimesheetStore.deleteCustomTimesheetApprovals({
          memberId: member.id,
          customInput: inputPayload,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
  },
  Query: {
    timesheet: withAuth(
      async (
        root,
        { timesheetId },
        { loaders, auth: { isAuthenticated, user } },
      ) => {
        try {
          if (!isAuthenticated) {
            throw new AuthenticationError('Not logged in');
          }
          const timesheet = (await loaders.timesheets.load(
            timesheetId,
          )) as TimesheetModel;
          if (!timesheet) {
            throw new UserInputError('That timesheet id does not exist');
          }
          return timesheet;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),

    timesheets: withAuth(
      async (root, { companyId, filters }, { loaders, auth: { user } }) => {
        try {
          const company = (await loaders.companies.load(
            companyId,
          )) as CompanyModel;
          if (!company) {
            throw new UserInputError('That company id does not exist');
          }
          const privateCompanyId = company.id;
          const companyMembers = (await CompanyService.getCompanyMembers(
            privateCompanyId,
          )) as CompanyMemberModel[];

          if (companyMembers.length === 0) {
            throw new UserInputError(
              'Company members does not exist for that company',
            );
          }

          const res = await TimesheetService.getTimesheetsByCompanyMemberIds({
            companyMemberIds: companyMembers.map(
              (companyMember) => companyMember.id,
            ),
            filters: filters as FilterOptionsModel,
          });
          return res;
        } catch (error) {
          handleResolverError(error);
          return [];
        }
      },
    ),
    getTimesheetsByCompanyMember: withAuth(
      async (root, { companyMemberId }, { loaders, auth: { user } }) => {
        try {
          const now = dayjs();
          const companyMember = (await loaders.companyMembers.load(
            companyMemberId,
          )) as CompanyMemberModel;
          if (!companyMember) {
            throw new UserInputError('That company member does not exist');
          }
          const res = await TimesheetService.getTimesheetByCompanyMemberId({
            companyMemberId: companyMember.id,
          });

          // console.log('end tm', dayjs().diff(now, 'ms'));
          return res;
        } catch (error) {
          handleResolverError(error);
          return [];
        }
      },
    ),
    filterTimesheet: withAuth(
      async (
        root,
        { companyMemberId, teamId },
        { loaders, auth: { user } },
      ) => {
        try {
          let companyMember, team;

          if (companyMemberId) {
            companyMember = (await loaders.companyMembers.load(
              companyMemberId,
            )) as CompanyMemberModel;
            if (!companyMember) {
              throw new UserInputError('That company member does not exist');
            }
          }
          if (teamId) {
            team = (await loaders.companyTeams.load(teamId)) as TeamModel;
            if (!team) {
              throw new UserInputError('That team does not exist');
            }
          }
          const res = await TimesheetService.filterTimesheet({
            filterBy: {
              teamId: team?.id as TeamId,
              companyMemberId: companyMember?.id as CompanyMemberId,
            },
          });
          return res;
        } catch (error) {
          handleResolverError(error);
          return [];
        }
      },
    ),

    getActivityTimeSummaryByWeek: withAuth(
      async (root, { companyId, filters }, { loaders, auth: { user } }) => {
        try {
          if (!user) {
            throw new Error('Missing user');
          }
          const { companyMemberId, taskId, week, year } = filters;

          let memberPrivateId;
          let taskPrivateId;

          if (companyMemberId) {
            const member = (await loaders.companyMembers.load(
              companyMemberId,
            )) as CompanyMemberModel;

            if (!member) {
              throw new Error('Member not found');
            }

            memberPrivateId = member.id;
          }

          if (taskId) {
            const task = (await loaders.tasks.load(taskId)) as TaskModel;

            if (!task) {
              throw new Error('Task not found');
            }
            taskPrivateId = task.id;
          }

          const company = await loaders.companies.load(companyId);

          const valid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });
          if (!valid) {
            throw new AuthenticationError('User not in company');
          }

          const res = (await TimesheetService.getActivityTimeSummaryByWeek({
            payload: {
              task_id: taskPrivateId,
              company_member_id: memberPrivateId,
              week_number: week,
              year,
            },
            userId: user?.id,
            companyId: company.id,
          })) as ActivityTrackerWeeklyModel[];

          return res;
        } catch (error) {
          throw new Error((error as Error).message);
        }
      },
    ),
    getActivityTimeSummaryByMonth: withAuth(
      async (root, { companyId, filters }, { loaders, auth: { user } }) => {
        try {
          if (!user) {
            throw new Error('Missing user');
          }

          let memberPrivateId;
          let taskPrivateId;

          const { weekNumbers, year } = filters;

          if (filters?.companyMemberId) {
            const member = (await loaders.companyMembers.load(
              filters?.companyMemberId,
            )) as CompanyMemberModel;

            if (!member) {
              throw new Error('Member not found');
            }

            memberPrivateId = member.id;
          }

          if (filters?.taskId) {
            const task = (await loaders.tasks.load(
              filters?.taskId,
            )) as TaskModel;

            if (!task) {
              throw new Error('Task not found');
            }
            taskPrivateId = task.id;
          }

          const company = await loaders.companies.load(companyId);

          const valid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });
          if (!valid) {
            throw new AuthenticationError('User not in company');
          }

          const res = (await TimesheetService.getActivityTimeSummaryByMonth({
            query: {
              task_id: taskPrivateId,
              company_member_id: memberPrivateId,
              week_number: weekNumbers,
              year,
            },
            userId: user?.id,
            companyId: company.id,
          })) as ActivityTrackerMonthlyModel[];

          return res;
        } catch (error) {
          throw new Error((error as Error).message);
        }
      },
    ),
    getMonthlyActivityTrackingByMonth: withAuth(
      async (root, { companyId, filters }, { loaders, auth: { user } }) => {
        try {
          if (!user) {
            throw new Error('Missing user');
          }

          let memberPrivateId;
          let taskPrivateId;

          const { weekNumbers, year } = filters;

          if (filters?.companyMemberId) {
            const member = (await loaders.companyMembers.load(
              filters?.companyMemberId,
            )) as CompanyMemberModel;

            if (!member) {
              throw new Error('Member not found');
            }

            memberPrivateId = member.id;
          }

          if (filters?.taskId) {
            const task = (await loaders.tasks.load(
              filters?.taskId,
            )) as TaskModel;

            if (!task) {
              throw new Error('Task not found');
            }
            taskPrivateId = task.id;
          }

          const company = await loaders.companies.load(companyId);

          const valid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });
          if (!valid) {
            throw new AuthenticationError('User not in company');
          }

          const res =
            (await TimesheetService.getActivityWeeklySummariesForMonth({
              query: {
                task_id: taskPrivateId,
                company_member_id: memberPrivateId,
                week_numbers: weekNumbers,
                year,
              },
              userId: user?.id,
              companyId: company.id,
            })) as ActivityTrackerWeeklyModel[];

          return res;
        } catch (error) {
          throw new Error((error as Error).message);
        }
      },
    ),

    getActivityTimeSummaryByDay: withAuth(
      async (root, { companyId, filters }, { loaders, auth: { user } }) => {
        try {
          if (!user) {
            throw new Error('Missing user');
          }

          let memberPrivateId;
          let taskPrivateId;

          const { day, month, year } = filters;

          if (filters?.companyMemberId) {
            const member = (await loaders.companyMembers.load(
              filters?.companyMemberId,
            )) as CompanyMemberModel;

            if (!member) {
              throw new Error('Member not found');
            }

            memberPrivateId = member.id;
          }

          if (filters?.taskId) {
            const task = (await loaders.tasks.load(
              filters?.taskId,
            )) as TaskModel;

            if (!task) {
              throw new Error('Task not found');
            }
            taskPrivateId = task.id;
          }

          const company = await loaders.companies.load(companyId);

          const valid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });
          if (!valid) {
            throw new AuthenticationError('User not in company');
          }

          const res = (await TimesheetService.getActivityTimeSummaryByDay({
            query: {
              task_id: taskPrivateId,
              company_member_id: memberPrivateId,
              day,
              month,
              year,
            },
            companyId: company.id,
            userId: user?.id,
          })) as ActivityTrackerDailyModel[];

          return res;
        } catch (error) {
          throw new Error((error as Error).message);
        }
      },
    ),
    timesheetApprovals: async (
      root,
      { companyId, memberId },
      { loaders, auth: { user } },
    ) => {
      let privateMemberId;

      const company = await getCompany(companyId);
      if (memberId) {
        const member = await getCompanyMember(memberId);
        privateMemberId = member?.id;
      }

      if (privateMemberId) {
        const res = await TimesheetStore.getTimesheetApprovals({
          memberIds: [privateMemberId],
        });

        return res;
      } else {
        const res = await TimesheetService.getTimesheetApprovalsByCompany({
          companyId: company.id,
        });

        return res;
      }
    },
    customTimesheetApprovals: async (
      root,
      { companyId, memberId },
      { loaders, auth: { user } },
    ) => {
      let privateMemberId;

      const company = await getCompany(companyId);
      if (memberId) {
        const member = await getCompanyMember(memberId);
        privateMemberId = member?.id;
      }

      if (privateMemberId) {
        const res = await TimesheetStore.getCustomTimesheetApprovals({
          memberIds: [privateMemberId],
        });

        return res;
      } else {
        const res = await TimesheetService.getCustomTimesheetApprovalsByCompany(
          {
            companyId: company.id,
          },
        );

        return res;
      }
    },
  },
};
