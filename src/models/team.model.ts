import { CompanyId } from './company.model';
import { UserId } from './user.model';

export type TeamPublicId = string;
export type TeamId = number;
export type TeamMemberPublicId = string;
export type TeamModel = {
  id: TeamId;
  id_text: TeamPublicId;
  company_id: CompanyId;
  created_at: string;
  updated_at: string;
  created_by: UserId;
  title: string;
};

export type TeamMemberModel = {
  team_id: TeamId;
  member_id: UserId;
  id_text: TeamMemberPublicId;
};
