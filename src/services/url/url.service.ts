import { customAlphabet } from 'nanoid/async';
import { UrlStore } from '@data-access';
import jwt from 'jsonwebtoken';
import { BreadcrumbInfoModel, ShortUrlModel } from '@models/url.model';
import { CollectionModel, CollectionPublicId } from '@models/collection.model';
import { ContactModel } from '@models/contact.model';
import { CompanyModel, CompanyPublicId } from '@models/company.model';
import dotenv from 'dotenv';
import { TaskBoardModel, TaskModel } from '@models/task.model';
import { CollectorModel } from '@models/collector.model';
import {
  TimesheetActivityModel,
  TimesheetModel,
} from '@models/timesheet.model';
import logger from '@tools/logger';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const getShortId = async () => {
  const nanoid = customAlphabet(
    '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    10,
  );
  const code = await nanoid();
  return code;
};

const createLinkToken = async ({
  contact,
  companyPublicId,
  collectionPublicId,
  collectionRefNo,
}: {
  contact: ContactModel;
  companyPublicId: CompanyPublicId;
  collectionPublicId: CollectionPublicId;
  collectionRefNo: string;
}): Promise<string | Error> => {
  try {
    const payload = {
      name: contact.name,
      contact_id: contact.id_text,
      rr_id: collectionPublicId,
      ref_no: collectionRefNo,
      company_id: companyPublicId,
    };
    const token = jwt.sign(payload, JWT_SECRET, {
      // expiresIn: '15m'
    });
    const urlString = `?token=${token}`;
    return urlString;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'url',
        fnName: 'createLinkToken',
        contactId: contact?.id_text,
        companyPublicId,
        collectionPublicId,
        collectionRefNo,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getBreadcrumbInfo = async (
  id: string,
  loaders: any,
  type: string,
): Promise<BreadcrumbInfoModel | Error> => {
  try {
    let name = '';
    switch (type) {
      case 'TASK_BOARD': {
        const item = (await loaders.taskBoards.load(id)) as TaskBoardModel;

        const isCollaborationBoard =
          item.type === 'Company' || item.type === 'Collaboration';
        if (isCollaborationBoard) {
          const contact = (await loaders.contacts.load(
            item.contact_id,
          )) as ContactModel;

          name = contact.name;
        } else {
          name = item.name;
        }

        break;
      }

      case 'PROJECT_BOARD': {
        const item = (await loaders.taskBoards.load(id)) as TaskBoardModel;

        name = item.name;

        break;
      }

      case 'CRM': {
        const item = (await loaders.contacts.load(id)) as ContactModel;
        name = item.name;
        break;
      }

      case 'CLIENT': {
        const item = (await loaders.collectors.load(id)) as CollectorModel;
        const contact = (await loaders.contacts.load(item.id)) as ContactModel;
        name = contact.name;
        break;
      }

      case 'COLLECTION': {
        const item = (await loaders.collections.load(id)) as CollectionModel;
        name = item.title;
        break;
      }

      case 'PAYMENTS': {
        const item = (await loaders.collectors.load(id)) as CollectorModel;
        const company = (await loaders.companies.load(
          item.company_id,
        )) as CompanyModel;
        name = company.name;

        break;
      }

      case 'TIMESHEET': {
        const timesheet = (await loaders.timesheets.load(id)) as TimesheetModel;

        const activity = (await loaders.timesheetActivities.load(
          timesheet.activity_id,
        )) as TimesheetActivityModel;

        const task = (await loaders.tasks.load(activity.task_id)) as TaskModel;
        name = task.name;
        break;
      }

      case 'COMPANY_SLUG': {
        const company = (await loaders.getByCompanySlug.load(
          id,
        )) as CompanyModel;

        name = company.name;
        break;
      }
    }
    return {
      name,
    };
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'url',
        fnName: 'getBreadcrumbInfo',
        id,
        type,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const createShortUrl = async (
  url: string,
): Promise<ShortUrlModel | Error | null> => {
  try {
    let retries = 10;
    let shortId = await getShortId();
    while (retries > 0) {
      shortId = await getShortId();
      const existing = await UrlStore.getByShortId(shortId);
      if (existing) {
        --retries;
        if (retries === 0) {
          return Promise.reject('Exceeded maximum number of retries');
        }
      } else {
        retries = 0;
      }
    }
    const createResult = await UrlStore.createShortId({
      url,
      shortId,
    });

    return createResult;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'url',
        fnName: 'createShortUrl',
        url,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

export default {
  createShortUrl,
  getBreadcrumbInfo,
  createLinkToken,
  getShortId,
};
