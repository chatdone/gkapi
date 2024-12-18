import {
  CompanyId,
  CompanyMemberId,
  CompanyTeamStatusPublicId,
} from './company.model';

// TODO: Deprecate
export type FilterOptionsModel = {
  date?: { start_date: string; end_date?: string };
  selectedDate?: string;
  task_member?: { member_id: string };
  taskMember?: { memberId: string };
  team_status?: { sub_status_id: CompanyTeamStatusPublicId };
  project_type?: string;
  archived?: { status: boolean };
  weekly_timesheet?: { week: number; year: number };
  company_id?: CompanyId;
  category?: { is_project: boolean };
};

export type PaginationFilter = {
  limit?: number | null;
  offset?: number | null;
  search?: string | null;
};
