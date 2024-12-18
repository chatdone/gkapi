import knex from '@db/knex';
import _ from 'lodash';
import {
  ContactGroupId,
  ContactGroupModel,
  ContactModel,
  ContactPicModel,
  ContactId,
  CreateContactPayload,
  ContactPicId,
  ContactTaskModel,
  CreateContactGroupPayload,
  UpdateContactGroupPayload,
  ContactActivitiesModel,
  AuditLogPayload,
  AuditLogModel,
  ContactNoteModel,
  ContactNoteId,
  ContactExpandedModel,
  ContactPublicId,
} from '@models/contact.model';
import { CompanyId } from '@models/company.model';
import { UserId } from '@models/user.model';
import {
  UpdateContactPicInput,
  UpdateContactInput,
} from '@generated/graphql-types';
import { TaskBoardModel } from '@models/task.model';
import { camelize } from '@data-access/utils';
import { TableNames } from '@db-tables';
import redis from '@data-access/redis';

const getContacts = async (
  companyId: CompanyId,
): Promise<(ContactModel | Error)[]> => {
  try {
    // const cachedContacts = await redis.get(`contacts-by-company:${companyId}`);

    // if (Array.isArray(cachedContacts)) {
    //   return cachedContacts;
    // }
    const res = await knex
      .from({ c: 'contacts' })
      .where('company_id', companyId)
      .whereNull('deleted_at')
      .select();

    // setCachedContactsByCompanyId({ contacts: camelize(res), companyId });
    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getContactGroups = async (
  companyId: CompanyId,
): Promise<(ContactGroupModel | Error)[]> => {
  try {
    const res = await knex
      .from('contact_groups')
      .where('company_id', companyId)
      .select();
    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getContactGroupById = async (
  id: ContactGroupId,
): Promise<ContactGroupModel | Error> => {
  try {
    const res = await knex.from('contact_groups').where('id', id).select();

    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const getContactGroupMembers = async (
  groupId: ContactGroupId,
): Promise<(ContactModel | Error)[]> => {
  try {
    const res = await knex
      .from({ cgm: 'contact_group_members' })
      .where('cgm.contact_group_id', groupId)
      .innerJoin({ c: 'contacts' }, 'cgm.contact_id', 'c.id')
      .whereNull('c.deleted_at')
      .select('c.*');
    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getUnassignedMembers = async (
  companyId: CompanyId,
): Promise<(ContactModel | Error)[]> => {
  try {
    const res = await knex
      .from({ c: 'contacts' })
      .where({ 'c.company_id': companyId })
      .whereNull('c.deleted_at')
      .whereNull('cgm.contact_group_id')
      .leftJoin({ cgm: 'contact_group_members' }, 'c.id', 'cgm.contact_id')
      .select('c.*', 'cgm.contact_group_id');
    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

// const getContactGroupsByPublicIds = async (publicIds) => {
//   try {
//     const res = await knex
//       .from('contact_groups')
//       .whereRaw(getBinaryMatchFromPublicIds(publicIds))
//       .select();

//     return res;
//   } catch (err) {
//     return Promise.reject(err);
//   }
// };

const createContact = async ({
  payload,
  userId,
  dealCreatorId,
}: {
  payload: CreateContactPayload;
  userId: UserId;
  dealCreatorId: UserId | null | undefined;
}): Promise<ContactModel | Error> => {
  try {
    const { accountCode } = payload;
    let dbPayload;
    if (payload.deal_value) {
      dbPayload = {
        ...payload,
        deal_creator: userId,
      };
    } else {
      dbPayload = payload;
    }

    if (dealCreatorId) {
      dbPayload = { ...dbPayload, deal_creator: dealCreatorId };
    }

    const insert = await knex(TableNames.CONTACTS).insert({
      ...dbPayload,
      created_by: userId,
      account_code: accountCode !== undefined ? accountCode : null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.CONTACTS)
      .where('id', _.head(insert))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const deleteContacts = async ({
  contactIds,
  companyId,
  userId,
}: {
  companyId: CompanyId;
  contactIds: ContactId[];
  userId: UserId;
}): Promise<(ContactModel | Error)[]> => {
  try {
    const check = await knex
      .from('contacts')
      .whereIn('id', contactIds)
      .andWhere('company_id', companyId)
      .select();
    if (check.length === 0) {
      return Promise.reject('Contacts does not exist');
    }

    await knex
      .from('contacts')
      .whereIn('id', contactIds)
      .andWhere('company_id', companyId)
      .update({ deleted_at: knex.fn.now(), deleted_by: userId });

    await knex.from('contacts_pic').whereIn('contact_id', contactIds).del();

    return camelize(check);
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const updateContact = async ({
  contactId,
  payload,
  dealCreator,
}: {
  contactId: ContactId;
  payload: UpdateContactInput;
  dealCreator: UserId | undefined;
}): Promise<ContactModel | Error> => {
  try {
    const { accountCode, ...rest } = payload;
    if (dealCreator) {
      await knex
        .from(TableNames.CONTACTS)
        .where('id', contactId)
        .update({
          ...rest,
          account_code: typeof accountCode === 'string' ? accountCode : null,
          deal_creator: dealCreator,
          updated_at: knex.fn.now(),
        });
    } else {
      await knex
        .from(TableNames.CONTACTS)
        .where('id', contactId)
        .update({
          ...rest,
          account_code: typeof accountCode === 'string' ? accountCode : null,
          updated_at: knex.fn.now(),
        });
    }

    const res = await knex
      .from(TableNames.CONTACTS)
      .where('id', contactId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const createContactGroup = async ({
  payload,
}: {
  payload: CreateContactGroupPayload;
}): Promise<ContactGroupModel | Error> => {
  try {
    const insert = await knex('contact_groups').insert(payload);

    const res = await knex
      .from('contact_groups')
      .where('id', _.head(insert))
      .select();
    return camelize(_.head(res));
  } catch (error) {
    console.log(error);
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
    await knex('contact_groups')
      .where('id', id)
      .update({ ...payload, type: 1 });

    const res = await knex.from('contact_groups').where('id', id).select();
    return camelize(_.head(res));
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const deleteContactGroup = async (
  id: ContactGroupId,
): Promise<ContactGroupModel | Error> => {
  try {
    const check = await knex('contact_groups').where('id', id).select();
    if (check.length === 0) {
      return Promise.reject({ message: 'Contact Group does not exist' });
    }

    await knex('contact_groups').where('id', id).del();

    return camelize(_.head(check));
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

// const addContactsToContactGroup = async ({ groupId, contactIds }) => {
//   try {
//     const check = await knex
//       .from('contact_group_members')
//       .whereIn('contact_id', contactIds)
//       .andWhere('contact_group_id', groupId)
//       .select();
//     if (check.length > 0) {
//       return Promise.reject({ message: 'Contact is already in the group' });
//     }

//     const res = await knex('contact_group_members').insert(
//       contactIds.map((c) => ({
//         contact_id: c,
//         contact_group_id: groupId,
//       })),
//     );

//     return res;
//   } catch (error) {
//     console.log(error);
//     return Promise.reject(error);
//   }
// };

const getContactPics = async (
  contactId: ContactId,
): Promise<(ContactPicModel | Error)[]> => {
  try {
    const res = await knex
      .from('contacts_pic')
      .where('contact_id', contactId)
      .whereNull('deleted_at')
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getContactPicByUserIdAndContactId = async ({
  contactId,
  userId,
}: {
  contactId: ContactId;
  userId: UserId;
}): Promise<ContactPicModel | Error> => {
  try {
    const res = await knex('contacts_pic')
      .where({ contact_id: contactId, user_id: userId })
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getContactPicsByUserId = async (userId: UserId) => {
  try {
    const res = await knex('contacts_pic').where('user_id', userId).select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getContactGroupsForContactId = async (
  contactId: ContactId,
): Promise<(ContactGroupModel | Error)[]> => {
  try {
    const res = await knex
      .from({ cgm: 'contact_group_members' })
      .distinct('contact_group_id')
      .innerJoin({ cg: 'contact_groups' }, 'cgm.contact_group_id', 'cg.id')
      .where('cgm.contact_id', contactId)
      .select('cg.*');

    return camelize(res);
  } catch (error) {
    console.log(error);
    return [];
  }
};

const addContactToContactGroup = async (
  contactId: ContactId,
  contactGroupId: ContactGroupId,
): Promise<ContactGroupModel | Error> => {
  try {
    await knex
      .from('contact_group_members')
      .insert({ contact_id: contactId, contact_group_id: contactGroupId });

    const res = await knex
      .from('contact_groups')
      .where('id', contactGroupId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createContactPic = async ({
  payload,
  userId,
}: {
  payload: {
    contact_id: ContactId;
    user_id?: UserId;
    name: string;
    contact_no?: string;
    remarks: string | any;
    // national_format: string;
  };
  userId: UserId;
}): Promise<ContactPicModel | Error> => {
  try {
    const insertObject = {
      contact_id: payload.contact_id,
      user_id: payload.user_id,
      name: payload.name,
      contact_no: payload.contact_no,
      remarks: payload.remarks,
    };

    if (!insertObject.remarks) {
      delete insertObject.remarks;
    }

    if (!insertObject.contact_no) {
      delete insertObject.contact_no;
    }

    if (!insertObject.user_id) {
      delete insertObject.user_id;
    }

    const insert = await knex.from('contacts_pic').insert({
      ...insertObject,
      created_by: userId,
      created_at: knex.fn.now(),
    });

    const res = await knex
      .from('contacts_pic')
      .where('id', _.head(insert))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const updateContactPic = async ({
  contactPicId,
  payload,
}: {
  contactPicId: ContactPicId;
  payload: {
    user_id?: UserId | null;
    contact_no?: string;
    name: string;
    remarks?: string;
  };
}): Promise<ContactPicModel | Error> => {
  try {
    if (payload.user_id === 0) {
      payload.user_id = null;
    } else if (!payload.user_id) {
      delete payload.user_id;
    }

    await knex.from('contacts_pic').where('id', contactPicId).update(payload);

    const res = await knex
      .from('contacts_pic')
      .where('id', contactPicId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const updateContactGroupForContact = async (
  contactId: ContactId,
  contactGroupId: ContactGroupId,
): Promise<ContactGroupModel | Error> => {
  try {
    const check = await knex
      .from('contact_group_members')
      .where({ contact_id: contactId })
      .select();

    if (check.length === 0) {
      return Promise.reject({ message: 'Contact is not in the group' });
    }

    await knex('contact_group_members')
      .where({
        contact_id: contactId,
      })
      .update({ contact_group_id: contactGroupId });

    const res = await knex
      .from('contact_groups')
      .where('id', contactGroupId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const deleteContactPic = async ({
  contactPicId,
}: {
  contactPicId: ContactPicId;
}): Promise<ContactPicModel | Error> => {
  try {
    const check = await knex
      .from('contacts_pic')
      .where('id', contactPicId)
      .select();
    if (check.length === 0) {
      return Promise.reject('Contact Pic does not exists');
    }

    await knex.from('contacts_pic').where('id', contactPicId).del();

    return camelize(_.head(check));
  } catch (error) {
    console.log(error);
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
    const res = await knex
      .from({ j: TableNames.PROJECTS })
      .where({ contact_id: contactId, company_id: companyId })
      .innerJoin({ c: 'cards' }, 'j.team_id', 'c.team_id')
      .whereNull('c.deleted_at')
      .select('c.*');

    return camelize(res);
  } catch (error) {
    console.log(error);
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
    const res = await knex
      .from(TableNames.PROJECTS)
      .where({ contact_id: contactId, company_id: companyId })
      .whereNull('deleted_at')
      .select();

    return camelize(res);
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const upsertContactToGroup = async ({
  contactId,
  groupId,
}: {
  contactId: ContactId;
  groupId: ContactGroupId | null;
}): Promise<ContactModel | Error> => {
  try {
    if (!groupId) {
      await knex('contact_group_members')
        .where({
          contact_id: contactId,
        })
        .del();
    } else {
      await knex('contact_group_members')
        .insert({
          contact_id: contactId,
          contact_group_id: groupId,
        })
        .onConflict('contact_id')
        .merge();
    }

    const res = await knex.from('contacts').where('id', contactId).select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getContactPic = async (
  contactPicId: ContactPicId,
): Promise<ContactPicModel | Error> => {
  try {
    const res = await knex
      .from('contacts_pic')
      .where({ id: contactPicId })
      .select();

    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

//WIP
const getContactActivitiesRaw = async ({
  contactId,
  contactPublicId,
  limit,
  offset,
}: {
  contactId: ContactId;
  contactPublicId: ContactPublicId;
  limit: number;
  offset: number;
}): Promise<(ContactActivitiesModel | Error)[]> => {
  try {
    const res = await knex
      .from({ al: 'audit_logs' })
      .where((builder) => {
        builder
          .whereRaw('JSON_EXTRACT(al.current_values, "$.contact_id") = ?', [
            contactId,
          ])
          .orWhereRaw(
            'JSON_EXTRACT(al.changed_values, "$.contactPublicId") = ?',
            [contactPublicId],
          );
      })

      .limit(limit)
      .offset(offset * limit)
      .orderBy('al.timestamp', 'desc')
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createAuditLog = async (
  payload: AuditLogPayload,
): Promise<AuditLogModel | Error> => {
  try {
    const insert = await knex.from('audit_logs').insert({
      ...payload,
      timestamp: knex.fn.now(),
    });

    const res = await knex
      .from('audit_logs')
      .where('id', _.head(insert))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getContactNotesByContactId = async ({
  contactId,
}: {
  contactId: ContactId;
}): Promise<(ContactNoteModel | Error)[]> => {
  try {
    const res = await knex
      .from(TableNames.CONTACT_NOTES)
      .where({ contact_id: contactId })
      .select();

    return camelize(res);
  } catch (error) {
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
    const insert = await knex
      .from(TableNames.CONTACT_NOTES)
      .insert({
        content: payload.content,
        date: payload.date,
        user_id: payload.user_id,
        note_content: payload?.noteContent,
        contact_id: contactId,
      })
      .select();

    const res = await knex
      .from(TableNames.CONTACT_NOTES)
      .where('id', _.head(insert))
      .select();

    return camelize(_.head(res));
  } catch (error) {
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
    await knex
      .from(TableNames.CONTACT_NOTES)
      .where({ id: contactNoteId })
      .update({
        content: payload.content,
        date: payload.date,
        user_id: payload.user_id,
        note_content: payload?.noteContent,
        edited: 1,
      })
      .select();

    const res = await knex
      .from(TableNames.CONTACT_NOTES)
      .where('id', contactNoteId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteContactNotes = async ({
  contactNoteIds,
}: {
  contactNoteIds: ContactNoteId[];
}): Promise<(ContactNoteModel | Error)[]> => {
  try {
    const res = await knex
      .from(TableNames.CONTACT_NOTES)
      .whereIn('id', contactNoteIds)
      .select();

    await knex
      .from(TableNames.CONTACT_NOTES)
      .whereIn('id', contactNoteIds)
      .delete();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const listContactsForExport = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<ContactExpandedModel[] | Error> => {
  try {
    const res = await knex
      .from({ c: TableNames.CONTACTS })
      .leftJoin(
        { cgm: TableNames.CONTACT_GROUP_MEMBERS },
        'cgm.contact_id',
        'c.id',
      )
      .leftJoin(
        { cg: TableNames.CONTACT_GROUPS },
        'cgm.contact_group_id',
        'cg.id',
      )
      .leftJoin({ cp: TableNames.CONTACT_PICS }, 'cp.contact_id', 'c.id')
      .leftJoin({ u: TableNames.USERS }, 'u.id', 'cp.user_id')
      .where('c.company_id', companyId)
      .whereNull('c.deleted_at')
      .select(
        'c.*',
        'cg.name as contact_group_name',
        'cg.id as contact_group_id',
        'cp.name as pic_name',
        'cp.contact_no as pic_phone',
        'cp.remarks as pic_remarks',
        'cp.created_at as pic_created',
        'cp.updated_at as pic_updated',
        'u.email as pic_email',
      );

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getContactsByName = async (name: string, companyId: CompanyId) => {
  try {
    const res = await knex
      .from(TableNames.CONTACTS)
      .where({ name, company_id: companyId })
      .whereNull('deleted_at')
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAttendances = async (contactId: ContactId) => {
  try {
    const res = await knex
      .from(TableNames.ATTENDANCES)
      .where({ contact_id: contactId })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  getContacts,
  getContactGroupsForContactId,
  getContactGroupById,
  getContactGroups,
  getContactGroupMembers,
  getContactPics,
  getContactPic,
  getContactPicByUserIdAndContactId,
  getContactPicsByUserId,
  getContactActivitiesRaw,
  createContact,
  deleteContacts,
  updateContact,
  createContactGroup,
  updateContactGroup,
  deleteContactGroup,
  //   addMembersToContactGroup,
  getUnassignedMembers,
  addContactToContactGroup,
  createContactPic,
  createAuditLog,
  updateContactPic,
  deleteContactPic,
  getTasks,
  getTaskBoards,
  updateContactGroupForContact,
  upsertContactToGroup,
  getContactNotesByContactId,
  createContactNote,
  updateContactNote,
  deleteContactNotes,
  listContactsForExport,
  getContactsByName,
  getAttendances,
};
