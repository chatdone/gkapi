/* eslint-disable prefer-const */
import _ from 'lodash';
import dayjs from 'dayjs';
import {
  createLoaders,
  ReportStore,
  SubscriptionStore,
  CompanyStore,
  UserStore,
  WorkspaceStore,
  BillingStore,
} from '@data-access';
import {
  CompanyService,
  StripeService,
  TaskService,
  UserService,
  WorkspaceService,
} from '@services';
import { TeamModel } from '@models/team.model';
import * as ReportExportService from './report.export.service';

import {
  formatCollectionRowData,
  formatTaskReportData,
  dueDateFilterGenerator,
  collectionDueFilter,
  secondsToHoursAndMinutes,
} from './tools';
import {
  ContactModel,
  ContactPicId,
  ContactPicModel,
} from '@models/contact.model';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
  CompanyMemberPublicId,
  CompanyModel,
  CompanyTeamModel,
  CompanyTeamStatusModel,
  EmployeeTypeModel,
} from '@models/company.model';
import { UserModel } from '@models/user.model';
import { ProjectId, TaskBoardModel, TaskStatusModel } from '@models/task.model';
import { ProjectTaskReportRowModel, TaskReportRowModel } from './report.model';
import { parseMoney } from '@services/collection/util';
import tz from 'dayjs/plugin/timezone';
import { AttendanceLabelModel } from '@models/attendance.model';
import { TagModel } from '@models/tag.model';
import { TableNames } from '@db-tables';
import { WorkspaceModel } from '@models/workspace.model';
import { BillingInvoiceReportModel } from '@data-access/report/report.store';

import { ProjectGroupWithTaskModel } from '@data-access/report/report.store';
import {
  getCompanyMember,
  getCompanyMembers,
  getProjects,
  getCompanyTeam,
  getUser,
} from '@data-access/getters';
dayjs.extend(tz);

const generateTaskReport = async ({ queryParams }: { queryParams: any }) => {
  const loaders = await createLoaders();
  try {
    const {
      userId,
      companyId,
      teamIds,
      from,
      to,
      status,
      memberIds,
      picIds,
      contactIds,
      tagIds,
    } = queryParams;

    const company = (await loaders.companies.load(companyId)) as CompanyModel;
    if (!company) {
      throw new Error('Company id does not exist');
    }

    const companyTimezone = await CompanyService.getCompanyDefaultTimezone({
      companyId: company.id,
    });

    const fromDate = from
      ? dayjs(from).tz(companyTimezone).format('YYYY-MM-DDTHH:mm:ss[Z]')
      : undefined;
    const toDate = to
      ? dayjs(to).tz(companyTimezone).format('YYYY-MM-DDTHH:mm:ss[Z]')
      : undefined;

    let dueFilter = dueDateFilterGenerator({
      from: fromDate,
      to: toDate,
      timezone: companyTimezone,
    });
    let subStatusFilter = '';
    let s = '';
    let s1 = '';
    let createdAtFilter = '';
    let teamFilter = '';
    let contactFilter = '';
    let tagFilter = '';

    let privatePicIds: ContactPicId[] = [];
    let privateMemberIds: CompanyMemberId[] = [];

    const user = (await loaders.users.load(userId)) as UserModel;
    if (!user) {
      throw new Error('User id does not exist');
    }

    if (teamIds) {
      const teams = (await loaders.companyTeams.loadMany(
        teamIds,
      )) as TeamModel[];

      teamFilter = `and cards.team_id in (${teams.map((team) => team.id)})`;
    }

    if (contactIds) {
      const contacts = (await loaders.contacts.loadMany(
        contactIds,
      )) as ContactModel[];
      contactFilter = `and contact.id in (${contacts.map(
        (contactGroup) => contactGroup.id,
      )})`;
    }

    if (status) {
      if (status === 'overdue') s = 'and t.overdueAmount > 0';
      else if (status === 'pending') {
        s = 'and t.overdueAmount <= 0';
        s1 = 'and rr.status = 1';
      } else {
        s = 'and t.overdueAmount <= 0';
        s1 = 'and rr.status = 2';
      }
    }

    if (!_.isEmpty(picIds)) {
      const pics = (await loaders.contactPics.loadMany(
        picIds,
      )) as ContactPicModel[];

      privatePicIds = pics?.map((pic) => pic.id);
    }

    if (!_.isEmpty(memberIds)) {
      const members = (await loaders.companyMembers.loadMany(
        memberIds,
      )) as CompanyMemberModel[];

      privateMemberIds = members?.map((member) => member.id);
    }

    if (queryParams.subStatusId) {
      const subStatus = (await loaders.subStatuses.load(
        queryParams.subStatusId,
      )) as TaskStatusModel;

      subStatusFilter = `and cards.sub_status_id = ${subStatus.id}`;
    }
    let privateTagIds: number[] = [];
    if (!_.isEmpty(tagIds)) {
      const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];
      privateTagIds = tags.map((tag) => tag.id);

      tagFilter = `and tt.tag_id in (${privateTagIds})`;
    }

    const query = (isCount: any) => `
        select
        ${isCount ? `count(1) as 'count'` : ''}
        ${
          isCount
            ? ''
            : `
            cards.id as id, 
            cards.id_text as id_text, 
            cards.name,
            cards.created_by as createdBy,
            card_statuses.label as statusLabel, 
            cards.due_date as dueDate, 
            cards.created_at as createdAt,
            job.name as 'boardName',
            job.type as taskBoardType,
            job.category as taskBoardCategory,
            job.description as taskBoardDescription,
            job.id_text as jobIdText,
            company.name as 'companyName',
            contact.name as 'contactName',
            team.title as 'teamTitle',
            

            (
              select group_concat(tag.name separator ', ') 
              from task_tags tt
              left join tags tag on tag.id = tt.tag_id
              where tt.task_id = cards.id
              ) as "tagNames",

              (
                select group_concat(tag.color separator ', ') 
                from task_tags tt
                left join tags tag on tag.id = tt.tag_id
                where tt.task_id = cards.id
                ) as "tagColors",

            (
              select group_concat(cmu.name separator ', ') 
              from card_members cm 
              left join users cmu on cmu.id = cm.user_id
              where
              ${
                _.isEmpty(privateMemberIds)
                  ? ''
                  : `cm.member_id in (${privateMemberIds}) and`
              }
              cm.card_id = cards.id
              order by cmu.name asc
            ) as 'assignee',

            (
              select group_concat(cpu.name separator ', ') 
              from card_pics cp
              left join users cpu on cpu.id = cp.user_id
              where cp.card_id = cards.id
              ${
                _.isEmpty(privatePicIds)
                  ? ''
                  : `and cp.pic_id in (${privatePicIds})`
              }
              order by cpu.name asc
              ) as "pics"
          
            from cards`
        }
        left join ${
          TableNames.PROJECTS
        } \`job\` on cards.job_id = job.id          
        left join card_statuses on cards.sub_status_id = card_statuses.id
        left join companies as \`company\` on job.company_id = company.id
        left join contacts as \`contact\` on contact.id = job.contact_id
        left join contact_group_members cgm on cgm.contact_id = contact.id
        left join contact_groups cg on cg.id = cgm.contact_group_id
        left join teams as \`team\` on team.id = cards.team_id
        left join card_members cm on cm.card_id = cards.id
        left join card_pics cp on cp.card_id = cards.id

        left join job_members jm on jm.job_id = job.id 
        left join company_members m on m.id = jm.member_id
        left join users u on u.id = m.user_id
        left join task_tags tt on tt.task_id = cards.id
        


        where job.deleted_at is null
        and job.archived = false
        and company.id = ${company.id}
        and cards.archived = false
        and cards.deleted_at IS NULL
        and cards.published = 1

        ${
          _.isEmpty(privateMemberIds)
            ? ''
            : `and cm.member_id in (${privateMemberIds})`
        }
        ${_.isEmpty(privatePicIds) ? '' : `and cp.pic_id in (${privatePicIds})`}
        ${contactFilter}
        ${dueFilter}
        ${teamFilter}
        ${subStatusFilter}
        ${createdAtFilter}
        ${tagFilter}

        group by cards.id
        order by cards.due_date desc
        `;
    const rows = (await ReportStore.generateReport(
      query(false),
    )) as TaskReportRowModel[];

    const filterPersonal = _.filter(
      rows,
      (tb) => tb?.taskBoardType !== 'Personal' && tb?.taskBoardCategory == 0,
    );

    const member = (await CompanyService.getMemberByUserIdAndCompanyId({
      userId: user?.id,
      companyId: company?.id,
    })) as CompanyMemberModel;

    const rowsWithPermissionsV3 = await Promise.all(
      _.map(filterPersonal, async (row) => {
        const taskboard = (await loaders.taskBoards.load(
          row.jobIdText,
        )) as TaskBoardModel;

        const taskBoardFiltered = await TaskService.filterVisibleBoards({
          boards: [taskboard],
          userId: user.id,
          companyId: company.id,
        });

        if (_.isEmpty(taskBoardFiltered)) {
          return undefined;
        } else {
          return row;
        }
      }),
    );

    const tasksPermissionsV3 = rowsWithPermissionsV3.filter(
      (row) => row,
    ) as TaskReportRowModel[];

    await Promise.all(
      _.map(tasksPermissionsV3, (row, i) => {
        rows[i] = formatTaskReportData(rows[i]);
      }),
    );

    const rowsWithCompanyTimezone = tasksPermissionsV3.map((task) => {
      return {
        ...task,
        createdAt: task.createdAt
          ? dayjs(task.createdAt)
              .tz(companyTimezone)
              .format('DD MMM YYYY, h:mm a Z')
          : null,
        dueDate: task.dueDate
          ? dayjs(task.dueDate)
              .tz(companyTimezone)
              .format('DD MMM YYYY, h:mm a Z')
          : null,
      };
    });

    return rowsWithCompanyTimezone;
  } catch (error) {
    return Promise.reject(error);
  }
};

const generateCollectionReport = async ({
  queryParams,
}: {
  queryParams: any;
}) => {
  try {
    const loaders = await createLoaders();
    const {
      from,
      to,
      contactIds,
      picIds,
      status,
      memberIds,
      teamIds,
      amountMin,
      amountMax,
      userId,
      paymentType,
      responseType,
      tagIds,
    } = queryParams;

    let { companyId } = queryParams;

    const company = (await loaders.companies.load(companyId)) as CompanyModel;
    if (!company) {
      throw new Error('Company id does not exist');
    }

    const companyTimezone = await CompanyService.getCompanyDefaultTimezone({
      companyId: company.id,
    });

    let privateContactIds: number[] = [];

    const fromDate = from
      ? dayjs(from).tz(companyTimezone).format('YYYY-MM-DDTHH:mm:ss[Z]')
      : undefined;
    const toDate = to
      ? dayjs(to).tz(companyTimezone).format('YYYY-MM-DDTHH:mm:ss[Z]')
      : undefined;

    let dueFilter = collectionDueFilter(fromDate, toDate);

    //const authId = queryParams;

    const user = (await loaders.users.load(userId)) as UserModel;
    if (!user) {
      throw new Error('User id does not exist');
    }

    if (contactIds) {
      const contacts = (await loaders.contacts.loadMany(
        contactIds,
      )) as ContactModel[];

      const ids = contacts.map((c) => c.id);

      privateContactIds = privateContactIds.concat(ids);

      if (privateContactIds.length === 0) return [];
    }

    if (companyId) {
      // const queryBy = {
      //   user_id: userId,
      //   company_id: companyId,
      // };
      const companyMember = await CompanyService.getMemberByUserIdAndCompanyId({
        userId,
        companyId,
      });
      if (!companyMember) companyId = null;
    }

    let s = '';
    let s1 = '';

    if (status === 'overdue') s = 'and t.overdueAmount > 0';
    if (status === 'pending') {
      s = 'and t.overdueAmount IS NULL';
      s1 = 'and rr.status = 1';
    }
    if (status === 'paid') {
      s = 'and t.overdueAmount IS NULL';
      s1 = 'and rr.status = 2';
    }

    let paymentTypeFilter = '';
    if (paymentType) {
      paymentTypeFilter = `and rr.payment_type = ${paymentType}`;
    }

    let amountFilter = '';
    if (amountMax || amountMin) {
      if (amountMax && amountMin)
        amountFilter = `and t.payableAmount between "${amountMin}" and "${amountMax}"`;
      else if (amountMax && !amountMin)
        amountFilter = `and t.payableAmount < "${amountMax}"`;
      else amountFilter = `and t.payableAmount > "${amountMin}"`;
    }

    let assigneeIds;
    if (memberIds) {
      const assignees = (await loaders.companyMembers.loadMany(
        memberIds,
      )) as CompanyMemberModel[];
      assigneeIds = assignees.map((assignee) => assignee.id);
    }

    let privateTeamIds;
    if (teamIds) {
      const teams = (await loaders.companyTeams.loadMany(
        teamIds,
      )) as CompanyTeamModel[];
      privateTeamIds = teams.map((team) => team.id);
    }

    let tagFilter = '';

    let privateTagIds: number[] = [];
    if (!_.isEmpty(tagIds)) {
      const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];
      privateTagIds = tags.map((tag) => tag.id);

      tagFilter = `and ct.tag_id in (${privateTagIds})`;
    }

    const query = `
    select t.*, IF(overdueAmount > 0, true, false) as 'overdue'
    from (
                select
                rr.id,
                rr.notify_pics,
                rr.ref_no as 'refNo', 
                rr.title as 'title', 
                c.name as 'collector',
                rr.payable_amount as 'payableAmount', 
                rr.payment_type as payment_type,
          (select sum(amount) from receivable_periods where receivable_id = rr.id and status = 2) as 'paidAmount',
          (select sum(amount) from receivable_periods where receivable_id = rr.id and status != 2 and date(due_date) < date(now())) as 'overdueAmount',
                rr.remind_type as 'remindType', 
                rr.status as 'status', 
                rr.due_date as 'dueDate',
                rr.created_at as 'createdAt',
                (
                  select group_concat(tag.name separator ', ') 
                  from collection_tags ct
                  left join tags tag on tag.id = ct.tag_id
                  where ct.collection_id = rr.id
                  ) as "tagNames",
                  (
                    select group_concat(tag.color separator ', ') 
                    from collection_tags ct
                    left join tags tag on tag.id = ct.tag_id
                    where ct.collection_id = rr.id
                    ) as "tagColors",

                IFNULL(t.title, GROUP_CONCAT(IFNULL(ccmu.name, ccmu.email) SEPARATOR ", ")) as 'assignee',

                GROUP_CONCAT(IFNULL(ccmu.name, ccmu.email) SEPARATOR ", ")  as 'members',

                t.title as 'team',
                mu.name as 'member',

								t.id as 'teamId',
								t.deleted_at as 'teamDeleted',
								ccmu.id as 'companyMemberId',
								ccmu.name as 'companyMemberName',
								ccmu.email as 'companyMemberEmail',

                cg.name as 'contactGroupName'
    
                from receivable_reminders rr
                left join contacts c on c.id = rr.contact_id
                left join contact_group_members cgm on cgm.contact_id = c.id
                left join contact_groups cg on cg.id = cgm.contact_group_id
                left join companies com on com.id = c.company_id
                left join company_members cm on cm.company_id = com.id
                left join collectors coll on coll.id = rr.contact_id
                left join collectors_members colm on colm.collector_id = coll.id
                left join company_members ccm on ccm.id = colm.member_id
                left join users ccmu on ccmu.id = ccm.user_id
                left join teams t on t.id = coll.team_id
                left join company_members m on m.id = coll.member_id
                left join users mu on mu.id = m.user_id
                left join collection_tags ct on ct.collection_id = rr.id
            where cm.user_id = ${
              user ? user.id : ''
            } and cm.type in (1, 2, 3) and rr.is_draft = false and rr.active = true and rr.deleted_at is null AND cm.deleted_at is null
            ${company ? `and com.id = ${company.id}` : ''}
            ${dueFilter}
            ${
              _.isEmpty(assigneeIds)
                ? ''
                : `and colm.member_id in (${assigneeIds})`
            }
            ${privateTeamIds ? `and coll.team_id in (${privateTeamIds})` : ''}
            ${
              _.isEmpty(privateContactIds)
                ? ''
                : `and rr.contact_id in (${privateContactIds})`
            }
            ${paymentTypeFilter}
            ${tagFilter}
        
            ${s1}
            ${
              !_.isEmpty(picIds)
                ? `and (
                  ${_.join(
                    _.map(
                      picIds,
                      (pid, index: number) =>
                        `${
                          index === 0 ? '' : 'or'
                        } JSON_CONTAINS(rr.notify_pics, "${pid}", '$')`,
                    ),
                    '',
                  )}
                  )`
                : ''
            }
            group by rr.id
          ) t
          where true
          ${s}
          ${amountFilter}
          `;

    const rows = (await ReportStore.generateReport(query)) as any;

    await Promise.all(
      _.map(rows, async (row, i) => {
        const { status: sts, overdue, remindType, payment_type } = row;
        if (overdue) {
          rows[i].status = 'Overdue';
        } else if (sts === 1) {
          rows[i].status = 'Pending';
        } else if (sts === 2) {
          rows[i].status = 'Paid';
        }

        if (remindType === 1) {
          rows[i].remindType = 'Full Amount';
        } else if (remindType === 2) {
          rows[i].remindType = 'Instalment';
        }

        if (responseType !== 'json') {
          if (payment_type === 1) {
            rows[i].paymentTypeLabel = 'SenangPay';
          } else {
            rows[i].paymentTypeLabel = 'Manual';
          }
        }

        let pics: ContactPicModel[] = [];
        const picIds = rows[i].notify_pics
          ? JSON.parse(rows[i].notify_pics)
          : '';

        if (picIds.length !== 0)
          pics = (await loaders.contactPics.loadMany(
            picIds,
          )) as ContactPicModel[];

        rows[i].notify_pics =
          pics.length !== 0
            ? pics
                .map((pic) => pic?.name)
                .toString()
                .replace(',', ', ')
            : '-';

        //   rows[i].paidAmount = parseMoney(row.paidAmount);
        //   rows[i].overdueAmount = parseMoney(row.overdueAmount);

        rows[i] = formatCollectionRowData(rows[i]);
      }),
    );

    const rowsWithCompanyTimezone = rows.map((collection: any) => {
      const dueDate = dayjs(collection?.dueDate)
        .tz(companyTimezone)
        .format('YYYY-MM-DD HH:mm:ss');

      return {
        ...collection,
        createdAt: collection.createdAt
          ? dayjs(collection.createdAt)
              .tz(companyTimezone)
              .format('DD MMM YYYY, h:mm a Z')
          : null,
        dueDate: !dueDate.includes('Invalid')
          ? dayjs(collection?.dueDate)
              .tz(companyTimezone)
              .format('DD MMM YYYY, Z')
          : null,
      };
    });

    return rowsWithCompanyTimezone;
  } catch (error) {
    return Promise.reject(error);
  }
};

const generateProjectTasksReport = async ({
  companyId,
  queryParams,
}: {
  companyId: CompanyId;
  queryParams: any;
}) => {
  const loaders = createLoaders();
  const {
    start,
    end,
    actualStart,
    actualEnd,
    projectedCostMin,
    projectedCostMax,
    actualCostMin,
    actualCostMax,
    teamIds,
    memberIds,
    subStatusId,
    contactIds,
    userId,
    projectIds,
    projectOwnerIds,
    tagIds,
    isGroupByProject,
  } = queryParams;

  const user = (await loaders.users.load(userId)) as UserModel;

  const company = (await loaders.companies.load(companyId)) as CompanyModel;

  let privateTeamIds: number[] = [];
  let memberIdsInTeams: number[] = [];

  if (teamIds) {
    const teams = (await loaders.companyTeams.loadMany(
      teamIds,
    )) as CompanyTeamModel[];

    await Promise.all(
      _.map(teams, async (team) => {
        const membersInTeam = (await CompanyService.getCompanyTeamMembers(
          team.id,
        )) as CompanyMemberModel[];

        _.map(membersInTeam, (member) => {
          memberIdsInTeams.push(member.id);
        });
      }),
    );

    if (!_.isEmpty(teams)) {
      privateTeamIds = teams.map((team) => team.id);
    }
  }

  let privateMemberIds: number[] = [];
  if (memberIds) {
    const members = (await loaders.companyMembers.loadMany(
      memberIds,
    )) as CompanyMemberModel[];

    if (!_.isEmpty(members)) {
      privateMemberIds = members.map((member) => member.id);
    }
  }

  let privateContactIds: number[] = [];
  if (contactIds) {
    const contacts = (await loaders.contacts.loadMany(
      contactIds,
    )) as ContactModel[];

    if (!_.isEmpty(contacts)) {
      privateContactIds = contacts.map((contact) => contact.id);
    }
  }

  let privateSubStatusId: number | undefined;
  if (subStatusId) {
    const subStatus = (await loaders.teamStatuses.load(
      subStatusId,
    )) as CompanyTeamStatusModel;
    if (subStatus) {
      privateSubStatusId = subStatus.id;
    }
  }

  let privateProjectIds: number[] = [];
  if (projectIds) {
    const taskBoards = (await loaders.taskBoards.loadMany(
      projectIds,
    )) as TaskBoardModel[];

    if (!_.isEmpty(taskBoards)) {
      privateProjectIds = taskBoards.map((project) => project.id);
    }
  }

  let privateProjectOwnerIds: CompanyMemberId[] = [];
  if (projectOwnerIds) {
    const members = (await loaders.companyMembers.loadMany(
      projectOwnerIds,
    )) as CompanyMemberModel[];

    if (!_.isEmpty(members)) {
      privateProjectOwnerIds = members.map((member) => member.id);
    }
  }

  let privateTagIds: number[] = [];
  if (!_.isEmpty(tagIds)) {
    const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];
    privateTagIds = tags.map((tag) => tag.id);
  }

  try {
    const companyTimezone = await CompanyService.getCompanyDefaultTimezone({
      companyId,
    });

    const memberIdsInTasks = _.uniq([...privateMemberIds, ...memberIdsInTeams]);
    let rows: any = [];
    if (isGroupByProject === 'true') {
      rows = await ReportStore.generateProjectsReports({
        companyId,
        timezone: companyTimezone,
        start,
        end,
        actualEnd,
        actualStart,
        subStatusId: privateSubStatusId,
        contactIds: privateContactIds,
        memberIds: memberIdsInTasks,
        teamIds: privateTeamIds,
        projectIds: privateProjectIds,
        actualCostMax,
        actualCostMin,
        projectedCostMax,
        projectedCostMin,
        projectOwnerIds: privateProjectOwnerIds,
        tagIds: privateTagIds,
      });
    } else if (!process.env.TASK_UNIFICATION) {
      rows = await ReportStore.generateProjectTasksReports({
        companyId,
        timezone: companyTimezone,
        start,
        end,
        actualEnd,
        actualStart,
        subStatusId: privateSubStatusId,
        contactIds: privateContactIds,
        memberIds: memberIdsInTasks,
        teamIds: privateTeamIds,
        projectIds: privateProjectIds,
        actualCostMax,
        actualCostMin,
        projectedCostMax,
        projectedCostMin,
        projectOwnerIds: privateProjectOwnerIds,
        tagIds: privateTagIds,
      });
    } else {
      rows = await ReportStore.generateProjectTasksUnificationReports({
        companyId,
        timezone: companyTimezone,
        start,
        end,
        actualEnd,
        actualStart,
        subStatusId: privateSubStatusId,
        contactIds: privateContactIds,
        memberIds: memberIdsInTasks,
        teamIds: privateTeamIds,
        projectIds: privateProjectIds,
        actualCostMax,
        actualCostMin,
        projectedCostMax,
        projectedCostMin,
        projectOwnerIds: privateProjectOwnerIds,
        tagIds: privateTagIds,
      });
    }

    const rowsWithPermissionsV3 = await Promise.all(
      _.map(rows, async (row) => {
        const taskboard = (await loaders.taskBoards.load(
          row.projectId,
        )) as TaskBoardModel;

        const taskBoardFiltered = await TaskService.filterVisibleBoards({
          boards: [taskboard],
          userId: user.id,
          companyId: company.id,
        });

        if (_.isEmpty(taskBoardFiltered)) {
          return undefined;
        } else {
          return row;
        }
      }),
    );

    const tasksPermissionsV3 = rowsWithPermissionsV3.filter(
      (row) => row,
    ) as ProjectTaskReportRowModel[];

    const rowsWithTimezone = await Promise.all(
      tasksPermissionsV3.map(async (task) => {
        const effortSpentHoursMinutes = secondsToHoursAndMinutes(
          +task?.effort_spent,
        );

        return {
          ...task,
          effort_spent: effortSpentHoursMinutes,
          effort_spent_minutes: ~~(+task?.effort_spent / 60),
        };
      }),
    );

    const allTaskIds = tasksPermissionsV3.map((task) => {
      return task?.id;
    });

    const uniqTaskIds = _.uniq(allTaskIds);

    const totalTest = await TaskService.totalProjectedAndActualCostByTaskIds({
      taskIds: uniqTaskIds,
    });

    //TODO: Can just add it in the generate report func
    const subTotalObject = {
      effort_spent: '',
      effort_spent_minutes: 0,
      actual_cost: parseMoney(totalTest?.actual || 0),
      projected_cost: parseMoney(totalTest?.projected || 0),
      assignee: 'SUBTOTAL',
    };

    // const subTotalTime = rowsWithTimezone.reduce((current, all) => {
    //   const effortSpentHoursMinutes = secondsToHoursAndMinutes(
    //     (current.effort_spent_minutes + all.effort_spent_minutes) * 60,
    //   );

    //   current.effort_spent = effortSpentHoursMinutes;
    //   current.effort_spent_minutes += all.effort_spent_minutes;

    //   return current;
    // }, subTotalObject);

    return [...rowsWithTimezone];
  } catch (error) {
    return Promise.reject(error);
  }
};

const generateTasksReport = async ({
  companyId,
  queryParams,
}: {
  companyId: CompanyId;
  queryParams: any;
}) => {
  const loaders = createLoaders();
  const {
    start,
    end,
    actualStart,
    actualEnd,
    projectedCostMin,
    projectedCostMax,
    actualCostMin,
    actualCostMax,
    teamIds,
    memberIds,
    subStatusId,
    contactIds,
    userId,
    projectIds,
    projectOwnerIds,
    tagIds,
  } = queryParams;

  const user = (await loaders.users.load(userId)) as UserModel;

  const company = (await loaders.companies.load(companyId)) as CompanyModel;

  let privateTeamIds: number[] = [];
  let memberIdsInTeams: number[] = [];

  if (teamIds) {
    const teams = (await loaders.companyTeams.loadMany(
      teamIds,
    )) as CompanyTeamModel[];

    await Promise.all(
      _.map(teams, async (team) => {
        const membersInTeam = (await CompanyService.getCompanyTeamMembers(
          team.id,
        )) as CompanyMemberModel[];

        _.map(membersInTeam, (member) => {
          memberIdsInTeams.push(member.id);
        });
      }),
    );

    if (!_.isEmpty(teams)) {
      privateTeamIds = teams.map((team) => team.id);
    }
  }

  let privateMemberIds: number[] = [];
  if (memberIds) {
    const members = (await loaders.companyMembers.loadMany(
      memberIds,
    )) as CompanyMemberModel[];

    if (!_.isEmpty(members)) {
      privateMemberIds = members.map((member) => member.id);
    }
  }

  let privateContactIds: number[] = [];
  if (contactIds) {
    const contacts = (await loaders.contacts.loadMany(
      contactIds,
    )) as ContactModel[];

    if (!_.isEmpty(contacts)) {
      privateContactIds = contacts.map((contact) => contact.id);
    }
  }

  let privateSubStatusId: number | undefined;
  if (subStatusId) {
    const subStatus = (await loaders.teamStatuses.load(
      subStatusId,
    )) as CompanyTeamStatusModel;
    if (subStatus) {
      privateSubStatusId = subStatus.id;
    }
  }

  let privateProjectIds: number[] = [];
  if (projectIds) {
    const taskBoards = (await loaders.taskBoards.loadMany(
      projectIds,
    )) as TaskBoardModel[];

    if (!_.isEmpty(taskBoards)) {
      privateProjectIds = taskBoards.map((project) => project.id);
    }
  }

  let privateProjectOwnerIds: CompanyMemberId[] = [];
  if (projectOwnerIds) {
    const members = (await loaders.companyMembers.loadMany(
      projectOwnerIds,
    )) as CompanyMemberModel[];

    if (!_.isEmpty(members)) {
      privateProjectOwnerIds = members.map((member) => member.id);
    }
  }

  let privateTagIds: number[] = [];
  if (!_.isEmpty(tagIds)) {
    const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];
    privateTagIds = tags.map((tag) => tag.id);
  }

  try {
    const companyTimezone = await CompanyService.getCompanyDefaultTimezone({
      companyId,
    });

    const memberIdsInTasks = _.uniq([...privateMemberIds, ...memberIdsInTeams]);

    const tasks = await ReportStore.generateTasksReports({
      companyId,
      timezone: companyTimezone,
      start,
      end,
      actualEnd,
      actualStart,
      subStatusId: privateSubStatusId,
      contactIds: privateContactIds,
      memberIds: memberIdsInTasks,
      teamIds: privateTeamIds,
      projectIds: privateProjectIds,
      actualCostMax,
      actualCostMin,
      projectedCostMax,
      projectedCostMin,
      projectOwnerIds: privateProjectOwnerIds,
      tagIds: privateTagIds,
    });

    const rowsWithPermissionsV3 = await Promise.all(
      _.map(tasks, async (row) => {
        const taskboard = (await loaders.taskBoards.load(
          row.projectId,
        )) as TaskBoardModel;

        const taskBoardFiltered = await TaskService.filterVisibleBoards({
          boards: [taskboard],
          userId: user.id,
          companyId: company.id,
        });

        if (_.isEmpty(taskBoardFiltered)) {
          return undefined;
        } else {
          return row;
        }
      }),
    );

    const tasksPermissionsV3 = rowsWithPermissionsV3.filter(
      (row) => row,
    ) as ProjectTaskReportRowModel[];

    const rowsWithTimezone = await Promise.all(
      tasksPermissionsV3.map(async (task) => {
        const effortSpentHoursMinutes = secondsToHoursAndMinutes(
          +task?.effort_spent,
        );

        return {
          ...task,
          effort_spent: effortSpentHoursMinutes,
          effort_spent_minutes: ~~(+task?.effort_spent / 60),
        };
      }),
    );

    const allTaskIds = tasksPermissionsV3.map((task) => {
      return task?.id;
    });

    const uniqTaskIds = _.uniq(allTaskIds);

    const totalTest = await TaskService.totalProjectedAndActualCostByTaskIds({
      taskIds: uniqTaskIds,
    });

    //TODO: Can just add it in the generate report func
    const subTotalObject = {
      effort_spent: '',
      effort_spent_minutes: 0,
      actual_cost: parseMoney(totalTest?.actual || 0),
      projected_cost: parseMoney(totalTest?.projected || 0),
      assignee: 'SUBTOTAL',
    };

    const subTotalTime = rowsWithTimezone.reduce((current, all) => {
      const effortSpentHoursMinutes = secondsToHoursAndMinutes(
        (current.effort_spent_minutes + all.effort_spent_minutes) * 60,
      );

      current.effort_spent = effortSpentHoursMinutes;
      current.effort_spent_minutes += all.effort_spent_minutes;

      return current;
    }, subTotalObject);

    return [...rowsWithTimezone, subTotalTime];
  } catch (error) {
    return Promise.reject(error);
  }
};

const generateAttendanceReport = async ({
  companyId,
  queryParams,
}: {
  companyId: CompanyId;
  queryParams: any;
}) => {
  const loaders = createLoaders();
  const {
    teamIds,
    memberIds,
    startDate,
    endDate,
    attendanceLabelIds,
    intervalType,
    employeeTypeId,
    overtimeFlag,
    tagIds,
    contactIds,
  } = queryParams;

  try {
    let privateTeamIds: number[] = [];
    if (teamIds) {
      const teams = (await loaders.companyTeams.loadMany(
        teamIds,
      )) as CompanyTeamModel[];

      if (!_.isEmpty(teams)) {
        privateTeamIds = teams.map((team) => team.id);
      }
    }
    let privateMemberIds: number[] = [];
    if (memberIds) {
      const members = (await loaders.companyMembers.loadMany(
        memberIds,
      )) as CompanyMemberModel[];

      if (!_.isEmpty(members)) {
        privateMemberIds = members.map((member) => member.id);
      }
    }

    let privateEmployeeTypeId = 0;
    if (employeeTypeId) {
      const employeeType = (await loaders.employeeTypes.load(
        employeeTypeId,
      )) as EmployeeTypeModel;

      if (employeeType) {
        privateEmployeeTypeId = employeeType.id as number;
      }
    }

    let privateAttendanceLabelIds: number[] = [];
    if (attendanceLabelIds) {
      const attendanceLabels = (await loaders.attendanceLabels.loadMany(
        attendanceLabelIds,
      )) as AttendanceLabelModel[];

      if (!_.isEmpty(attendanceLabels)) {
        privateAttendanceLabelIds = attendanceLabels.map(
          (attendanceLabel) => attendanceLabel.id,
        );
      }
    }

    let privateTagIds: number[] = [];
    if (!_.isEmpty(tagIds)) {
      const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];
      privateTagIds = tags.map((tag) => tag.id);
    }

    let privateContactIds: number[] = [];
    if (!_.isEmpty(contactIds)) {
      const contacts = (await loaders.contacts.loadMany(
        contactIds,
      )) as ContactModel[];
      privateContactIds = contacts.map((contact) => contact.id);
    }

    const attendanceReportRows = await ReportStore.generateAttendanceReport({
      memberIds: privateMemberIds,
      companyId,
      overtimeFlag,
      startDate,
      endDate,
      attendanceLabelIds: privateAttendanceLabelIds,
      employeeTypeId: privateEmployeeTypeId,
      contactIds: privateContactIds,
      tagIds: privateTagIds,
    });

    return attendanceReportRows;
  } catch (error) {
    return Promise.reject(error);
  }
};

const generatePaymentTransactionsReport = async ({
  queryParams,
}: {
  queryParams: { user: UserModel };
}) => {
  try {
    const { user } = queryParams;
    const invoices = await StripeService.getCustomerInvoices(user?.customer_id);
    const paymentTransactions = _.map(invoices, (invoice) => {
      return {
        invoice_no: invoice?.number,
        date: dayjs
          .unix(invoice?.status_transitions?.paid_at || 0)
          .format('DD MMM YYYY h:mm:ss A'),
        status: invoice?.status,
        price: invoice?.amount_paid,
        currency: invoice?.currency,
      };
    });

    return paymentTransactions;
  } catch (error) {
    return Promise.reject(error);
  }
};

const generateActiveTrialSubscriptionCompaniesReport = async () => {
  try {
    const loaders = createLoaders();

    const trialSubscriptions =
      await SubscriptionStore.getActiveTrialSubscriptions();

    const companyIds = trialSubscriptions.map((sub) => sub.companyId);
    const companies = (await loaders.companies.loadMany(
      companyIds,
    )) as CompanyModel[];

    const promises = companies.map(async (company) => {
      const companySubs = trialSubscriptions
        .filter((sub) => sub.companyId === company.id)
        .map((sub) => ({
          title: sub.packageTitle,
          startDate: sub.startDate,
          endDate: sub.endDate,
        }));

      const companyMembers = (await CompanyStore.getCompanyMembers(
        company.id,
      )) as CompanyMemberModel[];
      const users = (await Promise.all(
        companyMembers.map((member) => UserStore.getUser(member.user_id)),
      )) as UserModel[];
      const emails = users.map((user) => user.email);

      return {
        name: company.name,
        subscriptions: companySubs,
        emails: emails,
      };
    });

    const result = await Promise.all(promises);

    return result;
  } catch (error) {
    return Promise.reject(error);
  }
};

type SqlAccountModel = {
  docDate: string;
  docNo: string;
  code: string;
  companyName: string;
  terms: string;
  descriptionHdr: string;
  seq: string;
  account: string;
  descriptionDtl: string;
  qty: string;
  uom: string;
  unitPrice: string;
  disc: string;
  tax: string;
  taxInclusive: string;
  taxAmt: string;
  amount: string;
  remark1: string;
};

const generateInvoicesReport = async ({
  companyId,
  queryParams,
}: {
  companyId: CompanyId;
  queryParams: any;
}) => {
  try {
    const { start, end, workspaceIds } = queryParams;

    let workspacePrivateIds: number[] = [];
    if (!_.isEmpty(workspaceIds)) {
      const w = (await WorkspaceStore.getWorkspacesByIds(
        workspaceIds,
      )) as WorkspaceModel[];
      workspacePrivateIds = w.map((w) => w.id);
    }

    const rows = (await ReportStore.generateInvoiceReport({
      start,
      end,
      workspaceIds: workspacePrivateIds,
      companyId,
    })) as BillingInvoiceReportModel[];

    const loaders = createLoaders();

    let sqlAccountArr: SqlAccountModel[] = [];

    const res = await Promise.all(
      _.map(rows, async (row) => {
        const items = await BillingStore.getBillingInvoiceItemsByInvoiceId(
          row.id,
        );

        const totalBilled = items.reduce((acc, item) => {
          const discountAmount = item.amount * (item.discountPercentage / 100);
          const discountedAmount = item.amount - discountAmount;

          const taxAmount = discountedAmount * (item.taxPercentage / 100);
          const billedAmount = discountedAmount + taxAmount;

          return acc + billedAmount;
        }, 0);

        const totalBilledFixed = totalBilled.toFixed(2);

        const balanceDue = (totalBilled - (+row.totalReceived || 0)).toFixed(2);

        let terms = '';

        if (+row.terms === 0) {
          terms = 'On due';
        } else {
          terms = `${row.terms} days`;
        }

        const pic = (await loaders.contactPics.load(
          row.picId,
        )) as ContactPicModel;
        const contact = (await loaders.contacts.load(
          pic.contactId,
        )) as ContactModel;

        const isVoided = row.void;

        items.map((item, index) => {
          const discountedAmount =
            item.amount * (item.discountPercentage / 100);
          const billedAmount = item.amount - discountedAmount;
          const taxAmount = billedAmount * (item.taxPercentage / 100);

          const r = {
            docDate: dayjs(row.docDate).format('DD/MM/YYYY'),
            docNo: row.DocumentNo,
            code: contact.account_code,
            companyName: contact.name,
            terms: terms,
            descriptionHdr: item.descriptionHdr,
            seq: (index + 1).toString(),
            account: row.companyAccountCode,
            descriptionDtl: item.descriptionDtl,
            qty: item.qty.toString(),
            uom: item.uom,
            unitPrice: item.unitPrice.toString(),
            disc: discountedAmount.toFixed(2).toString(),
            tax: item.tax,
            taxInclusive: item.taxInclusive ? '1' : '0',
            taxAmt: taxAmount.toFixed(2).toString(),
            amount: isVoided ? '0.00' : billedAmount.toFixed(2).toString(),
            remark1: row.remarks,
          };

          sqlAccountArr.push(r);
        });

        return {
          date: row.docDate,
          reference: row.DocumentNo,
          customer: row.picName,
          billed: isVoided ? '0.00' : totalBilledFixed,
          balance: isVoided ? '0.00' : balanceDue,
        };
      }),
    );

    return { rows: res, sqlAccountArr };
  } catch (error) {
    return Promise.reject(error);
  }
};

export type ReportTypeService = 'project' | 'assignee' | 'team';

type ProjectsAssigneeTeamReportQueryModel = {
  reportType: ReportTypeService;
  company: CompanyModel;
  dateRange?: [string, string]; //Targeted date range
  projectIds?: string[];
  assigneeId?: string;
  teamId?: string;
  projectOwnerIds?: CompanyMemberPublicId[];
  generatedByUser: UserModel;
};

export type ReportQueryModelV2 = {
  projectId: ProjectId;
  projectName: string;
  assigneeName: string;
  teamName: string;
  customColumnNames?: { name: string; type: number }[];
  projectGroups: ProjectGroupWithTaskModel[];
  projectOwnerNames: string;
};

const generateReport = async (
  queryParams: ProjectsAssigneeTeamReportQueryModel,
): Promise<ReportQueryModelV2[]> => {
  try {
    const {
      reportType,
      company,
      dateRange,
      projectIds,
      assigneeId,
      teamId,
      projectOwnerIds,
      generatedByUser,
    } = queryParams;

    const companyTimezone = await CompanyService.getCompanyDefaultTimezone({
      companyId: company.id,
    });

    const rows: ReportQueryModelV2[] = [];

    let memberIds: CompanyMemberId[] = [];

    const member = assigneeId ? await getCompanyMember(assigneeId) : undefined;

    let assigneeName = '';

    const team = teamId ? await getCompanyTeam(teamId) : undefined;

    let teamName = '';

    if (member && member?.id) {
      memberIds = [member.id];
      const user = (await UserService.getUser(member?.userId)) as UserModel;
      assigneeName = user?.name || user?.email;
    }

    if (team && team?.id) {
      const teamMembers = (await CompanyService.getCompanyTeamMembers(
        team?.id,
      )) as CompanyMemberModel[];
      teamName = team.title;
      memberIds = teamMembers.map((tm) => tm.id);
    }

    let projectPrivateIds = [] as number[];

    let projectOwnerPrivateIds = [] as number[];

    if (projectOwnerIds && !_.isEmpty(projectOwnerIds)) {
      const projectOwners = await getCompanyMembers(projectOwnerIds);

      projectOwnerPrivateIds = projectOwners.map((po) => po.id);
    }

    const projects =
      !_.isEmpty(projectIds) && projectIds
        ? await getProjects(projectIds)
        : await WorkspaceStore.getProjectsByCompanyId(company.id);

    projectPrivateIds = projects.map((p) => p?.id);

    const filteredProjects = await TaskService.filterVisibleBoards({
      boards: projects,
      userId: generatedByUser.id,
      companyId: company?.id,
    });

    for (const project of filteredProjects) {
      const workspace = await WorkspaceService.getWorkspaceByProjectId(
        project.id,
      );

      if (!_.isUndefined(workspace)) {
        const filteredWorkspace =
          await WorkspaceService.filterVisibleWorkspaces({
            workspaces: [workspace],
            userId: generatedByUser.id,
            companyId: company.id,
          });

        if (_.isEmpty(filteredWorkspace)) {
          continue;
        }
      }

      const projectId = project?.id;
      const projectName = project?.name;
      const projectOwners = await WorkspaceStore.getProjectOwners(project.id);
      const projectOwnerNames = projectOwners
        .map((po) => po?.name || po?.email)
        .join(', ');

      const projectGroups = await ReportStore.getProjectGroupsWithTasks({
        projectId: project.id,
        timezone: companyTimezone,
        dateRange,
        projectOwnerIds: projectOwnerPrivateIds,
        memberIds,
        userId: generatedByUser.id,
        companyId: company.id,
      });

      const filteredGroupsWithTasks = projectGroups.filter((pg) => {
        return pg?.tasks?.length > 0;
      });
      const customColumnNames: { name: string; type: number }[] = [];
      for (const group of filteredGroupsWithTasks) {
        const names = await ReportStore.getGroupColumnNames(
          group.projectGroupId,
        );

        for (const name of names) {
          customColumnNames.push({ name: name?.name, type: name?.type });
        }
      }

      rows.push({
        projectId,
        projectName,
        customColumnNames: customColumnNames,
        projectGroups: filteredGroupsWithTasks,
        projectOwnerNames,
        assigneeName,
        teamName,
      });
    }

    const filteredRows = rows
      .filter((r) => !_.isEmpty(r?.projectGroups))
      .filter(
        (r) => r.projectGroups.filter((pg) => !_.isEmpty(pg.tasks)).length > 0,
      )
      .filter((r) => projectPrivateIds.includes(r.projectId));

    if (reportType !== 'project') {
      const customActivitiesAsProject = await ReportStore.getCustomActivities({
        dateRange,
        memberIds,
      });

      if (customActivitiesAsProject) {
        const customProject = {
          projectId: 12454679,
          projectName: 'Custom Activities',
          projectGroups: [customActivitiesAsProject],
          projectOwnerNames: '',
          assigneeName,
          teamName,
        };

        return [...filteredRows, customProject];
      }
    }

    return filteredRows;
  } catch (error) {
    return Promise.reject(error);
  }
};

const exportFunctions = {
  ...ReportExportService,
  generateTaskReport,
  generateCollectionReport,
  generateAttendanceReport,
  generateProjectTasksReport,
  generatePaymentTransactionsReport,
  generateTasksReport,
  generateInvoicesReport,
  generateActiveTrialSubscriptionCompaniesReport,
  generateReport,
};

export default exportFunctions;
