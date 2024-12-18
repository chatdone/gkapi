import { camelize } from '@data-access/utils';
import { TableNames } from '@db-tables';
import knex from '@db/knex';
import {
  CollectorId,
  CollectorMemberModel,
  CollectorModel,
  CreateCollectorPayload,
} from '@models/collector.model';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
  CompanyTeamId,
} from '@models/company.model';
import { ContactId, ContactPicModel } from '@models/contact.model';
import { UserId } from '@models/user.model';
import _ from 'lodash';

const getByContactId = async (
  contactId: ContactId,
): Promise<(CollectorModel | Error)[]> => {
  try {
    const res = await knex('collectors').where('id', contactId).select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectorMembersByCollectorId = async ({
  collectorId,
}: {
  collectorId: CollectorId;
}): Promise<(CollectorMemberModel | Error)[]> => {
  try {
    const res = await knex('collectors_members')
      .where('collector_id', collectorId)
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const listCollectorsByUserIdAndCompanyId = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<(CollectorModel | Error)[]> => {
  try {
    const res = await knex('collectors')
      .where('company_id', companyId)
      .whereNull('deleted_at')
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createCollector = async ({
  payload,
}: {
  payload: CreateCollectorPayload;
}): Promise<CollectorModel | Error> => {
  try {
    await knex('collectors').insert({
      id: payload.contact_id,
      company_id: payload.company_id,
      ...(payload.team_id && { team_id: payload.team_id }),
      created_by: payload.user_id,
      created_at: knex.fn.now(),
    });

    const insertedRow = await knex('collectors').where(
      'id',
      payload.contact_id,
    );
    return camelize(_.head(insertedRow));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createCollectorMembers = async ({
  collectorId,
  memberIds,
}: {
  collectorId: CollectorId;
  memberIds: CompanyMemberId[];
}): Promise<boolean | Error> => {
  try {
    const res = await Promise.all(
      _.map(memberIds, async (memberId) => {
        await knex('collectors_members').insert({
          collector_id: collectorId,
          member_id: memberId,
        });
      }),
    );

    return true;
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCollectors = async ({
  collectorIds,
}: {
  collectorIds: CollectorId[];
}): Promise<CollectorModel[] | Error> => {
  try {
    const collectors = await knex('collectors')
      .whereIn('id', collectorIds)
      .del('*');

    return camelize(collectors);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCollectorByTeam = async ({
  teamId,
  collectorId,
  userId,
}: {
  teamId: CompanyTeamId;
  collectorId: CollectorId;
  userId: UserId;
}): Promise<CollectorModel | Error> => {
  try {
    await knex('collectors')
      .where('id', collectorId)
      .update({ team_id: teamId, updated_by: userId });

    await knex('collectors_members').where('collector_id', collectorId).del();

    const res = await knex('collectors').where('id', collectorId).select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCollectorByCollectorMember = async ({
  memberIds,
  collectorId,
  userId,
}: {
  memberIds: CompanyMemberId[];
  collectorId: CollectorId;
  userId: UserId;
}): Promise<CollectorModel | Error> => {
  try {
    await knex('collectors_members').where('collector_id', collectorId).del();

    await knex('collectors')
      .where('id', collectorId)
      .update({ team_id: knex.raw(`DEFAULT`), updated_by: userId });

    await createCollectorMembers({ collectorId, memberIds });

    const res = await knex('collectors').where('id', collectorId).select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAssigneesByCollectorId = async ({
  collectorId,
  userId,
}: {
  collectorId: CollectorId;
  userId: UserId;
}): Promise<ContactPicModel | Error> => {
  try {
    const res = await knex
      .from({ collectors: 'collectors' })
      .leftJoin({ contacts: 'contacts' }, 'collectors.id', 'contacts.id')
      .leftJoin(
        { contact_pics: 'contacts_pic' },
        'contacts.id',
        'contact_pics.contact_id',
      )
      .where({
        'contact_pics.deleted_at': null,
        'collectors.id': collectorId,
        'contact_pics.user_id': userId,
      })
      .groupBy('contact_pics.id')
      .select('contact_pics.*');

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionAssigneesByCollectorId = async ({
  collectorId,
}: {
  collectorId: CollectorId;
}): Promise<CompanyMemberModel[]> => {
  try {
    const rawRes = await knex.raw(`
			SELECT
				DISTINCT cm.*
			FROM
				${TableNames.COLLECTION_ASSIGNEES} ca
			INNER JOIN ${TableNames.COMPANY_MEMBERS} cm ON
				ca.member_id = cm.id
			WHERE
				ca.collection_id IN (
				SELECT
					cc.id
				FROM
					${TableNames.COLLECTIONS} cc 
				WHERE
					cc.contact_id = ${collectorId})
			GROUP BY
				cm.id
		`);
    const res = _.head(rawRes) as CompanyMemberModel[];

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  getByContactId,
  getCollectorMembersByCollectorId,
  createCollector,
  createCollectorMembers,
  deleteCollectors,
  listCollectorsByUserIdAndCompanyId,
  updateCollectorByTeam,
  updateCollectorByCollectorMember,
  getAssigneesByCollectorId,

  getCollectionAssigneesByCollectorId,
};
