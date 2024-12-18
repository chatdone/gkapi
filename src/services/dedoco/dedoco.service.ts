import _ from 'lodash';
import axios from 'axios';
import {
  AppendedDataModel,
  BusinessProcessModel,
  CreateSigningWorkFlowPayload,
  DocumentHistoryModel,
  GetDocumentLinkModel,
  GetLatestPathModel,
  SenderDataModel,
  SignerModel,
  SigningFlowCreatorModel,
  SigningWorkflowDocId,
  SigningWorkflowDocModel,
  SigningWorkflowId,
  SigningWorkflowPublicId,
  SigningWorkflowsDataModel,
  SigningWorkflowsModel,
  UpdateSigningWorkFlowDataPayload,
  WorkflowStatusModel,
} from '@models/dedoco.model';
import { createLoaders, DedocoStore, SubscriptionStore } from '@data-access';
import { Base64DecodeUrl, Base64EncodeUrl, base64Size } from './util';
import { EmailService, EventManagerService } from '@services';
import { NOTIFICATION_TYPES as TYPES } from '@services/notification/constant';
import s3 from '@tools/s3';
import { v4 as uuid } from 'uuid';
import { TaskBoardModel, TaskBoardPublicId, TaskId } from '@models/task.model';
import { CompanyModel, CompanyPublicId } from '@models/company.model';
import { CompanySubscriptionModel } from '@models/subscription.model';
import { TableNames } from '@db-tables';
import { AUDIT_LOG_TYPES } from '@data-access/contact/utils';
import { ContactModel } from '@models/contact.model';
import logger from '@tools/logger';

const baseUrl = `${process.env.DEDOCO_API_URL}`;

const api = axios.create({
  baseURL: baseUrl,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: process.env.DEDOCO_API_USER as string,
    password: process.env.DEDOCO_API_PASSWORD as string,
  },
});

const getToken = async ({
  email,
  name,
  workflowId,
}: {
  email: string;
  name: string;
  workflowId: SigningWorkflowPublicId;
}) => {
  try {
    const response = await api.post('/public/auth/token', {
      fileCallback: `${process.env.DEDOCO_FILE_CALLBACK_URL}/${workflowId}`,
      statusCallback: `${process.env.DEDOCO_STATUS_CALLBACK_URL}/${workflowId}`,
      userName: name,
      userEmail: email,
    });

    return _.get(response, 'data.token');
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'dedoco',
        fnName: 'createTaskBoardFolder',
        email,
        name,
        workflowId,
      },
    });
    return Promise.reject(err);
  }
};

const decrementQuota = async (dedocoSubscription: CompanySubscriptionModel) => {
  try {
    const isLastQuota = dedocoSubscription.signature_quota === 1 ? true : false;
    const isQuotaFinished =
      dedocoSubscription.signature_quota === 0 ? true : false;

    if (isLastQuota) {
      await SubscriptionStore.updateSubscriptionStatus({
        subscriptionId: 'prod_free_dedoco',
        status: 3,
        activeStatus: 0,
        id: [dedocoSubscription?.id],
      });
    } else if (isQuotaFinished) {
      throw new Error('Quota for Dedoco is finished');
    }

    const res = await DedocoStore.decrementQuota(dedocoSubscription);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'dedoco',
        fnName: 'decrementQuota',
        dedocoSubscription,
      },
    });
    return Promise.reject(error);
  }
};

const isSignatureRequestValid = (
  dedocoSubscription: CompanySubscriptionModel,
): boolean => {
  if (dedocoSubscription?.signature_quota <= 0) {
    return false;
  }
  return true;
};

const createSigningWorkflow = async ({
  params,
}: {
  params: CreateSigningWorkFlowPayload;
}) => {
  const { cardId, userId, attachments, companyId, jobId, dedocoSubscription } =
    params;
  const attachmentIds = attachments.map((a) => a.id);
  try {
    const isValidRequest = isSignatureRequestValid(dedocoSubscription);
    if (!isValidRequest) {
      return Promise.reject('Insufficient quota remaining');
    }
    const workflowResult = (await DedocoStore.createSigningWorkflow({
      cardId,
      userId,
      companyId,
      jobId,
    })) as SigningWorkflowsModel;

    if (!workflowResult) {
      return Promise.reject('Error creating signing workflow');
    }

    const documentAssignResult = await DedocoStore.assignDocumentsToWorkflow({
      workflowId: workflowResult.id,
      documents: attachments,
    });

    if (documentAssignResult.length !== attachmentIds.length) {
      return Promise.reject(
        'There was an error assigning documents to the workflow',
      );
    }

    const loaders = createLoaders();

    const taskboard = (await loaders.taskBoards.load(jobId)) as TaskBoardModel;
    let contactIdText = '';
    if (taskboard?.contact_id) {
      const contact = (await loaders.contacts.load(
        taskboard?.contact_id,
      )) as ContactModel;
      contactIdText = contact?.id_text;
    }
    await EventManagerService.createLogData({
      tableName: TableNames.SIGNING_WORKFLOWS,
      sourceId: userId,
      tableRowId: workflowResult.id,
      auditActionType: AUDIT_LOG_TYPES.ACTION.CREATE,
      table: {
        signingWorkFlow: workflowResult,
      },
      contactPublicId: contactIdText,
    });

    const workflowId = workflowResult.id_text;

    if (workflowId) {
      const affectedRow = await decrementQuota(dedocoSubscription);
    }

    return {
      workflowId: workflowId,
      vbUrl: generateVisualBuilderUrl(workflowId),
    };
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'dedoco',
        fnName: 'createSigningWorkflow',
        params,
      },
    });
    return Promise.reject(err);
  }
};

const generateVisualBuilderUrl = (workflowId: SigningWorkflowPublicId) => {
  const vbUrl = process.env.DEDOCO_VISUAL_BUILDER_URL;

  const buff = Buffer.from(
    `${process.env.DEDOCO_VISUAL_BUILDER_CALLBACK_URL}/${workflowId}`,
  );
  const base64Data = buff.toString('base64');

  return `${vbUrl}/${base64Data}`;
};

const updateWorkflow = async ({
  workflowId,
  payload,
}: {
  workflowId: SigningWorkflowId;
  payload: object | string;
}): Promise<SigningWorkflowsDataModel | Error> => {
  try {
    payload = JSON.stringify(payload);

    const res = (await DedocoStore.updateSigningWorkflowData({
      workflowId,
      payload,
    })) as SigningWorkflowsModel;

    if (typeof res.data === 'string') {
      return JSON.parse(res.data);
    } else {
      return res.data;
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'dedoco',
        fnName: 'updateWorkflow',
        workflowId,
        payload,
      },
    });
    return Promise.reject(error);
  }
};
const getSigningFlowCreator = async (
  workflowId: SigningWorkflowPublicId,
): Promise<SigningFlowCreatorModel | Error> => {
  try {
    const user = await DedocoStore.getSigningFlowCreator(workflowId);
    return user;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'dedoco',
        fnName: 'getSigningFlowCreator',
        workflowId,
      },
    });
    return Promise.reject(error);
  }
};

const createDedocoFolder = async ({
  payload,
  workflowId,
}: {
  payload: object;
  workflowId: SigningWorkflowPublicId;
}): Promise<object> => {
  const user = (await getSigningFlowCreator(
    workflowId,
  )) as SigningFlowCreatorModel;
  const token = await getToken({
    email: user.email,
    name: user.name,
    workflowId,
  });
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await axios.post(
    `${baseUrl}/public/folders`,
    payload,
    config,
  );
  return response.data;
};
const getDocumentlink = async (
  link: string,
  documentId: string,
  documents: any,
  workflowId: SigningWorkflowId,
): Promise<GetDocumentLinkModel> => {
  // const private_workflowId = await DocumentStore.getWorkflowIdbyPublicId({
  //   workflowId
  // });
  const client_doc = documents.filter((d: any) => d.id === documentId);
  const client_doc_hash = client_doc[0].document_hashes[0];
  const attachment = (await DedocoStore.getAttachmentPath({
    client_doc_hash,
    workflowId,
  })) as SigningWorkflowDocModel;
  const buff = Buffer.from(
    `${process.env.DEDOCO_GET_DOCUMENT}?path=${attachment.latest_path}`,
  );
  const base64Data = Base64DecodeUrl(buff.toString('base64'));
  const data = {
    api: `${link}/${base64Data}`,
    signingWorkflowDocId: attachment.id,
  };

  return data;
};

const updateSigneeLink = async ({
  folder_data,
  workflowId,
}: {
  folder_data: object | any;
  workflowId: SigningWorkflowId;
}) => {
  const links = folder_data.links;

  const appendedData = (await Promise.all(
    _.map(links, async (l) => {
      const data = await getDocumentlink(
        l.link,
        l.documentId,
        folder_data.documents,
        workflowId,
      );

      return {
        businessProcessId: l.businessProcessId,
        signingWorkflowDocId: data.signingWorkflowDocId,
        signerId: l.signerId,
        name: l.signerName,
        email: l.signerEmail,
        link: data.api,
        documentId: l.documentId,
      };
    }),
  )) as AppendedDataModel[];

  const response = await DedocoStore.updateSigneeLink({
    appendedData,
    workflowId,
  });
  return response;
};

const initialEmailBatch = async ({
  workflowId,
  folder_data,
}: {
  workflowId: SigningWorkflowId;
  folder_data: any;
}): Promise<object[] | Error> => {
  try {
    const emailRecipients = [];
    const businessProcesses = folder_data.businessProcesses;
    const templateId = TYPES.DEDOCO_REQUEST_SIGN.template as string;
    const sender_data = (await DedocoStore.getSenderData(
      workflowId,
    )) as SenderDataModel;
    let signees = null;

    for (const b of businessProcesses) {
      const hasSequence = b.sequential_requirement.length > 0;
      if (hasSequence) {
        signees = _.head(
          _.filter(b.sequential_requirement, (s) => s.sequence_number === 1),
        ).signer;
      }
      if (!hasSequence) {
        signees = _.head(b.signers);
      }
      const nextSignee = signees.signer_id;

      if (signees) {
        emailRecipients.push(signees);
      }
      const link = (await DedocoStore.getLatestPath({
        workflowId,
        nextSignee,
      })) as GetLatestPathModel;

      const options = {
        to: signees.signer_email as string,
        templateId,
        data: {
          receiverName: signees.signer_name,
          updatedBy: sender_data.updated_by,
          companyName: sender_data.company_name,
          taskName: sender_data.task_name,
          cardName: sender_data.card_name,
          link: link.link,
        } as any,
        attachments: [],
        subject: '',
      };

      const emailSent = await EmailService.sendEmail(options);
      if (emailSent) {
        console.log('info', 'Email Sent To', options);
      } else {
        console.log('info', 'Sending Email Failed To', options);
      }
    }

    return emailRecipients;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'dedoco',
        fnName: 'initialEmailBatch',
        workflowId,
        folder_data,
      },
    });
    return Promise.reject(err);
  }
};

const getDocument = async (path: string): Promise<string | Error> => {
  try {
    let base64File = '';
    const fileResult = await s3.getObjectFromS3({
      filePath: path,
      isPublicAccess: false,
    });
    const fileBuffer = _.get(fileResult, 'Body');
    if (fileBuffer) base64File = fileBuffer.toString('base64');
    //const hashedResult = createSha3HashFromFile(fileBuffer);
    return base64File;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'dedoco',
        fnName: 'getDocument',
        path,
      },
    });
    return Promise.reject(error);
  }
};

const getUpdatedDocument = async (path: string): Promise<string | Error> => {
  try {
    let base64File = '';
    const fileResult = await s3.getObjectFromS3({
      filePath: path,
      isPublicAccess: true,
    });
    const fileBuffer = _.get(fileResult, 'Body');
    if (fileBuffer) base64File = fileBuffer.toString('base64');
    //const hashedResult = createSha3HashFromFile(fileBuffer);
    return base64File;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'dedoco',
        fnName: 'getUpdatedDocument',
        path,
      },
    });
    return Promise.reject(err);
  }
};

const uploadDedocoPdf = async ({
  businessProcessId,
  file,
}: {
  businessProcessId: string;
  file: string;
}): Promise<object | Error> => {
  try {
    const fileName = `${uuid()}.pdf`;
    const bucket = 'gokudos-dev-public';
    const key = `dedoco/${fileName}`;
    const documentData = {
      path: key,
      bucket: bucket,
      fileName: fileName,
      type: 'application/pdf',
    };

    const size = base64Size(file);

    await s3.uploadBase64PdfToS3({
      fileBuffer: file,
      bucket,
      key,
    });

    await DedocoStore.updateDocumentHistoryAttachment({
      businessProcessId,
      key,
      documentData,
      fileSize: size,
    });

    return documentData;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'dedoco',
        fnName: 'uploadDedocoPdf',
        businessProcessId,
        file,
      },
    });
    return Promise.reject(error);
  }
};

const updateSigningWorkFlowData = async (
  payload: UpdateSigningWorkFlowDataPayload,
): Promise<(number | Error)[]> => {
  try {
    const loaders = await createLoaders();
    const { workflowId, businessProcessId, status, signers } = payload;
    const workFlow = (await loaders.workFlows.load(
      workflowId,
    )) as SigningWorkflowsModel;
    if (!workFlow) throw new Error('Workflow ID does not exist');
    const documentData = (await DedocoStore.getLatestDocumentData(
      businessProcessId,
    )) as string;
    const updateSigneeDocumentData = await DedocoStore.updateSigneeDocumentData(
      {
        businessProcessId,
        documentData,
      },
    );
    const signeeStatusResponse = await DedocoStore.updateSigneeStatus(signers);

    //refactor this block of code later
    if (status === 'completed') {
      const statuses = (await DedocoStore.getDocumentHistory(
        workFlow.id,
      )) as DocumentHistoryModel[];
      //logger.log('info', 'AllStatuses', statuses);
      const allCompleted = _.every(
        statuses,
        (s) => s.status === DedocoStore.SigneeStatusType.COMPLETED,
      );
      //logger.log('info', 'StatusCompletion', allCompleted);
      if (allCompleted) {
        //logger.log('info', 'All Signers Completed');
        await DedocoStore.updateSigningWorkFlowStatus(workFlow.id);
      }
    } else if (status === 'pending') {
      const isSequential = _.every(signers, (signer) => signer.sequence_number);
      const completedSignees = _.filter(signers, (signer) => signer.has_signed);
      const previousSignee = completedSignees[completedSignees.length - 1];
      const nextSignee = (await getNextSignee({
        isSequential,
        signers,
        previousSignee,
      })) as SignerModel;

      // logger.log('info', 'nextSignee', { nextSignee });

      const link = await getLinkForNextSignee({
        workflowId: workFlow.id,
        nextSignee,
      });
      const sender_data = (await DedocoStore.getSenderData(
        workFlow.id,
      )) as SenderDataModel;
      const templateId = TYPES.DEDOCO_REQUEST_SIGN.template;
      const options = {
        to: nextSignee.email,
        templateId,
        data: {
          receiverName: nextSignee.name,
          updatedBy: sender_data.updated_by,
          companyName: sender_data.company_name,
          taskName: sender_data.task_name,
          cardName: sender_data.card_name,
          link,
        },
        attachments: [],
        subject: '',
      };

      //logger.log('info', 'sendEmailSigningRequest', { options });
      console.log(options);
      const emailSent = await EmailService.sendEmail(options);
      if (emailSent) {
        //logger.log('info', 'Email Sent To', options);
      } else if (!emailSent) {
        //logger.log('info', 'Sending Email Failed To', options);
      }
    }
    return signeeStatusResponse;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'dedoco',
        fnName: 'updateSigningWorkFlowData',
        payload,
      },
    });
    return Promise.reject(err);
  }
};

const getNextSignee = async ({
  isSequential,
  signers,
  previousSignee,
}: {
  isSequential: boolean;
  signers: SignerModel[];
  previousSignee: SignerModel;
}): Promise<SignerModel | undefined> => {
  console.log('Sequential', isSequential);
  if (isSequential) {
    const nextSignee = await _.filter(
      signers,
      (signer) => signer.sequence_number === previousSignee.sequence_number + 1,
    );
    return _.head(nextSignee);
  }
  if (!isSequential) {
    const pendingSignees = await _.filter(
      signers,
      (signer) => !signer.has_signed,
    );
    const nextSignee = _.head(pendingSignees);
    return nextSignee;
  }
};

const getLinkForNextSignee = async ({
  workflowId,
  nextSignee,
}: {
  workflowId: SigningWorkflowId;
  nextSignee: SignerModel;
}) => {
  console.log('workflowId', workflowId);
  console.log('nextSignee in get link', nextSignee);
  const pathObject = (await DedocoStore.getLatestPath({
    workflowId,
    nextSignee: nextSignee.id,
  })) as GetLatestPathModel;

  const buff = Buffer.from(
    `${process.env.DEDOCO_GET_UPDATED_DOCUMENT}?path=${pathObject.latest_path}`,
  );

  const base64Data = Base64EncodeUrl(buff.toString('base64'));

  let link = pathObject.link;
  const end = nextSignee.id.length + link.lastIndexOf(nextSignee.id);
  link = link.slice(0, end);
  const newLink = `${link}/${base64Data}`;

  return newLink;
};

const getWorkFlowStatus = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<WorkflowStatusModel[]> => {
  const res = (await DedocoStore.getDocumentStatusbyTaskId(
    taskId,
  )) as WorkflowStatusModel[];
  return res;
};

const voidSigningProcess = async ({
  documentId,
  workflowId,
  taskId,
  companyId,
}: {
  documentId: SigningWorkflowDocId;
  workflowId: SigningWorkflowPublicId;
  taskId: TaskBoardPublicId;
  companyId: CompanyPublicId;
}): Promise<(WorkflowStatusModel | Error)[]> => {
  try {
    const loaders = await createLoaders();

    const company = (await loaders.companies.load(companyId)) as CompanyModel;
    if (!company) {
      throw new Error('Company id does not exist');
    }
    const document = (await DedocoStore.getSigningWorkFlowDocuments(
      documentId,
    )) as SigningWorkflowDocModel;

    if (!document) {
      throw new Error('Signing workflow document id does not exist');
    }

    const task = await loaders.tasks.load(taskId);

    if (!task) {
      throw new Error('Task id does not exist');
    }

    const workflow = (await loaders.workFlows.load(
      workflowId,
    )) as SigningWorkflowsModel;

    if (!workflow) {
      throw new Error('Workflow id does not exist');
    }
    const user = (await getSigningFlowCreator(
      workflowId,
    )) as SigningFlowCreatorModel;

    const token = await getToken({
      email: user.email,
      name: user.name,
      workflowId,
    });

    const dedocoDocumentId = await DedocoStore.getDedocoDocumentId(document.id);
    console.log(dedocoDocumentId, 'DEDOCODOCUMENTID');

    const date = Math.floor(Date.now() / 1000);

    const payload = {
      status: 'voided',
      request_date: date,
    };

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.put(
      `${baseUrl}/public/documents/${dedocoDocumentId}/status`,
      payload,
      config,
    );
    if (response.status === 200) {
      const deleted_data = await DedocoStore.deleteSigningProcess(document.id);
      const res = await axios.get(
        `${process.env.DEDOCO_SIGNER_STATUS_URL}/${companyId}/${taskId}`,
      );
      return res.data;
    } else {
      return [];
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'dedoco',
        fnName: 'voidSigningProcess',
        documentId,
        workflowId,
        taskId,
        companyId,
      },
    });
    return Promise.reject(err);
  }
};

const getMetricsByCompany = async (company: CompanyModel) => {
  try {
    const signingWorkflows = (await DedocoStore.getSigningWorkflowsByCompany(
      company.id,
    )) as SigningWorkflowsModel[];

    const digiSigners = getSignersCountByType({
      signingWorkflows,
      type: 'digi_signatures',
    });
    const eSigners = getSignersCountByType({
      signingWorkflows,
      type: 'esignatures',
    });

    return {
      companyId: company.id_text,
      companyName: company.name,
      totalRequest: signingWorkflows.length,
      eSignatures: eSigners,
      digiSignatures: digiSigners,
    };
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'dedoco',
        fnName: 'getMetricsByCompany',
        companyId: company?.id_text,
        companyName: company?.name,
      },
    });
    return Promise.reject(error);
  }
};

const getSignersCountByType = ({
  type,
  signingWorkflows,
}: {
  type: string;
  signingWorkflows: SigningWorkflowsModel[];
}): number => {
  let signers: any[] = [];

  signingWorkflows.forEach((swf: SigningWorkflowsModel) => {
    swf?.data?.business_processes?.forEach((bp: BusinessProcessModel) => {
      bp.signers.forEach((signer) => {
        if (type === 'digi_signatures') {
          if (signer.digi_signatures?.length !== 0) {
            signers.push(signer);
          }
        } else {
          if (signer.esignatures?.length !== 0) {
            signers.push(signer);
          }
        }
      });
    });
  });

  return signers?.length;
};

export default {
  getToken,
  createSigningWorkflow,
  updateWorkflow,
  createDedocoFolder,
  updateSigneeLink,
  initialEmailBatch,
  getDocument,
  getUpdatedDocument,
  uploadDedocoPdf,
  updateSigningWorkFlowData,
  getWorkFlowStatus,
  voidSigningProcess,
  getMetricsByCompany,
};
