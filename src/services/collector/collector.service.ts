import _ from 'lodash';
import {
  CollectorId,
  CollectorMemberModel,
  CreateCollectorPayload,
  CollectorModel,
} from '@models/collector.model';
import {
  ContactId,
  ContactModel,
  ContactPicModel,
} from '@models/contact.model';
import { CollectorStore } from '@data-access';

//import { getTextId, getTextIds } from '@graphql/typeUtils';
import {
  CompanyId,
  CompanyMemberId,
  CompanyTeamModel,
} from '@models/company.model';
import { UserId, UserModel } from '@models/user.model';
import {
  CollectionService,
  ContactService,
  EventManagerService,
  FilterService,
} from '@services';
import {
  CollectionActivityLogModel,
  CollectionModel,
} from '@models/collection.model';
import logger from '@tools/logger';

const validateIfCollectionExists = async (
  contactId: ContactId,
): Promise<boolean | Error> => {
  try {
    const res = await CollectorStore.getByContactId(contactId);
    if (res.length !== 0) {
      return Promise.reject(
        'Collection for this contact already exists, please select another contact',
      );
    }
    return false;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'collector',
        fnName: 'validateIfCollectionExists',
        contactId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const listCollectorsByUserIdAndCompanyId = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<(CollectorModel | Error)[]> => {
  try {
    const res = await CollectorStore.listCollectorsByUserIdAndCompanyId({
      companyId,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'collector',
        fnName: 'listCollectorsByUserIdAndCompanyId',
        companyId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const createCollector = async ({
  payload,
}: {
  payload: CreateCollectorPayload;
}): Promise<CollectorModel | Error> => {
  try {
    const collector = await CollectorStore.createCollector({
      payload,
    });

    if (payload.member_ids !== undefined) {
      const collectorId = payload.contact_id;

      await CollectorStore.createCollectorMembers({
        collectorId,
        memberIds: payload.member_ids,
      });
    }
    return collector;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'collector',
        fnName: 'createCollector',
        payload,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const deleteCollectors = async ({
  collectorIds,
}: {
  collectorIds: CollectorId[];
}): Promise<CollectorModel[] | Error> => {
  try {
    const res = await CollectorStore.deleteCollectors({ collectorIds });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'collector',
        fnName: 'deleteCollectors',
        collectorIds,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const updateCollectorAssignToTeam = async ({
  team,
  collector,
  loaders,
  user,
}: {
  team: CompanyTeamModel;
  collector: CollectorModel;
  loaders: any;
  user: UserModel;
}): Promise<CollectorModel | Error> => {
  try {
    const contact = (await loaders.contacts.load(collector.id)) as ContactModel;

    const collectorMembers = (await getCollectorMembersByCollectorId({
      collectorId: collector.id,
    })) as CollectorMemberModel[];
    await EventManagerService.logTeamAddRemoveCollector({
      updatedTeam: team,
      collector,
      collectorMembers,
      contact,
      updatedBy: user,
    });

    const res = CollectorStore.updateCollectorByTeam({
      teamId: team.id,
      collectorId: collector.id,
      userId: user.id,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'collector',
        fnName: 'updateCollectorAssignToTeam',
        teamId: team?.id,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const updateCollectorAssignToMembers = async ({
  memberIds,
  collector,
  loaders,
  user,
}: {
  memberIds: CompanyMemberId[];
  collector: CollectorModel;
  loaders: any;
  user: UserModel;
}): Promise<CollectorModel | Error> => {
  try {
    const contact = (await loaders.contacts.load(collector.id)) as ContactModel;
    const collectorMembers = (await getCollectorMembersByCollectorId({
      collectorId: collector.id,
    })) as CollectorMemberModel[];
    await EventManagerService.logAssigneeAddRemoveCollector({
      updatedMemberIds: memberIds,
      collector,
      collectorMembers,
      contact,
      updatedBy: user,
    });

    const res = CollectorStore.updateCollectorByCollectorMember({
      memberIds,
      collectorId: collector.id,
      userId: user.id,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'collector',
        fnName: 'updateCollectorAssignToMembers',
        memberIds,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getCollectorMembersByCollectorId = async ({
  collectorId,
}: {
  collectorId: CollectorId;
}): Promise<(CollectorMemberModel | Error)[]> => {
  try {
    const res = await CollectorStore.getCollectorMembersByCollectorId({
      collectorId,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'collector',
        fnName: 'getCollectorMembersByCollectorId',
        collectorId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getCollaboratedCollectors = async ({
  userId,
  loaders,
}: {
  userId: UserId;
  loaders: any;
}): Promise<(CollectorModel | Error)[]> => {
  try {
    const contactPics = await ContactService.getContactPicsByUserId(userId);
    const contactIds = _.uniq(_.map(contactPics, 'contact_id'));

    const collectors = (await loaders.collectors.loadMany(
      contactIds,
    )) as CollectorModel[];

    const res = collectors.filter((collector) => !_.isEmpty(collector));

    const mappedCollectors = await Promise.all(
      _.map(res, async (c) => {
        const collections = await CollectionService.listCollectionsByContactId({
          contactId: c?.id,
        });

        const pic = await CollectorStore.getAssigneesByCollectorId({
          collectorId: c?.id,
          userId: userId,
        });

        if (pic instanceof Error) {
          return null;
        } else {
          const filteredCollections =
            await FilterService.filterCollectionsForCollector({
              collections: collections as CollectionModel[],
              contactPicId: pic?.id,
            });
          if (filteredCollections?.length > 0) {
            return c;
          }
        }
      }),
    );

    const filteredCollectors = mappedCollectors?.filter(
      (mp) => mp,
    ) as CollectorModel[];

    return filteredCollectors;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'collector',
        fnName: 'getCollaboratedCollectors',
        userId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

/* NOTE: different from getCollectionAssigneesByCollectorId
see the comments there (Enoch) */
const getAssigneesByCollectorId = async ({
  collectorId,
  userId,
}: {
  collectorId: CollectorId;
  userId: UserId;
}): Promise<ContactPicModel | Error> => {
  try {
    const res = await CollectorStore.getAssigneesByCollectorId({
      collectorId,
      userId,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'collector',
        fnName: 'getAssigneesByCollectorId',
        userId,
        collectorId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

/* NOTE: this one combines all the assignees from collections across that collector,
the other function getAssigneesByCollectorId is deprecated in v3 and refers to the
previous workflow where assignees were linked directly to the collector entity itself. 

In v3 the assignees are assigned to the individual collections. (Enoch)
*/
const getCollectionAssigneesByCollectorId = async ({
  collectorId,
  user,
}: {
  collectorId: CollectorId;
  user: UserModel;
}) => {
  try {
    const res = await CollectorStore.getCollectionAssigneesByCollectorId({
      collectorId,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'collector',
        fnName: 'getCollectionAssigneesByCollectorId',
        collectorId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getCollectorsActivitiesByCompanyId = async (
  companyId: CompanyId,
): Promise<CollectionActivityLogModel[]> => {
  try {
    const contacts = await ContactService.getContacts(companyId);
    const collectorIds = _.map(contacts, 'id');

    const logs: CollectionActivityLogModel[] = [];

    for (const collectorId of collectorIds) {
      const collectionLogs =
        await CollectionService.getCollectorCollectionActivityLogs(collectorId);
      logs.push(...collectionLogs);
    }

    return logs;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'collector',
        fnName: 'getCollectorsActivitiesByCompanyId',
        companyId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

export default {
  getCollectorMembersByCollectorId,
  getCollaboratedCollectors,
  validateIfCollectionExists,
  createCollector,
  deleteCollectors,
  updateCollectorAssignToTeam,
  updateCollectorAssignToMembers,
  listCollectorsByUserIdAndCompanyId,
  getAssigneesByCollectorId,
  getCollectionAssigneesByCollectorId,
  getCollectorsActivitiesByCompanyId,
};
