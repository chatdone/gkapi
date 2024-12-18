import { CollectionId, CollectionPublicId } from './collection.model';
import { CompanyId, CompanyMemberModel } from './company.model';
import { ContactId } from './contact.model';
import { UserId } from './user.model';
export type EventCollectionPayload = {
  id: CollectionId;
  ref_no: string;
  title: string;
  due_date: string;
  remind_type: number;
  payable_amount: number;
  sms_notify: boolean;
  whatsapp_notify: boolean;
  voice_notify: boolean;
  email_notify: boolean;
  id_text: string;
  payment_type: number;
  description: string;
  notify_pics: string | number[];
  invoice: string;
  file_name: string;
  last_remind_on: string;
  contact_id: ContactId;
  created_by: UserId;

  collection_id: CollectionId;
  company_id: CompanyId;
  company_name: string;
  total_due: number;
  day?: number;
  is_on_due: number;
  is_overdue: number;
  period_ids: string;
  remind_interval: string;
  defaultTimezone?: string;
};

export type CreateEmailOptionModel = {
  email: string;
  templateId: string;
  receiverName: string | null;
  companyLogoUrl: string;
  isProject?: number;
  taskBoardName?: string;
  isTask?: boolean;
  refNo?: string;
  url?: string;
  dueDays?: string;
  companyName?: string;
  title?: string;
  dueDate?: string;
  totalDue?: string;
  period?: string;
  link?: string;
  picName?: string;
  attachments?: any;
  contactName?: string;
  cardName?: string;
  taskName?: string;
  updatedBy?: string;
  exceededServicesString?: string;
  lowQuotaServicesString?: string;
  teamName?: string;
  memberName?: string;
  receivableTitle?: string;
  remarks?: string;
  boardName?: string;
  amount?: string;
  collectionType?: string;
  deletedByName?: string;
  commenterName?: string;

  // Send invoice + companyLogoUrl + companyName
  invoiceNo?: string;
  balanceDue?: string;
  invoiceAmount?: string;
  companyPhone?: string;
  companyEmail?: string;

  // Subscription related
  subscriptionAmount?: string;
};

export interface CompanyMemberNotifyEventManagerModel
  extends CompanyMemberModel {
  name: string;
}
