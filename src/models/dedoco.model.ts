import { CompanyId } from './company.model';
import { CompanySubscriptionModel } from './subscription.model';
import {
  TaskAttachmentId,
  TaskAttachmentModel,
  TaskBoardId,
  TaskId,
} from './task.model';
import { UserId } from './user.model';

export type SigningWorkflowPublicId = string;
export type SigningWorkflowId = number;
export type SigningWorkflowDocId = number;
export type SigningWorkflowDocPublicId = string;
export type DocumentHistoryId = number;
export type DocumentHistoryPublicId = string;

export type SigningWorkflowsModel = {
  id: SigningWorkflowId;
  id_text: SigningWorkflowPublicId;
  status: number;
  card_id: TaskId;
  job_id: TaskBoardId;
  created_at: string;
  modified_at: string;
  deleted_at: string;
  created_by: UserId;
  company_id: CompanyId;
  data: SigningWorkflowsDataModel;
};

export type SigningWorkflowsDataModel = {
  documents: { name: string; file_type: string; document_hash: string }[];
  folder_name: string;
  date_created: string;
  linked_folders: [];
  business_processes: BusinessProcessModel[];
};

export type BusinessProcessModel = {
  type: string;
  signers: {
    esignatures: [];
    signer_name: string;
    signer_email: string;
    signer_phone: string;
    digi_signatures: {
      type: string;
      placement: {
        x: string;
        y: string;
        page: number;
      };
      dimension: {
        width: string;
        height: string;
      };
      is_mandatory: boolean;
    }[];
    sequence_number: number;
  }[];
  observers: [];
  document_id: number;
  is_sequential: boolean;
  expiration_time: number;
  completion_requirement: {
    min_number: number;
  };
};

export type SigningFlowCreatorModel = {
  email: string;
  name: string;
  id: UserId;
};

export type GetDocumentLinkModel = {
  api: string;
  signingWorkflowDocId: SigningWorkflowDocId;
};
export type SenderDataModel = {
  card_name: string;
  task_name: string;
  company_name: string;
  updated_by: string;
};

export type GetLatestPathModel = {
  latest_path: string;
  link: string;
};

export type AppendedDataModel = {
  businessProcessId: string;
  signingWorkflowDocId: SigningWorkflowDocId;
  created_by: UserId;
  signerId: string;
  name: string;
  email: string;
  link: string;
  documentId: string;
  status: number;
  document_data: string;
};

export type SignerModel = {
  id: string;
  name: string;
  email: string;
  sequence_number: number;
  has_signed: boolean;
};

export type SigningWorkflowDocModel = {
  id: SigningWorkflowDocId;
  id_text: SigningWorkflowDocPublicId;
  card_attachment_id: TaskAttachmentId;
  signing_workflow_id: SigningWorkflowId;
  latest_path: string;
  latest_document_data: object;
  document_hash: string;
};

export type DocumentHistoryModel = {
  id: DocumentHistoryId;
  id_text: DocumentHistoryPublicId;
  card_attachment_id: TaskAttachmentId;
  action_id: string;
  document_id: string;
  document_data: object;
  signing_workflow_document_id: SigningWorkflowDocId;
  business_process_id: string;
  created_at: string;
  created_by: UserId;
  signer_id: string;
  name: string;
  email: string;
  link: string;
  status: number;
};

export type WorkflowStatusModel = {
  id: SigningWorkflowPublicId;
  status: number;
  business_process_id: string;
  data: string;
  documentData: string;
  signers: string;
};

export type CreateSigningWorkFlowPayload = {
  cardId: TaskId;
  userId: UserId;
  attachments: TaskAttachmentModel[];
  companyId: CompanyId;
  jobId: TaskBoardId;
  dedocoSubscription: CompanySubscriptionModel;
};

export type UpdateSigningWorkFlowDataPayload = {
  workflowId: SigningWorkflowPublicId;
  businessProcessId: string;
  status: string;
  signers: SignerModel[];
};
