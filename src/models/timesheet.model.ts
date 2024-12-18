import { CompanyMemberId } from './company.model';
import { LocationId } from './location.model';
import { TaskId } from './task.model';
import { TeamId } from './team.model';
import { UserId } from './user.model';

export type TimesheetId = number;
export type TimesheetPublicId = string;
export type TimesheetActivityId = number;
export type TimesheetActivityPublicId = string;
export type ActivityTrackerWeeklyId = number;
export type ActivityTrackerMonthlyId = number;
export type ActivityTrackerDailyId = number;

export type TimesheetModel = {
  id: TimesheetId;
  id_text: TimesheetPublicId;
  company_member_id: CompanyMemberId;
  activity_id: TimesheetActivityId;
  start_date: string;
  end_date: string;
  submitted_date: string;
  comments: string;
  location_id: LocationId;
  time_total: number;
  created_at: string;
  updated_at: string;
  taskId?: TaskId;
  actualEffort?: TaskId;
};

export type TimesheetActivityModel = {
  id: TimesheetActivityId;
  task_id: TaskId;
  active: boolean;
  created_at: string;
  updated_at: string;
  id_text: TimesheetActivityPublicId;
};

export type TimesheetEntryPayload = {
  start_date: string;
  activity_id: TimesheetActivityId;
  submitted_date?: string;
  comments?: string;
  location_id?: LocationId;
  company_member_id: CompanyMemberId;
};

export type UpdateTimesheetPayload = {
  end_date?: string;
  comments?: string;
  location_id?: LocationId;
};

export type TimeSheetFilterOptions = {
  teamId: TeamId;
  companyMemberId: CompanyMemberId;
};

export type ActivityTrackerWeeklyModel = {
  id: ActivityTrackerWeeklyId;
  company_member_id: CompanyMemberId;
  week_number: number;
  year: number;
  task_id: TaskId;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  total_weekly: number;
  created_at: string;
  updated_at: string;
};

export type ActivityTrackerMonthlyModel = {
  id: ActivityTrackerMonthlyId;
  company_member_id: CompanyMemberId;
  task_id: TaskId;
  week_number: number;
  year: number;
  week_total: number;
  created_at: string;
  updated_at: string;
  total: number;
};

export type ActivityTrackerActualMonthlyModel = {
  company_member_id: CompanyMemberId;
  task_id: TaskId;
  year: number;

  // weeks: ActivityTrackerMonthlyModel[];
  total: number;
};

export type ActivityTrackerDailyModel = {
  id: ActivityTrackerDailyId;
  company_member_id: CompanyMemberId;
  task_id: TaskId;
  day: number;
  month: number;
  year: number;
  total: number;
  created_at: string;
  updated_at: string;
};

export type TimeTrackedModel = {
  total: number;
  day: number;
  month: number;
  year: number;
};

export type TimeTrackedWeeklyModel = {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
};

export type TimeTrackedWeeklyPayload = {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;

  week_number: number;
  year: number;
};

export interface ActivityTrackerWeeklyQuery {
  task_id?: TaskId;
  company_member_id?: CompanyMemberId;
  week_number: number;
  year: number;
}

export interface ActivityTrackerWeeklySummariesForMonthQuery {
  task_id?: TaskId;
  company_member_id?: CompanyMemberId;
  week_numbers: number[];
  year: number;
}

export interface ActivityTrackerMonthlyQuery {
  task_id?: TaskId;
  company_member_id?: CompanyMemberId;
  week_number: number[];
  year: number;
}

export interface ActivityTrackerDailyQuery {
  task_id?: TaskId;
  company_member_id?: CompanyMemberId;
  day: number;
  month: number;
  year: number;
}

export interface ActivityTrackerWeeklyPayload {
  company_member_id: CompanyMemberId;
  task_id: TaskId;
  monday?: number;
  tuesday?: number;
  wednesday?: number;
  thursday?: number;
  friday?: number;
  saturday?: number;
  sunday?: number;
  week_number?: number;
  year?: number;
}

export interface ActivityTrackerMonthlyPayload {
  company_member_id: CompanyMemberId;
  task_id: TaskId;
  week_number: number;
  year: number;
  week_total: number;
}

export interface ActivityTrackerMonthlyUpdatePayload {
  week_number: number;
  week_total: number;
}

export interface ActivityTrackerDailyPayload {
  company_member_id: CompanyMemberId;
  task_id: TaskId;
  day: number;
  month: number;
  year: number;
  total: number;
}

export type TimesheetDayApprovalModel = {
  id: number;
  companyMemberId: CompanyMemberId;
  taskId: TaskId;
  day: number;
  month: number;
  year: number;
  total: number;
  status: number;
  billable: number;
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
  approvedBy: UserId;
};

export type TimesheetDayCustomApprovalModel = {
  id: number;
  companyMemberId: CompanyMemberId;
  customName: string;
  day: number;
  month: number;
  year: number;
  total: number;
  status: number;
  billable: number;
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
  approvedBy: UserId;
};
