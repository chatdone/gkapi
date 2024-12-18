import Joi from 'joi';
import { Request, Response } from 'express';

import { createLoaders } from '@data-access';
import { CompanyService, ReportService, SubscriptionService } from '@services';

import { CompanyMemberPublicId, CompanyModel } from '@models/company.model';
import { UserModel } from '@models/user.model';
import { ContactGroupModel } from '@models/contact.model';
import { ReportTypeService } from '@services/report/report.service';
import { setFileResHeader } from '@tools/utils';

export const generateTaskReport = async (req: Request, res: Response) => {
  try {
    const rows = (await ReportService.generateTaskReport({
      queryParams: req.query,
    })) as any;

    if (req.query.responseType === 'json') return res.status(200).json(rows);
    else if (req.query.responseType === 'file') {
      await ReportService.exportTasksRowsAsExcel(res, rows);
    } else {
      return res.status(500).json({
        Error:
          'Response type not is specified, response type should be file or json',
      });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const generateCollectionReport = async (req: Request, res: Response) => {
  try {
    const rows = (await ReportService.generateCollectionReport({
      queryParams: req.query,
    })) as any;

    if (req.query.responseType === 'json') return res.status(200).json(rows);
    else if (req.query.responseType === 'file') {
      //create new function to generate collection report as excel
      await ReportService.exportCollectionRowsAsExcel(res, rows);
    } else {
      return res.status(500).json({
        Error:
          'Response type not is specified, response type should be file or json',
      });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const generateProjectTasksReport = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId, companyId, responseType } = req.query;
    const schema = Joi.object({
      userId: Joi.string().required(),
      companyId: Joi.string().required(),
      responseType: Joi.string().required(),
      teamIds: Joi.array().items(Joi.string()),
      memberIds: Joi.array().items(Joi.string()),
      contactIds: Joi.array().items(Joi.string()),
      subStatusId: Joi.string().empty(''),
      start: Joi.string().empty(''),
      end: Joi.string().empty(''),
      actualStart: Joi.string().empty(''),
      actualEnd: Joi.string().empty(''),
      projectedCostMin: Joi.number().empty(''),
      projectedCostMax: Joi.number().empty(''),
      actualCostMin: Joi.number().empty(''),
      actualCostMax: Joi.number().empty(''),
      projectIds: Joi.array().items(Joi.string()),
      projectOwnerIds: Joi.array().items(Joi.string()),
      tagIds: Joi.array().items(Joi.string()),
      isGroupByProject: Joi.boolean(),
    });

    const loaders = createLoaders();

    await schema.validateAsync(req.query);

    const { isGroupByProject } = req.query;

    const company = (await loaders.companies.load(
      companyId as string,
    )) as CompanyModel;

    if (!company) {
      return res.status(400).json({ error: 'That company does not exist' });
    }

    const user = (await loaders.users.load(userId as string)) as UserModel;

    if (!user) {
      return res.status(400).json({ error: 'That user does not exist' });
    }

    let rows = [];

    if (isGroupByProject === 'true') {
      rows = await ReportService.generateProjectTasksReport({
        companyId: company.id,
        queryParams: req.query,
      });
    } else {
      rows = await ReportService.generateTasksReport({
        companyId: company.id,
        queryParams: req.query,
      });
    }

    if (responseType === 'json') {
      await SubscriptionService.handleSubscriptionQuota({
        companyId: company.id,
        quotaType: 'report',
        isDecrement: true,
      });
      return res.status(200).json(rows);
    } else if (responseType === 'file') {
      //create new function to generate collection report as excel

      if (isGroupByProject === 'true') {
        await ReportService.exportProjectRowsAsExcel(res, rows);
      } else {
        await ReportService.exportProjectTasksRowsAsExcel(res, rows);
      }
    } else {
      return res.status(400).json({ err: 'Response type not specified' });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const generateAttendanceReport = async (req: Request, res: Response) => {
  try {
    const { userId, companyId, responseType, overtimeFlag } = req.query;
    const schema = Joi.object({
      userId: Joi.string().required(),
      companyId: Joi.string().required(),
      responseType: Joi.string().required(),
      teamIds: Joi.array().items(Joi.string()),
      memberIds: Joi.array().items(Joi.string()),
      startDate: Joi.string().empty(''),
      endDate: Joi.string().empty(''),
      attendanceLabelIds: Joi.array().items(Joi.string()),
      intervalType: Joi.string().required(),
      overtimeFlag: Joi.boolean().required(),
      employeeTypeId: Joi.string().empty(''),
      contactIds: Joi.array().items(Joi.string()),
      tagIds: Joi.array().items(Joi.string()),
    });

    const loaders = createLoaders();

    await schema.validateAsync(req.query);

    const company = (await loaders.companies.load(
      companyId as string,
    )) as CompanyModel;

    if (!company) {
      return res.status(400).json({ error: 'That company does not exist' });
    }

    const user = (await loaders.users.load(userId as string)) as UserModel;

    if (!user) {
      return res.status(400).json({ error: 'That user does not exist' });
    }

    const rows = await ReportService.generateAttendanceReport({
      companyId: company.id,
      queryParams: req.query,
    });

    if (responseType === 'json') {
      await SubscriptionService.handleSubscriptionQuota({
        companyId: company.id,
        quotaType: 'report',
        isDecrement: true,
      });
      return res.status(200).json(rows);
    } else if (responseType === 'file') {
      //create new function to generate collection report as excel
      await ReportService.exportAttendanceRowsAsExcel({
        res,
        rows,
        overtimeFlag,
      });
    } else {
      return res.status(400).json({ err: 'Response type not specified' });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const generateInvoiceReport = async (req: Request, res: Response) => {
  try {
    const { companyId, responseType } = req.query;

    const schema = Joi.object({
      companyId: Joi.string().required(),
      responseType: Joi.string().required(),
      workspaceIds: Joi.array().items(Joi.string()),
      start: Joi.string().empty(''),
      end: Joi.string().empty(''),
    });

    const loaders = createLoaders();

    await schema.validateAsync(req.query);

    const company = (await loaders.companies.load(
      companyId as string,
    )) as CompanyModel;

    if (!company) {
      return res.status(400).json({ error: 'That company does not exist' });
    }

    const rows = await ReportService.generateInvoicesReport({
      companyId: company.id,
      queryParams: req.query,
    });

    if (responseType === 'json') {
      await SubscriptionService.handleSubscriptionQuota({
        companyId: company.id,
        quotaType: 'report',
        isDecrement: true,
      });
      return res.status(200).json(rows.rows);
    } else if (responseType === 'file') {
      //create new function to generate collection report as excel

      await ReportService.exportSqlInvoiceReport(res, rows.sqlAccountArr);
    } else {
      return res.status(400).json({ err: 'Response type not specified' });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const generateContactsExcel = async (req: Request, res: Response) => {
  try {
    const { user_id, company_id, group_id, keyword } = req.query;

    const schema = Joi.object({
      user_id: Joi.string().required(),
      company_id: Joi.string().required(),
      group_id: Joi.string().optional(),
      keyword: Joi.string().optional().allow(''),
    });

    const loaders = createLoaders();

    await schema.validateAsync(req.query);

    const company = (await loaders.companies.load(
      company_id as string,
    )) as CompanyModel;
    if (!company) {
      return res.status(400).json({ error: 'That company does not exist' });
    }

    let group;
    if (group_id) {
      const contactGroup = (await loaders.contactGroups.load(
        group_id as string,
      )) as ContactGroupModel;

      if (!contactGroup) {
        return res
          .status(400)
          .json({ error: 'That contact group does not exist' });
      }

      group = contactGroup;
    }

    const user = (await loaders.users.load(user_id as string)) as UserModel;
    if (!user) {
      return res.status(400).json({ error: 'That user does not exist' });
    }

    const isValid = await CompanyService.validateUserInCompany({
      companyId: company.id,
      userId: user.id,
    });
    if (!isValid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await ReportService.exportContactGroupsAsExcel({
      companyId: company.id,
      groupId: group?.id,
      keyword: keyword as string,
      res,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const generatePaymentTransactionsExcel = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId } = req.query;

    const schema = Joi.object({
      userId: Joi.string().required(),
    });

    await schema.validateAsync(req?.query);

    const loaders = createLoaders();
    const user = (await loaders.users.load(userId as string)) as UserModel;

    if (!user) {
      return res.status(400).json({ error: 'That user does not exist' });
    }

    const rows = await ReportService.generatePaymentTransactionsReport({
      queryParams: { user },
    });

    await ReportService.exportReportTransactionRowsAsExcel({ res, rows });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const generateReport = async (req: Request, res: Response) => {
  try {
    const {
      reportType,
      companyId,
      dateRange,
      projectIds,
      projectOwnerIds,
      assigneeId,
      teamId,
      userId,
    } = req.query;

    const schema = Joi.object({
      reportType: Joi.string().valid('project', 'assignee', 'team').required(),
      responseType: Joi.string().required(),
      companyId: Joi.string().required(),
      dateRange: Joi.array().items(Joi.date()).optional(),
      projectIds: Joi.array().items(Joi.string()).optional(),
      projectOwnerIds: Joi.array().items(Joi.string()).optional(),
      assigneeId: Joi.string().optional(),
      teamId: Joi.string().optional(),
      userId: Joi.string().required(),
    });

    await schema.validateAsync(req?.query);

    const loaders = createLoaders();
    const user = (await loaders.users.load(userId as string)) as UserModel;

    if (!user) {
      return res.status(400).json({ error: 'That user does not exist' });
    }

    const company = (await loaders.companies.load(
      companyId as string,
    )) as CompanyModel;

    if (!company) {
      return res.status(400).json({ error: 'That company does not exist' });
    }

    const rows = await ReportService.generateReport({
      reportType: reportType as ReportTypeService,
      company,
      dateRange: dateRange as [string, string],
      generatedByUser: user,
      projectIds: projectIds as string[],
      assigneeId: assigneeId as string,
      teamId: teamId as string,
      projectOwnerIds: projectOwnerIds as CompanyMemberPublicId[],
    });

    if (req.query.responseType === 'json') {
      await SubscriptionService.handleSubscriptionQuota({
        companyId: company.id,
        quotaType: 'report',
        isDecrement: true,
      });
      return res.status(200).json(rows);
    }

    await ReportService.exportReportV2(res, {
      rows,
      company,
      reportType: reportType as ReportTypeService,
      dateRange: dateRange as unknown as [Date, Date],
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};
