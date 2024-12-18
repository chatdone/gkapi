import joi, { string } from 'joi';
import { Request, Response } from 'express';
import _ from 'lodash';
import { DedocoService, SubscriptionService, TaskService } from '@services';
import { createLoaders } from '@data-access';
import { UserModel } from '@models/user.model';
import { getCompany } from '@data-access/getters';
import {
  TaskAttachmentModel,
  TaskBoardModel,
  TaskModel,
} from '@models/task.model';
import { CompanyModel } from '@models/company.model';
import { SigningWorkflowsModel } from '@models/dedoco.model';
import logger from '@tools/logger';
import { CompanySubscriptionModel } from '@models/subscription.model';
import { PACKAGES_TYPES } from '@data-access/subscription/subscription.store';

const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log(req.body);
    const schema = joi.object({
      token: joi.string().required(),
    });

    const value = await schema.validateAsync(req.body);

    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
};

const getToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const email = req.params.email as string;
    const name = req.params.name as string;
    const workflowId = req.params.workflowId as string;
    const token = await DedocoService.getToken({ email, name, workflowId });
    return res.status(200).json({ token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
};

const createSigningWorkflow = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const loaders = await createLoaders();
  try {
    const schema = joi.object({
      attachment_ids: joi.array().items(joi.string()).unique(),
      card_id: joi.string().required(),
      user_id: joi.string().required(),
      job_id: joi.string().required(),
      company_id: joi.string().required(),
    });

    const payload = await schema.validateAsync(req.body);
    const { card_id, user_id, attachment_ids, company_id, job_id } = payload;

    const card = (await loaders.tasks.load(card_id)) as TaskModel;
    if (!card) {
      return res.status(400).json({ error: 'card does not exist' });
    }

    const user = (await loaders.users.load(user_id)) as UserModel;
    if (!user) {
      return res.status(400).json({ error: 'user does not exist' });
    }

    const attachments = (await loaders.taskAttachments.loadMany(
      attachment_ids,
    )) as TaskAttachmentModel[];

    const company = (await loaders.companies.load(company_id)) as CompanyModel;
    if (!company) {
      return res.status(400).json({ error: 'Company does not exist' });
    }

    const companySubscriptions =
      (await SubscriptionService.getActiveCompanySubscriptions(
        company.id,
      )) as CompanySubscriptionModel[];

    const dedocoSubscription = _.head(
      companySubscriptions.filter((subscription) => {
        if (typeof subscription?.data === 'string') {
          const parsedString = JSON.parse(subscription?.data);
          if (parsedString?.type === PACKAGES_TYPES.DEDOCO) {
            return subscription;
          }
        }
        if (subscription?.data?.type === PACKAGES_TYPES.DEDOCO) {
          return subscription;
        }
      }),
    ) as CompanySubscriptionModel;

    console.log(dedocoSubscription);

    if (!dedocoSubscription) {
      return res
        .status(400)
        .json({ error: 'Not subscribed to dedoco package' });
    }
    const job = (await loaders.taskBoards.load(job_id)) as TaskBoardModel;
    if (!company) {
      return res.status(400).json({ error: 'Task Board does not exist' });
    }
    if (attachments.length !== attachment_ids.length) {
      return res
        .status(400)
        .json({ error: 'all attachment ids must be valid' });
    }
    const params = {
      cardId: card.id,
      userId: user.id,
      attachments: attachments,
      companyId: company.id,
      jobId: job.id,
      dedocoSubscription,
    };
    const workflowResult = await DedocoService.createSigningWorkflow({
      params,
    });

    return res.status(200).json({
      workflow_id: workflowResult.workflowId,
      redirect_url: workflowResult.vbUrl,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const callbackSigningWorkflow = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const loaders = await createLoaders();
    const { workflowId } = req.params;

    const workFlow = (await loaders.workFlows.load(
      workflowId,
    )) as SigningWorkflowsModel;

    if (!workFlow)
      return res.status(400).json({ error: 'signing workflow does not exist' });

    const updateWorkflowResult = await DedocoService.updateWorkflow({
      workflowId: workFlow.id,
      payload: req.body,
    });
    const folder_data = await DedocoService.createDedocoFolder({
      payload: req.body,
      workflowId,
    });

    const assignLink = await DedocoService.updateSigneeLink({
      folder_data,
      workflowId: workFlow.id,
    });

    const firstBatchEmail = await DedocoService.initialEmailBatch({
      workflowId: workFlow.id,
      folder_data,
    });

    return res.status(200).json({
      project: updateWorkflowResult,
      folder: folder_data,
      emailSentTo: firstBatchEmail,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
};

const getDocument = async (req: Request, res: Response): Promise<Response> => {
  const { path } = req.query;
  try {
    const file = await DedocoService.getDocument(path as string);

    return res.status(200).json({ file });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
};

const getUpdatedDocument = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { path } = req.query;
  try {
    const file = await DedocoService.getUpdatedDocument(path as string);

    return res.status(200).json({ file });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
};

const fileCallBack = async (req: Request, res: Response): Promise<Response> => {
  logger.dedoco.log('info', 'fileCallBackRequest', req.body);
  try {
    const { file, businessProcessId } = req.body;
    const response = await DedocoService.uploadDedocoPdf({
      businessProcessId,
      file,
    });
    return res
      .status(200)
      .json({ message: 'Document Uploaded', data: response });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
};

const statusCallBack = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  logger.dedoco.log('info', 'statusCallBackRequest', req.body);
  try {
    const { workflowId } = req.params;
    const { businessProcessId, status, signers } = req.body;

    const response = await DedocoService.updateSigningWorkFlowData({
      workflowId,
      businessProcessId,
      status,
      signers,
    });

    return res.status(200).json({ data: response, workflow_id: workflowId });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
};

const workflowStatus = async (req: Request, res: Response) => {
  try {
    const loaders = await createLoaders();
    const { taskId, companyId } = req.params;

    const company = await loaders.companies.load(companyId);
    if (!company) {
      throw new Error('Company id does not exist');
    }
    const task = (await loaders.tasks.load(taskId)) as TaskModel;
    if (!task) {
      throw new Error('Task Id does not exist');
    }

    const response = await DedocoService.getWorkFlowStatus({ taskId: task.id });

    let jsonResponse;

    if (process.env.GK_ENVIRONMENT === 'development') {
      jsonResponse = response.map((res) => ({
        id: res.id,
        status: res.status,
        businessProcessId: res.business_process_id,
        data: JSON.parse(res.data),
        documentData: _.uniqBy(JSON.parse(res.documentData), 'id'),
        signers: JSON.parse(res.signers),
      }));
    } else {
      jsonResponse = response.map((res) => ({
        id: res.id,
        status: res.status,
        businessProcessId: res.business_process_id,
        data: res.data,
        documentData: _.uniqBy(JSON.parse(res.documentData), 'id'),
        signers: JSON.parse(res.signers),
      }));
    }

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.log(error);
    //@ts-ignore
    return res.status(500).json({ error: error.message });
  }
};

const voidSigningProcess = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { documentId, workflowId, taskId, companyId } = req.params;
    console.log(req.params);

    const result = await DedocoService.voidSigningProcess({
      documentId: _.toNumber(documentId),
      workflowId,
      taskId,
      companyId,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};

const getMetricsByCompany = async (req: Request, res: Response) => {
  try {
    const schema = joi.object({
      companyId: joi.string().required(),
    });
    await schema.validateAsync(req.params);
    const { companyId } = req.params;
    const company = await getCompany(companyId);
    const response = (await DedocoService.getMetricsByCompany(company)) as any;

    return res.status(200).json({ response });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export default {
  login,
  getToken,
  getMetricsByCompany,
  createSigningWorkflow,
  callbackSigningWorkflow,
  getDocument,
  getUpdatedDocument,
  fileCallBack,
  statusCallBack,
  workflowStatus,
  voidSigningProcess,
};
