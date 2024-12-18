import { gql } from 'apollo-server-express';

export const schema = gql`
  scalar DateTime

  type Timesheet {
    id: ID!
    activity: TimesheetActivity

    submitted_date: DateTime
    comments: String
    location: Location

    startDate: DateTime
    endDate: DateTime
    timeTotal: Int
    companyMember: CompanyMember

    start_date: DateTime
    end_date: DateTime
    time_total: Int
    company_member: CompanyMember
    archived: TimesheetArchiveStatus
  }

  type TimesheetActivity {
    id: ID!
    task: Task
    active: Boolean
    created_at: DateTime
    updated_at: DateTime
  }

  enum TimesheetArchiveStatus {
    TRUE
    FALSE
  }

  input TimesheetEntryInput {
    startDate: DateTime
    submittedDate: DateTime
    timeTotal: Int

    start_date: DateTime! #deprecated
    submitted_date: DateTime #deprecated
    time_total: Int #deprecated
    comments: String
  }

  input UpdateTimesheetInput {
    end_date: DateTime
    endDate: DateTime
    comments: String
  }

  type ActivityDaySummary {
    company_member: CompanyMember
    task: Task
    day: Int
    total: Int
    month: Int
    year: Int
  }

  type ActivityWeekSummary {
    id: ID
    company_member: CompanyMember
    task: Task
    monday: Int
    tuesday: Int
    wednesday: Int
    thursday: Int
    friday: Int
    saturday: Int
    sunday: Int
    total_weekly: Int
    created_at: DateTime
    updated_at: DateTime
    week_number: Int
  }
  """
  Not directly from the db, it is a combination all the week numbers sent
  """
  type ActivityMonthSummary {
    company_member: CompanyMember
    task: Task
    week_number: Int
    year: Int
    # weeks: [MonthlyActivityTracking]
    week_total: Int
    total: Int
  }

  """
  Refer to activity_tracker_monthly_mv
  """
  type MonthlyActivityTracking {
    company_member: CompanyMember
    task: Task
    created_at: DateTime
    updated_at: DateTime
    week_number: Int
    week_total: Int
    year: Int
  }

  type TimesheetDayApproval {
    companyMember: CompanyMember
    task: Task
    day: Int
    total: Int
    month: Int
    year: Int
    status: TimesheetApprovalStatus
    billable: Boolean
  }

  type CustomTimesheetDayApproval {
    companyMember: CompanyMember
    customName: String
    day: Int
    total: Int
    month: Int
    year: Int
    status: TimesheetApprovalStatus
    billable: Boolean
  }

  input TimesheetDaysInput {
    day: Int!
    month: Int!
    year: Int!
    total: Int!
  }

  input DeleteTimesheetDaysInput {
    day: Int!
    month: Int!
    year: Int!
  }

  input CreateTimesheetApprovalInput {
    taskId: ID!
    daysInput: TimesheetDaysInput!
  }

  input CreateTimesheetApprovalsInput {
    companyMemberId: ID!
    tasksInput: [CreateTimesheetApprovalInput!]!
  }

  input CreateCustomTimesheetApprovalInput {
    customName: String!
    daysInput: TimesheetDaysInput!
  }

  input DeleteCustomTimesheetApprovalInput {
    customName: String!
    daysInput: DeleteTimesheetDaysInput!
  }

  input CreateCustomTimesheetApprovalsInput {
    companyMemberId: ID!
    customInput: [CreateCustomTimesheetApprovalInput!]!
  }

  input DeleteCustomTimesheetApprovalsInput {
    companyMemberId: ID!
    customInput: [DeleteCustomTimesheetApprovalInput!]!
  }

  input UpdateTimesheetApprovalInput {
    date: DateTime!
    status: TimesheetApprovalStatus
    billable: Boolean
    sheets: [TimesheetApprovalInput!]!
  }

  input TimesheetApprovalInput {
    taskId: ID!
    companyMemberId: ID
  }

  input UpdateCustomTimesheetApprovalInput {
    date: DateTime!
    status: TimesheetApprovalStatus
    billable: Boolean
    sheets: [CustomTimesheetApprovalInput!]!
  }

  input CustomTimesheetApprovalInput {
    customName: String!
    companyMemberId: ID
  }

  enum TimesheetApprovalStatus {
    REJECTED
    APPROVED
  }

  type TotalTimesheetApproval {
    day: Int
    month: Int
    year: Int
    total: Int
  }

  extend type Query {
    timesheet(timesheetId: ID!): Timesheet

    timesheets(companyId: ID!, filters: TimesheetFilterOptions): [Timesheet]
    getTimesheetsByCompanyMember(companyMemberId: ID!): [Timesheet]
    filterTimesheet(companyMemberId: ID, teamId: ID): [Timesheet]

    getActivityTimeSummaryByDay(
      companyId: ID!
      filters: DayTimesheetFilterOptions!
    ): [ActivityDaySummary]

    getActivityTimeSummaryByWeek(
      companyId: ID!
      filters: WeeklyTimesheetFilterOptions!
    ): [ActivityWeekSummary]

    getActivityTimeSummaryByMonth(
      companyId: ID!
      filters: MonthlyTimesheetFilterOptions!
    ): [ActivityMonthSummary]

    getMonthlyActivityTrackingByMonth(
      companyId: ID!
      filters: MonthlyTimesheetFilterOptions!
    ): [ActivityWeekSummary]

    timesheetApprovals(companyId: ID!, memberId: ID): [TimesheetDayApproval]
    customTimesheetApprovals(
      companyId: ID!
      memberId: ID
    ): [CustomTimesheetDayApproval]
  }

  extend type Mutation {
    createTimesheetEntry(
      taskId: ID!
      locationId: ID
      memberId: ID!
      input: TimesheetEntryInput!
    ): Timesheet
    updateTimesheet(
      timesheetId: ID!
      input: UpdateTimesheetInput!
      locationId: ID
    ): Timesheet
    updateTimeSheetArchivedStatus(
      timesheetIds: [ID!]!
      archived: TimesheetArchiveStatus!
    ): [Timesheet]

    stopMemberActivityTracker(memberId: ID!): Timesheet

    createTimesheetApprovals(
      input: CreateTimesheetApprovalsInput!
    ): [TimesheetDayApproval]

    createCustomTimesheetApprovals(
      input: CreateCustomTimesheetApprovalsInput!
    ): [CustomTimesheetDayApproval]

    deleteCustomTimesheetApprovals(
      input: DeleteCustomTimesheetApprovalsInput!
    ): [CustomTimesheetDayApproval]

    updateTimesheetApprovals(
      input: UpdateTimesheetApprovalInput!
    ): [TimesheetDayApproval]

    updateCustomTimesheetApprovals(
      input: UpdateCustomTimesheetApprovalInput!
    ): [CustomTimesheetDayApproval]
  }
`;
