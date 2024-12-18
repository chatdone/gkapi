import { CompanyId, CompanyMemberId, CompanyTeamId } from './company.model';
import { UserId } from './user.model';
import { ContactId } from './contact.model';

export type CollectorPublicId = string;
export type CollectorId = number;
export type CollectorMemberPublicId = string;
export type CollectorMemberId = number;

export type CollectorModel = {
  id: CollectorId;
  id_text: CollectorPublicId;
  company_id: CompanyId;
  team_id: CompanyTeamId;
  created_by: UserId;
  updated_by: UserId;
  created_at: string;
  updated_at: string;
};

export type CollectorMemberModel = {
  id: CollectorMemberId;
  id_text: CollectorMemberPublicId;
  member_id: CompanyMemberId;
};

export type CreateCollectorPayload = {
  team_id?: CompanyTeamId | undefined;
  member_ids?: CompanyMemberId[] | undefined;
  contact_id: ContactId;
  company_id: CompanyId;
  user_id: UserId;
};
