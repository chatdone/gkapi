import { gql } from 'apollo-server-express';

export const schema = gql`
  scalar DateTime

  ######################### DEPRECATED #########################

  input FilterOptions {
    date: DateRangeFilter
    task_member: TaskMemberFilter
    taskMember: TaskMemberFilter
    team_status: TeamStatusFilter
    project_type: TaskBoardType
    category: TaskFilterOptions
    archived: ArchivedStatus
  }

  input TaskFilterOptions {
    is_project: Boolean
  }

  input TaskBoardFiltersOptions {
    memberId: ID
  }

  input TimesheetFilterOptions {
    selectedDate: DateTime
    archived: ArchivedStatus
  }

  input WeeklyTimesheetFilterOptions {
    companyMemberId: ID
    taskId: ID
    week: Int!
    year: Int!
  }

  input MonthlyTimesheetFilterOptions {
    companyMemberId: ID
    taskId: ID
    weekNumbers: [Int]
    year: Int
  }

  input DayTimesheetFilterOptions {
    companyMemberId: ID
    taskId: ID
    day: Int!
    month: Int!
    year: Int!
  }

  input ArchivedStatus {
    status: TimesheetArchiveStatus
  }

  input TeamStatusFilter {
    sub_status_id: ID
  }

  input TaskMemberFilter {
    member_id: ID
    memberId: ID
  }

  input DateRangeFilter {
    start_date: DateTime
    end_date: DateTime
  }

  ########################################################################

  input PaginationFilter {
    limit: Int
    offset: Int
    search: String
    ids: [ID!]
  }
`;
