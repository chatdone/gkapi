import {
  ApolloError,
  AuthenticationError,
  UserInputError,
} from 'apollo-server-express';
import { GraphQLUpload } from 'graphql-upload';
import { Resolvers } from '@generated/graphql-types';
import {
  ContactGroupModel,
  ContactModel,
  ContactNoteModel,
} from '@models/contact.model';

import {
  CollectionService,
  CompanyService,
  ContactService,
  TagService,
} from '@services';
import { CompanyModel } from '@models/company.model';
import { handleResolverError } from '../../errors';
import { UserModel } from '@models/user.model';
import _ from 'lodash';
import {
  getCompany,
  getContact,
  getContactGroup,
  getContactNote,
  getContactPic,
  getContacts,
} from '@data-access/getters';
import { TagModel } from '@models/tag.model';
import dayjs from 'dayjs';

export const resolvers: Resolvers = {
  Query: {
    contact: async (root, { id }, { loaders, auth: { isAuthenticated } }) => {
      if (!isAuthenticated) {
        throw new AuthenticationError('Not logged in');
      }
      const res = (await loaders.contacts.load(id)) as ContactModel;
      return res;
    },
    contacts: async (
      root,
      { companyId },
      { loaders, auth: { isAuthenticated } },
    ) => {
      if (!isAuthenticated) {
        throw new AuthenticationError('Not logged in');
      }

      const company = await getCompany(companyId);

      const res = await ContactService.getContacts(company.id);

      return res;
    },
    contactGroups: async (
      root,
      { companyId },
      { loaders, auth: { isAuthenticated } },
    ) => {
      if (!isAuthenticated) {
        throw new AuthenticationError('Not logged in');
      }
      const company = await getCompany(companyId);

      const res = await ContactService.getContactGroups(company.id);

      const unassignedGroup = {
        id_text: 'unassigned',
        name: 'Unassigned',
        company_id: company.id,
      } as ContactGroupModel;

      const appendUnassigned = res.concat(unassignedGroup);
      return appendUnassigned;
    },
    contactGroup: async (
      root,
      { companyId, groupId },
      { loaders, auth: { isAuthenticated } },
    ) => {
      if (!isAuthenticated) {
        throw new AuthenticationError('Not logged in');
      }

      const company = await getCompany(companyId);

      if (groupId === 'unassigned') {
        const unassignedGroup = {
          id_text: 'unassigned',
          name: 'Unassigned',
          company_id: company.id,
        } as ContactGroupModel;

        return unassignedGroup;
      } else {
        const contactGroup = await getContactGroup(groupId);

        return contactGroup;
      }
    },
    contactActivities: async (
      root,
      { contactId, limit, offset },
      { loaders, auth: { user } },
    ) => {
      const contact = await getContact(contactId);
      const companyId = contact.company_id;

      const res = await ContactService.getContactActivitiesRaw({
        contactId: contact.id,
        contactPublicId: contact.id_text,
        limit,
        offset,
        userId: user.id,
        companyId,
      });

      return res;
    },
  },
  Upload: GraphQLUpload,
  Mutation: {
    createContact: async (
      root,
      { companyId, input, contactGroupId, dealCreator },
      { loaders, auth: { user } },
    ) => {
      try {
        const { accountCode } = input;
        const company = await getCompany(companyId);

        let groupId = null;
        if (contactGroupId) {
          const group = await getContactGroup(contactGroupId);
          groupId = group.id;
        }

        let dealCreatorId;
        if (dealCreator) {
          const dealCreatorUser = (await loaders.users.load(
            dealCreator,
          )) as UserModel;

          if (!dealCreatorUser) {
            throw new UserInputError('User id for deal creator does not exist');
          }

          dealCreatorId = dealCreatorUser.id;
        }

        const tags = input?.tagIds
          ? ((await loaders.tags.loadMany(input?.tagIds)) as TagModel[])
          : undefined;

        const payload = { ...input };
        if (input.tagIds) {
          delete payload.tagIds;
        }

        const createResult = await ContactService.createContact({
          companyId: company.id,
          groupId,
          payload: {
            ...payload,
            ...(accountCode && { accountCode }),
            company_id: company.id,
          },
          user,
          dealCreatorId,
          tags,
        });

        return createResult;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },

    deleteContacts: async (
      root,
      { companyId, contactIds },
      { loaders, auth: { user } },
    ) => {
      const company = await getCompany(companyId);

      const contacts = await getContacts(contactIds as string[]);

      const res = await ContactService.deleteContacts({
        companyId: company.id,
        contactIds: contacts.map((contact) => contact.id),
        userId: user.id,
      });

      return res;
    },
    createContactPic: async (
      root,
      { companyId, contactId, input },
      { loaders, auth: { user } },
    ) => {
      const company = await getCompany(companyId);

      const contact = await getContact(contactId);

      const inputContactPic = {
        created_by: user.id,
        name: input.name,
        contact_no: input?.contact_no ? input.contact_no : undefined,
        email: input?.email ? input.email : undefined,
        contact_id: contact.id,
        remarks: input.remarks || undefined,
      };

      const createResult = await ContactService.createContactPic({
        createdBy: user,
        contact,
        payload: inputContactPic,
      });

      return createResult;
    },
    updateContactPic: async (
      root,
      { companyId, input, picId },
      { loaders, auth: { user } },
    ) => {
      const company = await getCompany(companyId);

      const contactPic = await getContactPic(picId);

      const updateResult = await ContactService.updateContactPic({
        contactPic: contactPic,
        payload: input,
        user,
      });

      return updateResult;
    },
    deleteContactPic: async (
      root,
      { companyId, picId },
      { loaders, auth: { user } },
    ) => {
      const company = await getCompany(companyId);

      const contactPic = await getContactPic(picId);

      //cannot use getter here as contact_id is private id
      const contact = (await loaders.contacts.load(
        contactPic.contact_id,
      )) as ContactModel;

      await ContactService.deleteContactPic({
        contact,
        contactPic,
        user,
      });

      return { contact };
    },
    updateContact: async (
      root,
      { companyId, input, contactGroupId, contactId, dealCreator },
      { loaders, auth: { user } },
    ) => {
      try {
        const company = await getCompany(companyId);

        const contact = await getContact(contactId);

        let groupId;
        if (contactGroupId !== 'unassigned' && contactGroupId !== undefined) {
          const group = (await loaders.contactGroups.load(
            contactGroupId,
          )) as ContactGroupModel;

          if (!group || !group.id) {
            throw new UserInputError('That contact group does not exist');
          }

          const currentGroup = _.head(
            await ContactService.getContactGroupsForContactId(contact.id),
          ) as ContactGroupModel;
          if (currentGroup?.id_text !== group?.id_text) {
            groupId = group.id;
          }
        } else if (contactGroupId == 'unassigned') {
          groupId = 0;
        }

        let deal_creator;
        if (dealCreator) {
          const user = (await loaders.users.load(dealCreator)) as UserModel;
          if (!user)
            throw new UserInputError('User id for deal creator does not exist');
          deal_creator = user.id;
        }

        const updateResult = await ContactService.updateContact({
          companyId: company.id,
          payload: input,
          groupId,
          contact,
          user,
          loaders,
          dealCreator: deal_creator,
        });

        return updateResult;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    createContactGroup: async (_, { companyId, input }, { loaders }) => {
      try {
        const company = await getCompany(companyId);

        const createResult = await ContactService.createContactGroup({
          payload: {
            ...input,
            company_id: company.id,
          },
        });

        return createResult;
      } catch (error) {
        handleResolverError(error);
      }
    },
    updateContactGroup: async (_, { groupId, input }, { loaders }) => {
      try {
        const group = await getContactGroup(groupId);

        const updateResult = await ContactService.updateContactGroup({
          id: group.id,
          payload: input,
        });

        return updateResult;
      } catch (error) {
        handleResolverError(error);
      }
    },
    deleteContactGroup: async (_, { groupId }, { loaders }) => {
      try {
        const group = await getContactGroup(groupId);

        const res = await ContactService.deleteContactGroup(group.id);

        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },
    addMembersToContactGroup: async (_, { groupId, input }, { loaders }) => {
      const { contact_ids } = input;
      const contacts = await getContacts(contact_ids as string[]);

      let group = null;
      if (groupId) {
        group = (await loaders.contactGroups.load(
          groupId,
        )) as ContactGroupModel;

        if (!group || !group.id) {
          throw new UserInputError('That contact group does not exist');
        }
      }

      const res = await ContactService.addContactsToContactGroup({
        groupId: group ? group.id : null,
        contactIds: contacts.map((c) => c.id),
      });

      return res;
    },
    //@ts-ignore
    bulkUploadContacts: async (
      root,
      { groupId, companyId, attachment },
      { loaders, auth: { user } },
    ) => {
      try {
        let contactGroupId = null;

        if (groupId) {
          const group = await getContactGroup(groupId);

          contactGroupId = group.id;
        }

        const company = await getCompany(companyId);

        const isMember = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isMember) {
          return new UserInputError('User is not a member');
        }

        const result = await ContactService.bulkUploadContacts({
          attachment: await attachment,
          user,
          companyId: company?.id,
          groupId: contactGroupId,
        });

        return { contacts: result };
      } catch (error) {
        handleResolverError(error);
      }
    },

    createContactNote: async (
      root,
      { contactId, input },
      { loaders, auth: { user } },
    ) => {
      try {
        const { noteContent, content, date } = input;
        const contact = await getContact(contactId);

        //cannot use getter here, company_id is private id
        const company = (await loaders.companies.load(
          contact.company_id,
        )) as CompanyModel;

        if (!company) {
          return new UserInputError('Company does not exist');
        }

        const isMember = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isMember) {
          return new UserInputError('User is not a member');
        }

        if (!user) {
          return new UserInputError('User does not exist');
        }
        let userPrivateId;

        if (input?.user_id || input?.userId) {
          const user = (await loaders.users.load(
            input?.user_id || input?.userId,
          )) as UserModel;
          userPrivateId = user?.id;
        }

        const res = await ContactService.createContactNote({
          contactId: contact.id,
          payload: {
            ...(noteContent && { noteContent }),
            ...(content && { content }),
            ...(date && { date }),
            user_id: userPrivateId,
          },
        });

        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },

    updateContactNote: async (
      root,
      { contactNoteId, input },
      { loaders, auth: { user } },
    ) => {
      try {
        const { noteContent, content, date } = input;
        const contactNote = await getContactNote(contactNoteId);

        const contact = (await loaders.contacts.load(
          contactNote.contact_id,
        )) as ContactModel;

        if (!contact) {
          return new UserInputError('Contact does not exist');
        }

        const company = (await loaders.companies.load(
          contact.company_id,
        )) as CompanyModel;

        if (!company) {
          return new UserInputError('Company does not exist');
        }

        const isMember = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isMember) {
          return new UserInputError('User is not a member');
        }

        if (!user) {
          return new UserInputError('User does not exist');
        }

        let userPrivateId;

        if (input?.user_id || input?.userId) {
          const user = (await loaders.users.load(
            input?.user_id || input?.userId,
          )) as UserModel;
          userPrivateId = user?.id;
        }

        const res = await ContactService.updateContactNote({
          contactNoteId: contactNote.id,
          payload: {
            ...(noteContent && { noteContent }),
            ...(content && { content }),
            ...(date && { date }),
            user_id: userPrivateId,
          },
        });

        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },
    //@ts-ignore
    deleteContactNotes: async (
      root,
      { contactNoteIds },
      { loaders, auth: { user } },
    ) => {
      try {
        const contactNotes = (await loaders.contactNotes.loadMany(
          contactNoteIds,
        )) as ContactNoteModel[];

        const filteredContactNotes = contactNotes.filter((cn) => cn);

        if (filteredContactNotes.length === 0) {
          return new UserInputError('Contact note(s) does not exist');
        }

        await Promise.all(
          _.map(filteredContactNotes, async (cn) => {
            const contact = (await loaders.contacts.load(
              cn.contact_id,
            )) as ContactModel;

            if (!contact) {
              return new UserInputError('Contact does not exist');
            }

            const company = (await loaders.companies.load(
              contact.company_id,
            )) as CompanyModel;

            if (!company) {
              return new UserInputError('Company does not exist');
            }

            const isMember = await CompanyService.validateUserInCompany({
              userId: user.id,
              companyId: company.id,
            });

            if (!isMember) {
              return new UserInputError('User is not a member');
            }
          }),
        );

        if (!user) {
          return new UserInputError('User does not exist');
        }

        const contactNotePrivateIds = _.map(
          filteredContactNotes,
          (cn) => cn.id,
        );

        const res = (await ContactService.deleteContactNotes({
          contactNoteIds: contactNotePrivateIds,
        })) as ContactNoteModel[];

        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },
  },
  Contact: {
    id: ({ id_text }) => id_text,
    company: async ({ company_id }, args, { loaders }) => {
      return company_id ? await loaders.companies.load(company_id) : null;
    },
    //deprecated
    deal_creator: async ({ deal_creator }, args, { loaders }) => {
      return deal_creator ? await loaders.users.load(deal_creator) : null;
    },
    dealCreator: async ({ deal_creator }, args, { loaders }) => {
      return deal_creator ? await loaders.users.load(deal_creator) : null;
    },
    //deprecated
    created_by: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    //deprecated
    updated_by: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    //deprecated
    deleted_by: async ({ deleted_by }, args, { loaders }) => {
      return deleted_by ? await loaders.users.load(deleted_by) : null;
    },
    createdBy: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    updatedBy: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    deletedBy: async ({ deleted_by }, args, { loaders }) => {
      return deleted_by ? await loaders.users.load(deleted_by) : null;
    },
    pics: async ({ id }) => {
      const res = await ContactService.getContactPics(id);

      return res;
    },
    groups: async ({ id }) => {
      const res = await ContactService.getContactGroupsForContactId(id);

      return res;
    },
    //deprecated
    task_boards: async ({ company_id, id }) => {
      const res = await ContactService.getTaskBoards({
        companyId: company_id,
        contactId: id,
      });

      return res;
    },
    taskBoards: async ({ company_id, id }) => {
      const res = await ContactService.getTaskBoards({
        companyId: company_id,
        contactId: id,
      });

      return res;
    },
    collections: async ({ id }) => {
      const collections = await CollectionService.listCollectionsByContactId({
        contactId: id,
      });

      return collections;
    },
    activities: async (
      { id, id_text, company_id },
      { limit, offset },
      { auth: { user } },
    ) => {
      const res = await ContactService.getContactActivitiesRaw({
        contactId: id,
        contactPublicId: id_text,
        limit,
        offset,
        userId: user.id,
        companyId: company_id,
      });

      return res;
    },
    tags: async ({ id }) => {
      const res = await TagService.getTagsByContactId({ contactId: id });

      return res;
    },
    notes: async ({ id }, args, { auth: { user } }) => {
      const res = await ContactService.getContactNotesByContactId({
        contactId: id,
      });

      return res;
    },
    attendances: async ({ id }, args, { auth: { user } }) => {
      const res = await ContactService.getAttendances(id);

      return res;
    },
  },
  ContactGroup: {
    id: ({ id_text }) => id_text,
    type: ({ type }) => type || 0,
    contacts: async ({ id, id_text, company_id }) => {
      if (id_text === 'unassigned') {
        const res = await ContactService.getUnassignedMembers(company_id);
        return res;
      }

      const res = await ContactService.getContactGroupMembers(id);
      return res;
    },
    company: async ({ company_id }, args, { loaders }) => {
      return company_id ? await loaders.companies.load(company_id) : null;
    },
    updated_at: ({ modified_at }) => modified_at,
    updatedAt: ({ modifiedAt }) => modifiedAt,
    count: async ({ id, id_text, company_id }) => {
      if (id_text === 'unassigned') {
        const res = await ContactService.getUnassignedMembers(company_id);
        return res.length;
      }

      const res = await ContactService.getContactGroupMembers(id);
      return res.length;
    },
  },
  ContactPic: {
    id: ({ id_text }) => id_text,
    user: async ({ user_id }, args, { loaders }) => {
      return user_id ? await loaders.users.load(user_id) : null;
    },
    contact: async ({ contact_id }, args, { loaders }) => {
      return contact_id ? await loaders.contacts.load(contact_id) : null;
    },
  },
  ContactTask: {
    id: ({ id_text }) => id_text,
  },
  ContactActivityRaw: {
    //deprecated
    previous_values: async ({ previous_values }, args, { loaders }) => {
      if (typeof previous_values !== 'string') {
        return JSON.stringify(previous_values);
      } else if (typeof previous_values === 'string') {
        return previous_values;
      }

      return '{}';
    },
    //deprecated
    current_values: async ({ current_values }, args, { loaders }) => {
      if (typeof current_values !== 'string') {
        return JSON.stringify(current_values);
      } else if (typeof current_values === 'string') {
        return current_values;
      }

      return '{}';
    },
    //deprecated
    changed_values: async ({ changed_values }, args, { loaders }) => {
      if (typeof changed_values !== 'string') {
        return JSON.stringify(changed_values);
      } else if (typeof changed_values === 'string') {
        return changed_values;
      }
      return '{}';
    },
    previousValues: async ({ previous_values }, args, { loaders }) => {
      if (typeof previous_values !== 'string') {
        return JSON.stringify(previous_values);
      } else if (typeof previous_values === 'string') {
        return previous_values;
      }

      return '{}';
    },
    currentValues: async ({ current_values }, args, { loaders }) => {
      if (typeof current_values !== 'string') {
        return JSON.stringify(current_values);
      } else if (typeof current_values === 'string') {
        return current_values;
      }

      return '{}';
    },
    changedValues: async ({ changed_values }, args, { loaders }) => {
      if (typeof changed_values !== 'string') {
        return JSON.stringify(changed_values);
      } else if (typeof changed_values === 'string') {
        return changed_values;
      }
      return '{}';
    },
  },
  ContactNote: {
    id: ({ id_text }) => {
      return id_text;
    },
    contact: async ({ contact_id }, args, { loaders }) => {
      return await loaders.contacts.load(contact_id);
    },
    user: async ({ user_id }, args, { loaders }) => {
      return user_id ? await loaders.users.load(user_id) : null;
    },
    content: ({ content }) => {
      if (typeof content !== 'string') {
        return JSON.stringify(content);
      } else {
        return content;
      }
    },
    noteContent: ({ noteContent }) => {
      return noteContent
        ? typeof noteContent === 'string'
          ? noteContent
          : JSON.stringify(noteContent)
        : null;
    },
  },

  ContactType: {
    NONE: 0,
    INDIVIDUAL: 1,
    COMPANY: 2,
  },
  ContactGroupType: {
    UNASSIGNED: 0,
    INDIVIDUAL: 1,
    COMPANY: 2,
  },
  ContactTaskStatusType: {
    PENDING: 1,
    DONE: 2,
    REJECTED: 3,
  },
  ContactActivityType: {
    TASK_CREATED: 'TASK_CREATED',
    TASK_ARCHIVED: 'TASK_ARCHIVED',
    TASK_UNARCHIVED: 'TASK_UNARCHIVED',
    TASK_REMOVED: 'TASK_REMOVED',
    UPDATED_DUE_DATE: 'UPDATED_DUE_DATE',
    UPDATED_TEAM_STATUS: 'UPDATED_TEAM_STATUS',
    ASSIGNEE_ADDED: 'ASSIGNEE_ADDED',
    ASSIGNEE_REMOVED: 'ASSIGNEE_REMOVED',
    PIC_ADDED: 'PIC_ADDED',
    PIC_REMOVED: 'PIC_REMOVED',
    ATTACHMENT_UPLOADED: 'ATTACHMENT_UPLOADED',
    ATTACHMENT_REMOVED: 'ATTACHMENT_REMOVED',
  },
  ContactActivityTableType: {
    ALL: 'All',
    TASKS: 'Tasks',
    COLLECTIONS: 'Collections',
    CONTACTS: 'Contacts',
  },
};
