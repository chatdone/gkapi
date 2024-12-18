import { CompanyId } from '@models/company.model';
import {
  AppendedDataModel,
  DocumentHistoryModel,
  GetLatestPathModel,
  SenderDataModel,
  SignerModel,
  SigningFlowCreatorModel,
  SigningWorkflowDocId,
  SigningWorkflowDocModel,
  SigningWorkflowId,
  SigningWorkflowPublicId,
  SigningWorkflowsModel,
  WorkflowStatusModel,
} from '@models/dedoco.model';
import { TaskAttachmentModel, TaskBoardId, TaskId } from '@models/task.model';
import { UserId } from '@models/user.model';
import knex from '@db/knex';
import _ from 'lodash';
import { CompanySubscriptionModel } from '@models/subscription.model';
import { TableNames } from '@db-tables';

const SigningWorkflowStatusTypes = {
  IN_PROGRESS: 1,
  COMPLETED: 2,
};

const SigneeStatusType = {
  IN_PROGRESS: 1,
  COMPLETED: 2,
};

const createSigningWorkflow = async ({
  cardId,
  userId,
  companyId,
  jobId,
}: {
  cardId: TaskId;
  userId: UserId;
  companyId: CompanyId;
  jobId: TaskBoardId;
}) => {
  try {
    const res = await knex('signing_workflows').insert({
      card_id: cardId,
      created_by: userId,
      company_id: companyId,
      job_id: jobId,
      status: SigningWorkflowStatusTypes.IN_PROGRESS,
    });

    const insertedRow = await knex('signing_workflows').where(
      'id',
      _.head(res),
    );

    return _.head(insertedRow);
  } catch (err) {
    return Promise.reject(err);
  }
};

const assignDocumentsToWorkflow = async ({
  workflowId,
  documents,
}: {
  workflowId: SigningWorkflowId;
  documents: TaskAttachmentModel[];
}) => {
  try {
    const rowsToInsert = documents.map((a) => ({
      card_attachment_id: a.id,
      signing_workflow_id: workflowId,
      latest_path: a.path,
      document_hash: a.document_hash,
    }));

    await knex('signing_workflow_documents').insert(rowsToInsert);

    const res = await knex('signing_workflow_documents').where(
      'signing_workflow_id',
      workflowId,
    );

    return res;
  } catch (err) {
    return Promise.reject(err);
  }
};

const updateSigningWorkflowData = async ({
  workflowId,
  payload,
}: {
  workflowId: SigningWorkflowId;
  payload: object | string;
}): Promise<SigningWorkflowsModel | Error> => {
  try {
    const res = await knex('signing_workflows')
      .where({ id: workflowId })
      .update({ data: payload });

    const updatedRow = await knex('signing_workflows')
      .where('id', workflowId)
      .select('data');

    return _.head(updatedRow);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getSigningFlowCreator = async (
  workflowId: SigningWorkflowPublicId | SigningWorkflowId,
): Promise<SigningFlowCreatorModel | Error> => {
  console.log(workflowId, 'workflowID');
  try {
    const user = await knex({ sw: 'signing_workflows' })
      .innerJoin({ u: 'users' }, 'sw.created_by', 'u.id')
      .where('sw.id_text', workflowId)
      .orWhere('sw.id', workflowId)
      .select('u.email', 'u.name', 'u.id');
    return _.head(user);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getAttachmentPath = async ({
  client_doc_hash,
  workflowId,
}: {
  client_doc_hash: string;
  workflowId: SigningWorkflowId;
}): Promise<SigningWorkflowDocModel | Error> => {
  try {
    const res = await knex('signing_workflow_documents')
      .where('document_hash', client_doc_hash)
      .andWhere('signing_workflow_id', workflowId)
      .select('latest_path', 'id');

    return _.head(res);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const updateSigneeLink = async ({
  appendedData,
  workflowId,
}: {
  appendedData: AppendedDataModel[];
  workflowId: SigningWorkflowId;
}): Promise<(number | Error)[]> => {
  try {
    let createdBy = (await getSigningFlowCreator(
      workflowId,
    )) as SigningFlowCreatorModel;
    const rowsToInsert = appendedData.map((a) => ({
      business_process_id: a.businessProcessId,
      signing_workflow_document_id: a.signingWorkflowDocId,
      created_by: createdBy.id,
      signer_id: a.signerId,
      name: a.name,
      email: a.email,
      link: a.link,
      document_id: a.documentId,
      status: SigneeStatusType.IN_PROGRESS,
      document_data: '{}',
    }));

    const res = await knex('document_history').insert(rowsToInsert);
    return res;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const getSenderData = async (
  workflowId: SigningWorkflowId,
): Promise<SenderDataModel | Error> => {
  try {
    const res = await knex({ sw: 'signing_workflows' })
      .innerJoin({ c: 'cards' }, 'sw.card_id', 'c.id')
      .innerJoin({ j: TableNames.PROJECTS }, 'c.job_id', 'j.id')
      .innerJoin({ cmp: 'companies' }, 'sw.company_id', 'cmp.id')
      .innerJoin({ u: 'users' }, 'sw.created_by', 'u.id')
      .where('sw.id', workflowId)
      .select({
        card_name: 'c.name',
        task_name: 'j.name',
        company_name: 'cmp.name',
        updated_by: 'u.name',
      });
    return _.head(res);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const getLatestPath = async ({
  workflowId,
  nextSignee,
}: {
  workflowId: SigningWorkflowId;
  nextSignee: string;
}): Promise<GetLatestPathModel | Error> => {
  try {
    const res = await knex({ dh: 'document_history' })
      .innerJoin(
        { swd: 'signing_workflow_documents' },
        'dh.signing_workflow_document_id',
        'swd.id',
      )
      .where('dh.signer_id', nextSignee)
      .select('swd.latest_path', 'dh.link');

    return _.head(res);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const updateDocumentHistoryAttachment = async ({
  businessProcessId,
  key,
  documentData,
  fileSize,
}: {
  businessProcessId: string;
  key: string;
  documentData: object;
  fileSize: number;
}): Promise<number | Error> => {
  try {
    const res = await knex({ swd: 'signing_workflow_documents' })
      .innerJoin(
        { dh: 'document_history' },
        'swd.id',
        'dh.signing_workflow_document_id',
      )
      .where('dh.business_process_id', businessProcessId)
      .update('swd.latest_path', key)
      .update('dh.file_size', fileSize)
      .update('swd.latest_document_data', JSON.stringify(documentData));

    return _.head(res);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const getLatestDocumentData = async (
  businessProcessId: string,
): Promise<string | Error> => {
  try {
    const res = await knex({ dh: 'document_history' })
      .innerJoin(
        { swd: 'signing_workflow_documents' },
        'dh.signing_workflow_document_id',
        'swd.id',
      )
      .where('dh.business_process_id', businessProcessId)
      .select('swd.latest_document_data');

    if (process.env.GK_ENVIRONMENT === 'development') {
      return _.head(res).latest_document_data;
    } else {
      return JSON.stringify(_.head(res).latest_document_data);
    }
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const updateSigneeDocumentData = async ({
  businessProcessId,
  documentData,
}: {
  businessProcessId: string;
  documentData: string;
}): Promise<void> => {
  try {
    await knex({ dh: 'document_history' })
      .innerJoin(
        { swd: 'signing_workflow_documents' },
        'dh.signing_workflow_document_id',
        'swd.id',
      )
      .where('dh.business_process_id', businessProcessId)
      .andWhere('dh.status', SigneeStatusType.IN_PROGRESS)
      .update('dh.document_data', documentData);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const updateSigneeStatus = async (
  signers: SignerModel[],
): Promise<(number | Error)[]> => {
  try {
    const insertedRows = [];

    for (const signer of signers) {
      const row = await knex('document_history')
        .where('signer_id', signer.id)
        .update(
          'status',
          signer.has_signed
            ? SigneeStatusType.COMPLETED
            : SigneeStatusType.IN_PROGRESS,
        );
      insertedRows.push(row);
    }

    return insertedRows;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const getDocumentHistory = async (
  id: SigningWorkflowId,
): Promise<(DocumentHistoryModel | Error)[]> => {
  try {
    const res = await knex({ swd: 'signing_workflow_documents' })
      .innerJoin(
        { dh: 'document_history' },
        'swd.id',
        'dh.signing_workflow_document_id',
      )
      .where('swd.signing_workflow_id', id)
      .select('dh.status');

    return res;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};
const updateSigningWorkFlowStatus = async (
  workflowId: SigningWorkflowId,
): Promise<boolean | Error> => {
  try {
    const res = await knex('signing_workflows')
      .where('id', workflowId)
      .update('status', SigningWorkflowStatusTypes.COMPLETED);
    return true;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const getDocumentStatusbyTaskId = async (
  taskId: TaskId,
): Promise<(WorkflowStatusModel | Error)[]> => {
  try {
    const res = await knex({ sw: 'signing_workflows' })
      .innerJoin(
        { swd: 'signing_workflow_documents' },
        'sw.id',
        'swd.signing_workflow_id',
      )
      .innerJoin(
        { dh: 'document_history' },
        'swd.id',
        'dh.signing_workflow_document_id',
      )
      .where('sw.card_id', taskId)
      .groupBy('sw.id')
      .select(
        'sw.id_text as id',
        'sw.status',
        { business_process_id: 'dh.business_process_id' },
        'sw.data',
        knex.raw(
          `CONCAT('[',GROUP_CONCAT('{','"id":',swd.id, ',','"name":','', json_extract(sw.data, '$.folder_name'),'','}'),']')
          AS documentData`,
        ),
        knex.raw(
          `CONCAT('{','"signer":','[',
            GROUP_CONCAT(
                '{', 
                  '"history_id":','"', dh.id, '"' ,',',
                  '"name":','"', dh.name, '"' ,',',
                  '"status":','"', dh.status, '"' ,',',
                  '"email":','"', dh.email, '"' ,',',
                  '"document":',  dh.document_data  ,',',
                  '"document_id":','"', dh.signing_workflow_document_id, '"',
                '}'
              )
          ,']','}')
            AS signers`,
        ),
      );
    return res;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};
const getDedocoDocumentId = async (documentId: SigningWorkflowDocId) => {
  try {
    const res = await knex('document_history')
      .where('signing_workflow_document_id', documentId)
      .select('document_id');

    return _.head(res).document_id;
  } catch (err) {
    console.log(err);
    Promise.reject(err);
  }
};

const deleteSigningProcess = async (
  documentId: SigningWorkflowDocId,
): Promise<number | Error> => {
  try {
    const deleted_document_history = await knex('document_history')
      .where('signing_workflow_document_id', documentId)
      .del();
    const deleted_document = await knex('signing_workflow_documents')
      .where('id', documentId)
      .del();
    return deleted_document;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const getSigningWorkFlowDocuments = async (
  id: number,
): Promise<SigningWorkflowDocModel | Error> => {
  try {
    const res = await knex('signing_workflow_documents')
      .where('id', id)
      .select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getSigningWorkflowsByCompany = async (
  companyId: CompanyId,
): Promise<(SigningWorkflowsModel | Error)[]> => {
  try {
    const res = await knex('signing_workflows')
      .where('company_id', companyId)
      .select();
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const decrementQuota = async (
  companySubscription: CompanySubscriptionModel,
) => {
  try {
    const decrementedQuota = companySubscription?.signature_quota - 1;
    const res = await knex('company_subscriptions')
      .where('id', companySubscription.id)
      .update({ signature_quota: decrementedQuota });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  createSigningWorkflow,
  assignDocumentsToWorkflow,
  updateSigningWorkflowData,
  getSigningFlowCreator,
  getAttachmentPath,
  updateSigneeLink,
  getSenderData,
  getLatestPath,
  updateDocumentHistoryAttachment,
  getLatestDocumentData,
  updateSigneeDocumentData,
  updateSigneeStatus,
  getDocumentHistory,
  updateSigningWorkFlowStatus,
  getDocumentStatusbyTaskId,
  getDedocoDocumentId,
  deleteSigningProcess,
  getSigningWorkFlowDocuments,
  SigneeStatusType,
  getSigningWorkflowsByCompany,
  decrementQuota,
};
