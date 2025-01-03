import { ContactStore, createLoaders } from '@data-access';
import { companyMemberTypes } from '@data-access/company/company.store';
import contactStore from '@data-access/contact/contact.store';
import {
  UpdateContactPicInput,
  UpdateContactInput,
} from '@generated/graphql-types';
import { AttachmentPayload } from '@models/common.model';
import { CompanyId, CompanyMemberModel } from '@models/company.model';
import {
  ContactGroupId,
  ContactGroupModel,
  ContactModel,
  CreateContactPayload,
  ContactId,
  ContactPicModel,
  ContactPicId,
  CreateContactPicPayload,
  ContactTaskModel,
  CreateContactGroupPayload,
  UpdateContactGroupPayload,
  ContactActivitiesModel,
  AuditLogPayload,
  AuditLogModel,
  ParseResultCsvModel,
  ContactNoteModel,
  ContactNoteId,
  ContactPublicId,
} from '@models/contact.model';
import { TaskBoardModel } from '@models/task.model';
import { UserId, UserModel } from '@models/user.model';
import {
  CompanyService,
  EventManagerService,
  TagService,
  UserService,
} from '@services';
import _ from 'lodash';
import path from 'path';
import csv from 'csv-parser';
import { ReadStream } from 'fs';
import * as fs from 'fs';
import { AUDIT_LOG_TYPES } from '@data-access/contact/utils';
import { TagModel } from '@models/tag.model';
import { TableNames } from '@db-tables';
import logger from '@tools/logger';

const dir = __dirname;
const service = dir.split('/')[dir.split('/').length - 1];

const getContacts = async (
  companyId: CompanyId,
): Promise<(ContactModel | Error)[]> => {
  try {
    const res = await ContactStore.getContacts(companyId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getContacts',
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const getContactGroups = async (
  companyId: CompanyId,
): Promise<(ContactGroupModel | Error)[]> => {
  try {
    const res = await ContactStore.getContactGroups(companyId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getContactGroups',
        companyId,
      },
    });
    return [];
  }
};

const getContactGroupMembers = async (
  groupId: ContactGroupId,
): Promise<(ContactModel | Error)[]> => {
  try {
    const res = await ContactStore.getContactGroupMembers(groupId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getContactGroupMembers',
        groupId,
      },
    });
    return [];
  }
};

const getUnassignedMembers = async (
  companyId: CompanyId,
): Promise<(ContactModel | Error)[]> => {
  try {
    const res = await ContactStore.getUnassignedMembers(companyId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getUnassignedMembers',
        companyId,
      },
    });
    return [];
  }
};

const createContact = async ({
  companyId,
  groupId,
  payload,
  user,
  dealCreatorId,
  tags,
}: {
  companyId: CompanyId;
  groupId: ContactGroupId | null;
  payload: CreateContactPayload;
  user: UserModel;
  dealCreatorId?: UserId;
  tags?: TagModel[];
}): Promise<ContactModel | Error> => {
  try {
    //Check if contact name already exists
    const contactWithSameNames = await ContactStore.getContactsByName(
      payload?.name,
      companyId,
    );
    if (contactWithSameNames?.length > 0) {
      throw new Error('Contact with same name already exists');
    }

    const res = (await ContactStore.createContact({
      payload,
      userId: user.id,
      dealCreatorId,
    })) as ContactModel;

    const contactId = (res as ContactModel).id;
    if (contactId !== undefined && groupId) {
      await ContactStore.upsertContactToGroup({ contactId, groupId });
    }

    await EventManagerService.createLogData({
      tableName: TableNames.CONTACTS,
      sourceId: res.created_by,
      tableRowId: res.id,
      auditActionType: AUDIT_LOG_TYPES.ACTION.CREATE,
      table: {
        contact: res,
      },
      contactPublicId: res?.id_text,
    });

    if (tags && !_.isEmpty(tags)) {
      await TagService.assignTagsToContact({
        tagIds: tags.map((tag) => tag.id),
        contactId,
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'createContact',
        companyId,
        groupId,
        payload,
        userId: user?.id,
        dealCreatorId,
        tagIds: tags?.map((tag) => tag?.id),
      },
    });
    return Promise.reject(error);
  }
};

const deleteContacts = async ({
  userId,
  companyId,
  contactIds,
}: {
  userId: UserId;
  companyId: CompanyId;
  contactIds: ContactId[];
}): Promise<(ContactModel | Error)[]> => {
  try {
    const res = await ContactStore.deleteContacts({
      companyId,
      contactIds,
      userId,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'deleteContacts',
        companyId,
        contactIds,
        userId,
      },
    });
    return Promise.reject(error);
  }
};

const updateContact = async ({
  companyId,
  groupId,
  payload,
  contact,
  user,
  dealCreator,
}: {
  companyId: CompanyId;
  contact: ContactModel;
  groupId?: ContactGroupId | null;
  payload: UpdateContactInput;
  dealCreator?: UserId;
  user: UserModel;
  loaders: any;
}): Promise<ContactModel | Error> => {
  const loaders = createLoaders();
  try {
    let group;
    if (typeof groupId === 'number') {
      group = _.head(
        await getContactGroupsForContactId(contact.id),
      ) as ContactGroupModel;
    } else {
      await EventManagerService.logUpdatedContactMisc({
        payload,
        contact,
        updatedBy: user,
      });
    }

    const res = (await ContactStore.updateContact({
      payload,
      dealCreator,
      contactId: contact.id,
    })) as ContactModel;
    if (typeof groupId !== 'undefined') {
      await ContactStore.upsertContactToGroup({
        contactId: contact.id,
        groupId,
      });
    }

    if (dealCreator && !contact?.deal_creator) {
      const updatedDealOwnerUserName = (
        (await loaders.users.load(res?.deal_creator)) as UserModel
      )?.name;

      await EventManagerService.logUpdateContactData({
        updatedData: {
          to: updatedDealOwnerUserName,
          rowId: res?.id_text,
          rowName: res?.name,
        },
        updatedBy: user,
        logType: TableNames.CONTACTS,
        contactPublicId: res?.id_text,
        changedValues: { dealOwner: true, title: res?.name },
      });
    } else if (dealCreator !== contact?.deal_creator && dealCreator) {
      const previousDealOwnerUserName = (
        (await loaders.users.load(contact?.deal_creator)) as UserModel
      )?.name;

      const updatedDealOwnerUserName = (
        (await loaders.users.load(res?.deal_creator)) as UserModel
      )?.name;

      await EventManagerService.logUpdatedData({
        updatedDataId: res?.id,
        data: {
          from: previousDealOwnerUserName,
          rowId: contact?.id_text,
          rowName: contact?.name,
        },
        updatedData: {
          to: updatedDealOwnerUserName,
          rowId: res.id_text,
          rowName: res?.name,
        },
        updatedBy: user,
        logType: TableNames.CONTACTS,
        contactPublicId: res?.id_text, // This is necessary so the query can pull the row
        changedValues: {
          dealOwner: true,
          title: updatedDealOwnerUserName,
        },
      });
    }

    if (typeof groupId === 'number') {
      const updatedGroup = groupId
        ? ((await loaders.contactGroups.load(groupId)) as ContactGroupModel)
        : null;

      await EventManagerService.logUpdatedData({
        data: { from: group?.name ? group?.name : 'Unassigned' },
        updatedData: {
          to: updatedGroup?.name ? updatedGroup?.name : 'Unassigned',
        },
        updatedBy: user,
        contactPublicId: res?.id_text,
        logType: TableNames.CONTACT_GROUPS,
        changedValues: {
          contactGroup: true,
          title: updatedGroup?.name ? updatedGroup?.name : 'Unassigned',
        },
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'updateContact',
        companyId,
        groupId,
        payload,
        userId: user?.id,
        dealCreator,
      },
    });
    return Promise.reject(error);
  }
};

const createContactGroup = async ({
  payload,
}: {
  payload: CreateContactGroupPayload;
}): Promise<ContactGroupModel | Error> => {
  try {
    const res = await ContactStore.createContactGroup({
      payload,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'createContactGroup',
        payload,
      },
    });
    return Promise.reject(error);
  }
};

const updateContactGroup = async ({
  id,
  payload,
}: {
  id: ContactGroupId;
  payload: UpdateContactGroupPayload;
}): Promise<ContactGroupModel | Error> => {
  try {
    const res = await ContactStore.updateContactGroup({ id, payload });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'updateContactGroup',
        groupId: id,
        payload,
      },
    });
    return Promise.reject(error);
  }
};

const deleteContactGroup = async (
  id: ContactGroupId,
): Promise<ContactGroupModel | Error> => {
  try {
    const res = await ContactStore.deleteContactGroup(id);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'deleteContactGroup',
        groupId: id,
      },
    });
    return Promise.reject(error);
  }
};

const addContactsToContactGroup = async ({
  contactIds,
  groupId,
}: {
  contactIds: ContactId[];
  groupId: ContactGroupId | null;
}): Promise<(ContactModel | Error)[]> => {
  try {
    const res = await Promise.all(
      contactIds.map((id) =>
        ContactStore.upsertContactToGroup({ contactId: id, groupId }),
      ),
    );

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'addContactsToContactGroup',
        contactIds,
        groupId,
      },
    });
    return Promise.reject(error);
  }
};

const getContactPics = async (
  contactId: ContactId,
): Promise<(ContactPicModel | Error)[]> => {
  try {
    const res = await ContactStore.getContactPics(contactId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getContactPics',
        contactId,
      },
    });
    return [];
  }
};

const getContactPicsByUserIdAndContactId = async ({
  contactId,
  userId,
}: {
  contactId: ContactId;
  userId: UserId;
}): Promise<ContactPicModel | Error> => {
  try {
    const res = await ContactStore.getContactPicByUserIdAndContactId({
      contactId,
      userId,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getContactPicsByUserIdAndContactId',
        contactId,
        userId,
      },
    });
    return Promise.reject(error);
  }
};

const getContactPicsByUserId = async (
  userId: UserId,
): Promise<(ContactPicModel | Error)[]> => {
  try {
    const res = await contactStore.getContactPicsByUserId(userId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getContactPicsByUserId',
        userId,
      },
    });
    return Promise.reject(error);
  }
};

const getContactGroupsForContactId = async (
  contactId: ContactId,
): Promise<(ContactGroupModel | Error)[]> => {
  try {
    const res = await ContactStore.getContactGroupsForContactId(contactId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getContactGroupsForContactId',
        contactId,
      },
    });
    return [];
  }
};

const addContactToContactGroup = async (
  contactId: ContactId,
  contactGroupId: ContactGroupId,
): Promise<ContactGroupModel | Error> => {
  try {
    const res = await ContactStore.addContactToContactGroup(
      contactId,
      contactGroupId,
    );
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'addContactToContactGroup',
        contactGroupId,
        contactId,
      },
    });
    return Promise.reject(error);
  }
};

const createContactPic = async ({
  createdBy,
  payload,
  contact,
}: {
  createdBy: UserModel;
  payload: CreateContactPicPayload;
  contact: ContactModel;
}): Promise<ContactPicModel | void | Error> => {
  try {
    let userId;
    if (!_.isEmpty(payload?.email)) {
      const user = (await UserService.createUserForPic({
        payload: {
          ...payload,
          signupData: JSON.stringify({ inviteType: 'pic' }),
          created_by: createdBy.id,
          email: payload.email as string,
        },
      })) as UserModel;

      if (!user) {
        return new Error('Error creating account for PIC');
      } else {
        const companyMembers = (await CompanyService.getCompanyMembers(
          contact.company_id,
        )) as CompanyMemberModel[];

        const isContactPicAMember = companyMembers.some(
          (member) => member.user_id === user.id,
        );

        if (!isContactPicAMember) {
          userId = user.id;
        }
      }

      const currentContactPics = (await getContactPics(
        contact.id,
      )) as ContactPicModel[];

      const isPicExists = currentContactPics.some(
        (cp) => cp.user_id === user.id,
      );

      if (isPicExists) {
        throw new Error('Duplicate emails not allowed within the same contact');
      }
    }

    if (userId) {
      const res = (await ContactStore.createContactPic({
        payload: {
          contact_id: payload.contact_id,
          user_id: userId,
          name: payload.name,
          contact_no: payload?.contact_no ? payload?.contact_no : undefined,
          remarks: payload.remarks,
        },
        userId: createdBy.id,
      })) as ContactPicModel;

      await EventManagerService.logContactPicCreateDelete({
        updatedBy: createdBy,
        contactPics: [res],
        contact,
        changedValue: { is_create: true, contact_pic: true },
      });

      return res;
    } else {
      return;
      // throw new Error(
      //   `${payload?.name} is already a company member and cannot be added as a contact person`,
      // );
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'createContactPic',
        createdById: createdBy?.id,
        payload,
        contactId: contact?.id,
      },
    });
    return Promise.reject(error);
  }
};

const updateContactPic = async ({
  contactPic,
  payload,
  user,
}: {
  contactPic: ContactPicModel;
  payload: UpdateContactPicInput;
  user: UserModel;
}): Promise<ContactPicModel | Error> => {
  try {
    const loaders = createLoaders();
    let newUserId;
    if (!_.isEmpty(payload?.email)) {
      if (contactPic.user_id) {
        const picUser = (await loaders.users.load(
          contactPic?.user_id,
        )) as UserModel;

        if (payload.email !== picUser?.email) {
          const newPicUser = (await UserService.createUserForPic({
            payload: {
              created_by: user.id,
              email: payload.email as string,
              name: payload.name,
              contact_no: payload?.contact_no as string,
            },
          })) as UserModel;
          newUserId = newPicUser.id;
        }
      } else {
        const newPicUser = (await UserService.createUserForPic({
          payload: {
            created_by: user.id,
            email: payload.email as string,
            name: payload.name,
            contact_no: payload?.contact_no as string,
          },
        })) as UserModel;
        newUserId = newPicUser.id;
      }
    } else if (payload.email === '') {
      newUserId = 0;
    }

    const res = (await ContactStore.updateContactPic({
      contactPicId: contactPic.id,
      payload: {
        name: payload.name,
        user_id: newUserId,
        contact_no: payload.contact_no as string,
        remarks: payload.remarks || undefined,
      },
    })) as ContactPicModel;

    await EventManagerService.logUpdatedContactPicMisc({
      payload,
      contactPic,
      updatedBy: user,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'updateContactPic',
        contactPicId: contactPic?.id,
        payload,
        userId: user?.id,
      },
    });
    return Promise.reject(error);
  }
};

const deleteContactPic = async ({
  contactPic,
  user,
  contact,
}: {
  contactPic: ContactPicModel;
  user: UserModel;
  contact: ContactModel;
}): Promise<ContactPicModel | Error> => {
  try {
    await EventManagerService.logContactPicCreateDelete({
      updatedBy: user,
      contact,
      contactPics: [contactPic],
      changedValue: { is_create: false, contact_pic: true },
    });

    const res = (await ContactStore.deleteContactPic({
      contactPicId: contactPic.id,
    })) as ContactPicModel;

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'deleteContactPic',
        contactPicId: contactPic?.id,
        userId: user?.id,
      },
    });
    return Promise.reject(error);
  }
};

const getTasks = async ({
  contactId,
  companyId,
}: {
  contactId: ContactId;
  companyId: CompanyId;
}): Promise<(ContactTaskModel | Error)[]> => {
  try {
    const res = await ContactStore.getTasks({ contactId, companyId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getTasks',
        contactId,
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const getTaskBoards = async ({
  contactId,
  companyId,
}: {
  contactId: ContactId;
  companyId: CompanyId;
}): Promise<(TaskBoardModel | Error)[]> => {
  try {
    const res = await ContactStore.getTaskBoards({ contactId, companyId });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getTaskBoards',
        contactId,
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const getContactPic = async (
  contactPicId: ContactPicId,
): Promise<ContactPicModel | Error> => {
  try {
    const res = await ContactStore.getContactPic(contactPicId);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getContactPic',
        contactPicId,
      },
    });
    return Promise.reject(err);
  }
};

const getUserByPicId = async (
  contactPicId: ContactPicId,
): Promise<UserModel | Error> => {
  try {
    const contactPic = (await getContactPic(contactPicId)) as ContactPicModel;

    const res = await UserService.getUser(contactPic.user_id);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getUserByPicId',
        contactPicId,
      },
    });
    return Promise.reject(err);
  }
};

const getContactActivitiesRaw = async ({
  contactId,
  contactPublicId,
  limit,
  offset,
  userId,
  companyId,
}: {
  contactId: ContactId;
  contactPublicId: ContactPublicId;
  limit: number;
  offset: number;
  userId: UserId;
  companyId: CompanyId;
}): Promise<(ContactActivitiesModel | Error)[]> => {
  try {
    const res = (await ContactStore.getContactActivitiesRaw({
      contactId, //DEPRECATED 090322
      contactPublicId,
      limit,
      offset,
    })) as ContactActivitiesModel[];

    const filteredActivities = _.filter(
      res,
      (act) => act !== undefined,
    ) as ContactActivitiesModel[];

    //Remove the contact private ID in the stringified JSON, I've completely missed this before.
    const removedPrivateIdActivities = _.map(
      filteredActivities,
      (activities) => {
        return {
          ...activities,
          current_values:
            typeof activities.current_values === 'string'
              ? { ...JSON.parse(activities?.current_values), contact_id: null }
              : { ...activities?.current_values, contact_id: null },
        };
      },
    );

    return removedPrivateIdActivities;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getContactActivitiesRaw',
        contactId,
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const createAuditLog = async (
  payload: AuditLogPayload,
): Promise<AuditLogModel | Error> => {
  try {
    const res = await ContactStore.createAuditLog(payload);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'createAuditLog',
        ...payload,
      },
    });
    return Promise.reject(error);
  }
};

const bulkUploadContacts = async ({
  attachment,
  companyId,
  user,
  groupId,
}: {
  attachment: AttachmentPayload;
  companyId: CompanyId;
  user: UserModel;
  groupId: ContactGroupId | null;
}): Promise<(ContactModel | Error)[]> => {
  try {
    const companyMembers = (await CompanyService.getCompanyMembers(
      companyId,
    )) as CompanyMemberModel[];

    const companyMember = _.find(
      companyMembers,
      (cm) => cm.user_id === user.id,
    );

    if (companyMember?.type === companyMemberTypes.MEMBER) {
      throw new Error('user not an admin or manager');
    }
    const extension = path.extname(attachment.filename);
    if (extension !== '.csv') {
      throw new Error('file extension is not csv');
    }

    // const readStream = attachment.createReadStream();
const readStream = fs.createReadStream(attachment.filename);
    // FIXME: processFileStream has been extracted to file.util.ts, change this usage to the new function
    const parsedResults = (await exportFunctions.processFileStream(
      readStream,
    )) as ParseResultCsvModel[];

    if (parsedResults.length > 1000) {
      throw new Error('Maximum of 1000 entries');
    }

    // const hasDuplicate = await exportFunctions.checkCsvForDuplicateEmails(
    //   parsedResults,
    // );

    // if (hasDuplicate) {
    //   throw new Error('.csv file has duplicate email within the same contact');
    // }

    const contactsPayload = await exportFunctions.createContactsPayload({
      parsedResults,
      companyId,
    });

    const createdContacts = (await exportFunctions.createContactsFromParsed({
      contactsPayload: contactsPayload as CreateContactPayload[],
      companyId,
      user,
      groupId,
    })) as ContactModel[];

    await exportFunctions.createContactPicsFromParsed({
      parsedResults,
      createdBy: user,
      companyId,
    });

    return createdContacts;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'bulkUploadContacts',
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const checkCsvForDuplicateEmails = async (
  parsedResults: ParseResultCsvModel[],
): Promise<boolean | Error> => {
  try {
    let hasDuplicate = false;

    const grouped = _.groupBy(parsedResults, 'company_name');

    for (const key in grouped) {
      const company = grouped[key];

      const uniqBy = _.uniqBy(company, 'email');

      if (company.length !== uniqBy.length) {
        hasDuplicate = true;
      }
    }

    return hasDuplicate;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'checkCsvForDuplicateEmails',
        parsedResults,
      },
    });
    return Promise.reject(error);
  }
};

const createContactPicsFromParsed = async ({
  parsedResults,
  companyId,
  createdBy,
}: {
  parsedResults: ParseResultCsvModel[];
  companyId: CompanyId;
  createdBy: UserModel;
}): Promise<(ContactPicModel | Error | null | void)[]> => {
  try {
    const loaders = createLoaders();
    const currentContacts = (await ContactStore.getContacts(
      companyId,
    )) as ContactModel[];

    const contactPics = await Promise.all(
      _.map(parsedResults, async (pr) => {
        const contact = currentContacts.find(
          (c) => c.name === pr.company_name,
        ) as ContactModel;

        const contactPics = (await ContactStore.getContactPics(
          contact.id,
        )) as ContactPicModel[];

        const contactPicsUsers = (await Promise.all(
          _.map(
            contactPics,
            async (cp) => await loaders.users.load(cp?.user_id),
          ),
        )) as UserModel[];

        const contactEmailAlreadyExists = contactPicsUsers.some(
          (cpu) => cpu?.email === pr.email,
        );

        if (!contactEmailAlreadyExists) {
          const cp = await createContactPic({
            createdBy,
            payload: {
              contact_no: pr.contact_no,
              email: pr.email,
              name: pr.pic_name || pr?.contact_person || pr?.email || '',
              contact_id: contact.id,
            },
            contact,
          });

          return cp;
        } else {
          return null;
        }
      }),
    );

    return contactPics.filter((cp) => cp !== null);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'createContactPicsFromParsed',
        companyId,
        createdById: createdBy?.id,
      },
    });
    return Promise.reject(error);
  }
};

const createContactsFromParsed = async ({
  contactsPayload,
  user,
  companyId,
  groupId,
}: {
  contactsPayload: CreateContactPayload[];
  user: UserModel;
  companyId: CompanyId;
  groupId: ContactGroupId | null;
}): Promise<(ContactModel | Error)[]> => {
  try {
    const res = await Promise.all(
      _.map(contactsPayload, async (payload) => {
        const existingContacts = await ContactStore.getContacts(companyId);

        const existingContact = existingContacts.some(
          (c) => c.name === payload.name,
        );

        if (!existingContact) {
          const contact = (await exportFunctions.createContact({
            payload,
            user,
            companyId,
            groupId,
          })) as ContactModel;

          return contact;
        } else {
          return null;
        }
      }),
    );

    return res.filter((c) => c) as ContactModel[];
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'createContactsFromParsed',
        companyId,
        userId: user?.id,
      },
    });
    return Promise.reject(error);
  }
};

const createContactsPayload = async ({
  parsedResults,
  companyId,
}: {
  parsedResults: ParseResultCsvModel[];
  companyId: CompanyId;
}): Promise<(CreateContactPayload | Error)[]> => {
  try {
    const companyList = _.map(parsedResults, 'company_name');
    const uniqueList = companyList.filter((v, i, a) => a.indexOf(v) === i);
    const list = _.map(uniqueList, (cl) => {
      return { name: cl, type: 2, company_id: companyId };
    });

    const contactList: CreateContactPayload[] = [];
    const currentContacts = (await ContactStore.getContacts(
      companyId,
    )) as ContactModel[];

    list.forEach((cl) => {
      if (!currentContacts.some((c) => c.name === cl.name)) {
        contactList.push(cl);
      }
    });

    return contactList;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'createContactsPayload',
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

// FIXME: processFileStream has been extracted to file.util.ts, remove this after references have been removed
const processFileStream = (readStream: ReadStream): Promise<any> => {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    const parseResults = [];
    const csvOptions = {
      mapHeaders: ({ header, index }: { header: string; index: number }) =>
        header.toLowerCase().replace(' ', '_'),
    };
    readStream
      .pipe(csv(csvOptions))
      .on('data', (data) => parseResults.push(data))
      .on('end', () => {
        //@ts-ignore
        resolve(parseResults);
      });
  });
};

const getContactNotesByContactId = async ({
  contactId,
}: {
  contactId: ContactId;
}): Promise<(ContactNoteModel | Error)[]> => {
  try {
    const res = await ContactStore.getContactNotesByContactId({ contactId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getContactNotesByContactId',
        contactId,
      },
    });
    return Promise.reject(error);
  }
};

const createContactNote = async ({
  contactId,
  payload,
}: {
  contactId: ContactId;
  payload: {
    content?: string;
    date?: string;
    user_id?: UserId;
    noteContent?: string;
  };
}): Promise<ContactNoteModel | Error> => {
  try {
    const res = await ContactStore.createContactNote({ contactId, payload });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'createContactNote',
        contactId,
        payload,
      },
    });
    return Promise.reject(error);
  }
};

const updateContactNote = async ({
  contactNoteId,
  payload,
}: {
  contactNoteId: ContactNoteId;
  payload: {
    content?: string;
    date?: string;
    user_id?: UserId;
    noteContent?: string;
  };
}): Promise<ContactNoteModel | Error> => {
  try {
    const res = await ContactStore.updateContactNote({
      contactNoteId,
      payload,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'updateContactNote',
        contactNoteId,
        payload,
      },
    });
    return Promise.reject(error);
  }
};

const deleteContactNotes = async ({
  contactNoteIds,
}: {
  contactNoteIds: ContactNoteId[];
}): Promise<(ContactNoteModel | Error)[]> => {
  try {
    const res = await ContactStore.deleteContactNotes({ contactNoteIds });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'deleteContactNotes',
        contactNoteIds,
      },
    });
    return Promise.reject(error);
  }
};

const getAttendances = async (contactId: ContactId) => {
  try {
    const res = await ContactStore.getAttendances(contactId);

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const exportFunctions = {
  getContacts,
  getContactGroups,
  getContactGroupsForContactId,
  getContactGroupMembers,
  getContactPics,
  getContactPic,
  getUserByPicId,
  getContactPicsByUserIdAndContactId,
  getContactPicsByUserId,
  createContact,
  deleteContacts,
  updateContact,
  createContactGroup,
  updateContactGroup,
  createAuditLog,
  getContactActivitiesRaw,
  deleteContactGroup,
  getUnassignedMembers,
  addContactToContactGroup,
  createContactPic,
  updateContactPic,
  deleteContactPic,
  getTaskBoards,
  getTasks,
  addContactsToContactGroup,
  bulkUploadContacts,
  processFileStream,
  createContactsPayload,
  createContactsFromParsed,
  createContactPicsFromParsed,
  checkCsvForDuplicateEmails,
  getContactNotesByContactId,
  createContactNote,
  updateContactNote,
  deleteContactNotes,
  getAttendances,
};

export default exportFunctions;
