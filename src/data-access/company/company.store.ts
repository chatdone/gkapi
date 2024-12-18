import { redis, UserStore } from '@data-access';
import { camelize, camelizeOnly, verifyMatchingIds } from '@data-access/utils';
import DataLoader from 'dataloader';
import knex from '@db/knex';
import { CreateCompanyInput } from '@generated/graphql-types';
import { CollectionId } from '@models/collection.model';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
  CompanyMemberReferenceImageModel,
  CompanyModel,
  CompanyPermissionModel,
  CompanyProfileModel,
  CompanyPublicId,
  CompanyQuotaUsageModel,
  CompanyServiceHistoryId,
  CompanyServiceHistoryModel,
  CompanyStorageListModel,
  CompanyTeamId,
  CompanyTeamMemberModel,
  CompanyTeamModel,
  CompanyTeamStatusId,
  CompanyTeamStatusModel,
  CompanyTeamStatusPayload,
  CompanyTeamStatusSequenceUpdatePayload,
  CompanyWorkDaySettingModel,
  EmployeeTypeId,
  EmployeeTypeModel,
  UpdateCompanyInfoPayload,
  UpdateCompanyMemberInfoPayload,
  UpdateCompanyTeamInfoPayload,
  UpdateCompanyWorkDayPayload,
} from '@models/company.model';
import { CompanySenangPayCredentialsModel } from '@models/senangpay.model';
import { CompanySubscriptionModel } from '@models/subscription.model';
import { AffectedRowsResult, TaskId } from '@models/task.model';
import { UserId } from '@models/user.model';
import logger from '@tools/logger';
import dayjs from 'dayjs';
import { TableNames } from '@db-tables';
import _ from 'lodash';
import { PrivateOrPublicId } from '@models/common.model';
// TASK_STATUSES
// const COMPANY_TEAM_STATUSES = 'card_statuses';
// const COMPANY_SERVICES_HISTORIES = 'company_services_histories';

export const companyMemberTypes = {
  ADMIN: 1,
  MANAGER: 2,
  MEMBER: 3,
};

const createLoaders = () => {
  return {
    companies: new DataLoader((keys) =>
      exportFunctions.batchGetCompanies(keys as PrivateOrPublicId[]),
    ),
  };
};

const batchGetCompanies = async (ids: PrivateOrPublicId[]) => {
  try {
    const res = await knex
      .from(TableNames.COMPANIES)
      .whereIn('id', ids)
      .orWhereIn(
        'id_text',
        ids.map((id) => id.toString()),
      )
      .select();

    verifyMatchingIds(res, ids);

    return camelizeOnly(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const listCompanies = async (input?: {
  offset?: number;
  limit?: number;
  orderBy?: string;
  sortDirection?: string;
}) => {
  try {
    const {
      offset = 0,
      limit = 10,
      orderBy = 'name',
      sortDirection = 'asc',
    } = input || {};

    const res = await knex
      .from(TableNames.COMPANIES)
      .limit(limit)
      .offset(offset)
      .orderBy(orderBy, sortDirection)
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompaniesById = async (
  input: PrivateOrPublicId | PrivateOrPublicId[],
) => {
  try {
    const loaders = createLoaders();

    if (Array.isArray(input)) {
      return await loaders.companies.loadMany(input);
    } else {
      return await loaders.companies.load(input);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanyMembers = async (
  id: CompanyId,
): Promise<(CompanyMemberModel | Error)[]> => {
  try {
    const res = await knex
      .from({ cm: 'company_members' })
      .join({ u: 'users' }, 'cm.user_id', 'u.id')
      .where('cm.company_id', id)
      .whereNull('cm.deleted_at')

      .select('cm.*', 'u.name as user_name', 'u.email as user_email');

    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getCompanyTeamsById = async ({ ids }: { ids: CompanyTeamId[] }) => {
  try {
    const res = await knex
      .from(TableNames.COMPANY_TEAMS)
      .whereIn('id', ids)
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const invalidateCachedMember = (member: CompanyMemberModel) => {
  redis
    .get(`member-user-company-id:${member?.userId}+${member.companyId}`)
    .then((member) => {
      redis.deleteKeysByPattern(
        `*member-user-company-id:*${member?.userId}+${member.companyId}*`,
      );
    })
    .catch((err) => {
      console.error(err);
    });
};

const setMemberCacheByUserIdAndCompanyId = async (
  member: CompanyMemberModel,
) => {
  if (member?.id) {
    // await redis.set(
    //   `member-user-company-id:${member?.userId}+${member.companyId}`,
    //   member,
    // );
  }
};

const getMemberByUserIdAndCompanyId = async ({
  companyId,
  userId,
}: {
  companyId: CompanyId;
  userId: UserId;
}): Promise<CompanyMemberModel | Error> => {
  try {
    const cacheKey = `member-user-company-id:${userId}${companyId}}`;
    const cacheResult = await redis.get(cacheKey);

    if (cacheResult) {
      return cacheResult;
    }

    const res = await knex
      .from('company_members')
      .where({ company_id: companyId, user_id: userId })
      .whereNull('company_members.deleted_at')
      .select();

    const member = camelize(_.head(res));
    if (!_.isEmpty(member)) {
      await setMemberCacheByUserIdAndCompanyId(member);
    }

    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const getCompanyMembersByUserId = async (
  userId: UserId,
): Promise<(CompanyMemberModel | Error)[]> => {
  try {
    const res = await knex
      .from('company_members')
      .where({ user_id: userId })
      .whereNull('company_members.deleted_at')
      .select();

    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getCompanyMember = async (
  companyMemberId: CompanyMemberId,
): Promise<CompanyMemberModel | Error> => {
  try {
    const res = await knex
      .from('company_members')
      .where({ id: companyMemberId })
      .select();

    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const getCompanyTeams = async (
  id: CompanyId,
): Promise<(CompanyTeamModel | Error)[]> => {
  try {
    const res = await knex
      .from('teams')
      .where('company_id', id)
      .whereNull('deleted_at')
      .orderBy('title')
      .select();

    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const invalidateCachedCompanyTeams = ({
  userId,
  companyId,
}: {
  userId: UserId;
  companyId: CompanyId;
}) => {
  redis
    .get(`team-user-company-id:${userId}+${companyId}`)
    .then((member) => {
      redis.deleteKeysByPattern(
        `*team-user-company-id:*${userId}+${companyId}*`,
      );
    })
    .catch((err) => {
      console.error(err);
    });
};

const setCompanyTeamsCacheByUserIdAndCompanyId = async (
  team: CompanyTeamModel,
  userId: UserId,
) => {
  if (team?.id) {
    // await redis.set(`team-user-company-id:${userId}+${team.companyId}`, team);
  }
};

const getCompanyTeamsByUserId = async ({
  userId,
  companyId,
}: {
  userId: CompanyId;
  companyId: CompanyId;
}): Promise<CompanyTeamModel[]> => {
  try {
    const cacheKey = `member-user-company-id:${userId}${companyId}}`;
    const cacheResult = await redis.get(cacheKey);

    if (cacheResult) {
      return cacheResult;
    }

    const res = _.head(
      await knex.raw(`
		SELECT t.*
		FROM team_members tm 
		INNER JOIN teams t
			ON t.id = tm.team_id
		WHERE member_id IN (
			SELECT cm.id 
			FROM company_members cm 
			WHERE cm.user_id = ${userId} 
			AND cm.company_id = ${companyId}
		)
	`),
    ) as CompanyTeamModel[];

    if (!_.isEmpty(res)) {
      res.map((team) => setCompanyTeamsCacheByUserIdAndCompanyId(team, userId));
    }

    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getCompanyTeamStatuses = async (
  teamId: CompanyTeamId,
): Promise<(CompanyTeamStatusModel | Error)[]> => {
  try {
    const res = await knex
      .from('card_statuses')
      .where('team_id', teamId)
      .whereNull('deleted_at')
      .select();

    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getCompaniesByUserId = async (
  userId: UserId,
): Promise<(CompanyModel | Error)[]> => {
  try {
    const res = await knex
      .from({ cm: 'company_members' })
      .innerJoin({ c: 'companies' }, 'c.id', 'cm.company_id')
      .where('cm.user_id', userId)
      .where('cm.active', true)
      .whereNull('c.deleted_at')
      .whereNull('cm.deleted_at')
      .select();

    const filteredUniques = _.uniqBy(
      res,
      (cm) => cm.company_id,
    ) as CompanyModel[];

    return camelize(filteredUniques);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getCompanyStorageUsage = async (companyId: CompanyId) => {
  try {
    const query = `
      select SUM(t.total) as total from (
      select IFNULL(SUM(ca.file_size), 0) as 'total' from card_attachments ca
      left join cards c on c.id = ca.card_id and c.deleted_at is null
      left join ${TableNames.PROJECTS} j on j.id = c.job_id and j.deleted_at is null
      where ca.deleted_at is null and j.company_id = ${companyId}
      union
      select IFNULL(SUM(rr.invoice_file_size), 0) as 'total' from receivable_reminders rr
      left join contacts c on c.id = rr.contact_id and c.deleted_at is null
      where rr.deleted_at is null and c.company_id = ${companyId}
      union
      select
      IFNULL(SUM(payment_proof_file_size), 0) + IFNULL(SUM(receipt_file_size), 0) as 'total'
      from receivable_payments rp
      left join receivable_reminders rr on rr.id = rp.receivable_id and rr.deleted_at is null
      left join contacts c on c.id = rr.contact_id and c.deleted_at is null
      where rp.deleted_at is null and c.company_id = ${companyId}
      ) t
    `;

    const rawResult = await knex.raw(query);
    const rows = _.head(rawResult);
    const usage = _.get(rows, '[0].total') || 0; // KB
    return Promise.resolve(usage);
  } catch (e) {
    return Promise.reject(e);
  }
};
//if(ca.created_at < ${dateStoredInBytes}, ifnull(ca.file_size, 0)/1024, ca.file_size)
const getCompanyStorageDetails = async (
  companyId: CompanyId,
): Promise<(CompanyStorageListModel | Error)[]> => {
  try {
    //start date where file sizes are stored in kiloBytes, before this date it was in bytes
    const dateStoredInBytes = '2022-06-10';
    const query = `
    select 
    'taskAttachmentSize' as type,
      SUM(if(ca.created_at > '${dateStoredInBytes}', ifnull(ca.file_size, 0), ifnull(ca.file_size, 0)/1024)) 
      as 'fileSize' from card_attachments ca
      left join cards c on c.id = ca.card_id and c.deleted_at is null
      left join ${TableNames.PROJECTS} j on j.id = c.job_id and j.deleted_at is null
      where ca.deleted_at is null and j.company_id = ${companyId}
    union
    select
      'invoiceSize', 
      SUM(if(rr.created_at > '${dateStoredInBytes}', ifnull(rr.invoice_file_size, 0), ifnull(rr.invoice_file_size, 0)/1024)) 
      as 'fileSize' from receivable_reminders rr
      left join contacts c on c.id = rr.contact_id and c.deleted_at is null
      where rr.deleted_at is null and c.company_id = ${companyId}
    union
    select 
      'paymentProofSize', 
      SUM( if(rp.created_at > '${dateStoredInBytes}', ifnull(rp.payment_proof_file_size, 0), ifnull(rp.payment_proof_file_size, 0)/1024)) 
      as 'fileSize' from receivable_payments rp
      left join receivable_reminders rr on rr.id = rp.receivable_id and rr.deleted_at is null
      left join contacts c on c.id = rr.contact_id and c.deleted_at is null
      where rp.deleted_at is null and c.company_id = ${companyId}
    union
    select 
      'receiptSize', SUM(if(rp.updated_at > '${dateStoredInBytes}', ifnull(rp.receipt_file_size, 0), ifnull(rp.receipt_file_size, 0)/1024)) 
      as 'fileSize' from receivable_payments rp
      left join receivable_reminders rr on rr.id = rp.receivable_id and rr.deleted_at is null
      left join contacts c on c.id = rr.contact_id and c.deleted_at is null
      where rp.deleted_at is null and c.company_id = ${companyId}
    union
    select 
      'userImageSize', SUM(ifnull(u.profile_image_size, 0)/1024) 
      as 'fileSize' from users u
      left join companies c on c.user_id = u.id and c.deleted_at is null
      where u.deleted_at is null and c.id = ${companyId}
    union 
    select 
      'companyMemberReferenceImageSize', SUM(if(cmri.created_at > '${dateStoredInBytes}', ifnull(cmri.file_size, 0), ifnull(cmri.file_size, 0)/1024)) 
      as 'fileSize' from company_member_reference_images cmri
      left join company_members cm on cm.id = cmri.company_member_id and cm.deleted_at is null
      where cm.company_id = ${companyId}
    union
      select 
      'companyLogoSize', SUM(ifnull(c.logo_size, 0)) 
      as 'fileSize' from companies c
      where c.id = ${companyId}
    union
    select 
      'dedocoFileSize', SUM(ifnull(dh.file_size, 0)) 
      as 'fileSize' from document_history dh
      left join signing_workflow_documents swd on swd.id = dh.signing_workflow_document_id
      left join signing_workflows sw on sw.id = swd.signing_workflow_id
      where sw.company_id = ${companyId}
    union
    select 
      'attendanceImageSize', SUM(ifnull(a.image_size, 0)) 
      as 'fileSize' from attendances a
      left join company_members cm on cm.id = a.company_member_id and cm.deleted_at is null
      where cm.company_id = ${companyId};
    `;
    const rawResult = await knex.raw(query);
    const rows = camelize(_.head(rawResult)) as CompanyStorageListModel[];
    return Promise.resolve(rows);
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const getCompanySubscription = async (
  companyId: CompanyId,
): Promise<CompanySubscriptionModel | Error> => {
  try {
    const res = await knex
      .from('company_subscriptions')
      .where((builder) => {
        builder
          .whereRaw(`package_title = 'Omni Plan 500'`)
          .orWhereRaw(`package_title = 'Omni Plan 1000'`)
          .orWhereRaw(`package_title = 'Omni Plan 2000'`)
          .orWhereRaw(`package_title = 'Starter'`)
          .orWhereRaw(`package_title = 'Premium'`)
          .orWhereRaw(`package_title = 'Pro'`);
      })

      .whereRaw(
        `company_id = ${companyId} AND active = 1 AND DATE_FORMAT(NOW(), '%Y-%m-%d') < DATE_FORMAT(end_date, '%Y-%m-%d')`,
      )
      .select();

    return camelize(_.head(res));
  } catch (e) {
    return Promise.reject(e);
  }
};

const getCompanySettings = async (companyId: CompanyId) => {
  try {
    const res = await knex
      .from('companies')
      .where({ id: companyId })
      .select('settings');

    return _.head(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const updateSenangPayOptions = async ({
  companyId,
  payload,
}: {
  companyId: CompanyId;
  payload: unknown;
}): Promise<CompanyModel | Error> => {
  try {
    await knex
      .from('companies')
      .where({ id: companyId })
      .update({ settings: JSON.stringify(payload) });

    const res = await knex('companies').where({ id: companyId }).select();

    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const updateCompanySenangPayCredentials = async ({
  companyId,
  binaryCredentialData,
}: {
  companyId: CompanyId;
  binaryCredentialData: Buffer;
}): Promise<void | Error> => {
  try {
    await knex('sp_company_credentials')
      .insert({
        company_id: companyId,
        credentials: binaryCredentialData,
      })
      .onConflict('company_id')
      .merge();
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanySenangPayCredentials = async (
  companyId: CompanyId,
): Promise<CompanySenangPayCredentialsModel | Error> => {
  try {
    const res = await knex
      .from('sp_company_credentials')
      .where('company_id', companyId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createCompanyServiceHistory = async ({
  companyId,
  collectionId,
  type,
  status,
  to,
  data,
}: {
  companyId: CompanyId;
  collectionId: CollectionId;
  type: string;
  status: number;
  to: string;
  data: any;
}): Promise<CompanyServiceHistoryModel | Error> => {
  try {
    const insert = await knex
      .from(TableNames.COMPANY_SERVICES_HISTORIES)
      .insert({
        company_id: companyId,
        receivable_id: collectionId,
        type,
        status,
        to,
        data,
      });

    const historyId = _.head(insert);

    const res = await knex
      .from(TableNames.COMPANY_SERVICES_HISTORIES)
      .where({ id: historyId })
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanyServiceHistory = async ({
  historyId,
  status,
}: {
  historyId: CompanyServiceHistoryId;
  status: number;
}): Promise<number | Error> => {
  try {
    const res = await knex
      .from(TableNames.COMPANY_SERVICES_HISTORIES)
      .where('id', historyId)
      .update({ status, updated_at: knex.fn.now() });

    return res;
  } catch (err) {
    return Promise.reject(err);
  }
};

const checkCompanyServiceHistory = async ({
  collectionId,
  type,
}: {
  collectionId: CollectionId;
  type: string;
}): Promise<CompanyServiceHistoryModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.COMPANY_SERVICES_HISTORIES)
      .where({ receivable_id: collectionId, type })
      .select();

    return camelize(_.last(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const createCompany = async ({
  userId,
  payload,
}: {
  userId: UserId;
  payload: CreateCompanyInput;
}): Promise<CompanyModel | Error> => {
  try {
    const { accountCode } = payload;
    const insert = await knex(TableNames.COMPANIES).insert({
      ...payload,
      account_code: typeof accountCode === 'string' ? accountCode : null,
      created_by: userId,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.COMPANIES)
      .where('id', _.head(insert))
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCompany = async (
  companyId: CompanyId,
): Promise<CompanyModel | Error> => {
  try {
    const check = await knex('companies').where('id', companyId).select();
    if (check.length === 0) {
      return Promise.reject('Company does not exist');
    }

    await knex('companies')
      .where('id', companyId)
      .update('deleted_at', knex.fn.now());

    return camelize(_.head(check));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanyInfo = async ({
  userId,
  companyId,
  payload,
}: {
  userId: UserId;
  companyId: CompanyId;
  payload: UpdateCompanyInfoPayload;
}): Promise<CompanyModel | Error> => {
  try {
    const {
      accountCode,
      name,
      description,
      logoUrl,
      logo_size,
      invoicePrefix,
    } = payload;
    await knex(TableNames.COMPANIES)
      .update({
        name,
        description,
        logo_url: logoUrl,
        logo_size,
        account_code: typeof accountCode === 'string' ? accountCode : null,
        updated_by: userId,
        updated_at: knex.fn.now(),
      })
      .where('id', companyId);

    if (invoicePrefix) {
      await updateCompanyInvoicePrefix({ companyId, prefix: invoicePrefix });
    }

    const res = await knex
      .from(TableNames.COMPANIES)
      .where('id', companyId)
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanyMemberInfo = async ({
  companyMemberId,
  userId,
  payload,
}: {
  companyMemberId: CompanyMemberId;
  userId: UserId;
  payload: UpdateCompanyMemberInfoPayload;
}): Promise<CompanyMemberModel | Error> => {
  try {
    await knex('company_members')
      .update({
        ...payload,
        updated_by: userId,
        updated_at: knex.fn.now(),
      })
      .where('id', companyMemberId);

    const res = await knex
      .from('company_members')
      .where('id', companyMemberId)
      .select();

    invalidateCachedMember(camelize(_.head(res)));
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createCompanyTeam = async ({
  userId,
  companyId,
  payload,
}: {
  userId: UserId;
  companyId: CompanyId;
  payload: UpdateCompanyTeamInfoPayload;
}): Promise<CompanyTeamModel | Error> => {
  try {
    const insert = await knex('teams').insert({
      ...payload,
      company_id: companyId,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
      created_by: userId,
      updated_by: userId,
    });

    const res = await knex.from('teams').where('id', _.head(insert));
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCompanyTeam = async (
  id: CompanyTeamId,
): Promise<CompanyTeamModel | Error> => {
  try {
    const check = await knex('teams').where('id', id).select();
    if (check.length === 0) {
      return Promise.reject({ message: 'Company team does not exist' });
    }

    await knex('teams').where('id', id).update({ deleted_at: knex.fn.now() });

    return camelize(_.head(check));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanyTeamInfo = async ({
  userId,
  teamId,
  payload,
}: {
  userId: UserId;
  teamId: CompanyTeamId;
  payload: UpdateCompanyTeamInfoPayload;
}): Promise<CompanyTeamModel | Error> => {
  try {
    if (payload.title) {
      await knex('teams')
        .update({
          ...payload,
          updated_at: knex.fn.now(),
          updated_by: userId,
        })
        .where('id', teamId);
    }

    const res = await knex.from('teams').where('id', teamId);

    invalidateCachedCompanyTeams({
      userId,
      companyId: camelize(_.head(res)).companyId,
    });
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeMemberFromCompanyTeam = async ({
  teamId,
  userId,
  memberId,
}: {
  teamId: CompanyTeamId;
  userId: UserId;
  memberId: CompanyMemberId;
}): Promise<CompanyTeamModel | Error> => {
  try {
    await knex('team_members')
      .where('team_id', teamId)
      .andWhere('member_id', memberId)
      .del();

    const res = await knex.from('teams').where('id', teamId);

    invalidateCachedCompanyTeams({
      userId,
      companyId: camelize(_.head(res)).companyId,
    });
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const addCompanyMembersByUserId = async ({
  currentUserId,
  userIds,
  companyId,
  type,
  position,
  hourly_rate,
  employeeTypeId,
}: {
  currentUserId: UserId;
  userIds: UserId[];
  companyId: CompanyId;
  type: number;
  position?: string | null;
  hourly_rate?: number | undefined | null;
  employeeTypeId?: EmployeeTypeId;
}): Promise<CompanyModel | Error> => {
  try {
    const payload = userIds.map((id) => ({
      company_id: companyId,
      user_id: id,
      type,
      position,
      hourly_rate,
      employee_type: employeeTypeId,
      created_by: currentUserId,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    }));

    await knex('company_members').insert(payload);

    const res = await knex.from('companies').where('id', companyId).select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const addMembersToCompanyTeam = async ({
  memberIds,
  teamId,
}: {
  memberIds: CompanyMemberId[];
  teamId: CompanyTeamId;
}): Promise<number | Error> => {
  try {
    const insert = await knex('team_members').insert(
      memberIds.map((mid) => ({
        member_id: mid,
        team_id: teamId,
      })),
    );
    return insert.length;
  } catch (error) {
    return Promise.reject(error);
  }
};

const addCompanyTeamStatus = async ({
  userId,
  payload,
}: {
  userId: UserId;
  payload: CompanyTeamStatusPayload;
}): Promise<CompanyTeamStatusModel | Error> => {
  try {
    const insert = await knex('card_statuses').insert({
      ...payload,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
      created_by: userId,
    });
    const res = await knex
      .from('card_statuses')
      .where('id', _.head(insert))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanyTeamStatus = async ({
  userId,
  statusId,
  payload,
  taskIds,
}: {
  userId: UserId;
  statusId: CompanyTeamStatusId;
  payload: CompanyTeamStatusPayload;
  taskIds: TaskId[];
}): Promise<CompanyTeamStatusModel | Error> => {
  try {
    await knex('card_statuses')
      .update({
        ...payload,
        updated_at: knex.fn.now(),
        updated_by: userId,
      })
      .where('id', statusId);

    const res = await knex.from('card_statuses').where('id', statusId).select();

    //DETERMINE THE STATUS OF THE TASK IF THERE ARE TASKS ATTACHED TO THE STATUS THAT IS BEING UPDATED
    if (taskIds.length !== 0) {
      let actualStartEndValue = {};
      if (
        payload.percentage !== 0 &&
        payload.parent_status !== 2 &&
        payload.parent_status !== 3
      ) {
        actualStartEndValue = {
          actual_start: knex.fn.now(),
        };
      } else if (payload.percentage === 0) {
        actualStartEndValue = {
          actual_start: null,
          actual_end: null,
        };
      } else {
        actualStartEndValue = {
          actual_end: knex.fn.now(),
        };
      }

      //console.log(actualStartEndValue);

      await knex('cards')
        .update({ ...actualStartEndValue })
        .whereIn('id', taskIds);
    }

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};
const deleteCompanyTeamStatus = async ({
  companyTeamStatusId,
}: {
  companyTeamStatusId: number;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex('card_statuses')
      .where({ id: companyTeamStatusId })
      .del();

    return res;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const removeCompanyMember = async ({
  companyMemberId,
}: {
  companyMemberId: CompanyMemberId;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex('company_members')
      .where({ id: companyMemberId })
      .del();

    return res;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const getCompanyTeamMembers = async (
  teamId: CompanyTeamId,
): Promise<(CompanyMemberModel | Error)[]> => {
  try {
    const res = await knex
      .from({ tm: 'team_members' })
      .where('tm.team_id', teamId)
      .join({ cm: 'company_members' }, 'tm.member_id', 'cm.id')
      .whereNull('cm.deleted_at')
      .select();

    return camelize(res);
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const updateCompanyTeamStatusSequence = async ({
  payload,
}: {
  payload: CompanyTeamStatusSequenceUpdatePayload[];
}): Promise<(CompanyTeamStatusModel | Error)[]> => {
  try {
    Promise.all(
      payload.map(async (cts) => {
        const update = await knex
          .from(TableNames.TASK_STATUSES)
          .where({ id: cts.company_team_status_id })
          .update({ sequence: cts.sequence });
        return update;
      }),
    );

    const res = await knex
      .from(TableNames.TASK_STATUSES)
      .whereIn(
        'id',
        payload.map((cts) => cts.company_team_status_id),
      )
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getSenangPayUsers = async (
  companyId: CompanyId,
): Promise<(CompanyMemberModel | Error)[]> => {
  try {
    const res = await knex('company_members')
      .where({ company_id: companyId, deleted_at: null })
      .andWhere(knex.raw(`JSON_EXTRACT(setting, "$.senang_pay") = "1" `))
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const addSenangPayUsers = async ({
  companyId,
  userIds,
}: {
  companyId: CompanyId;
  userIds: UserId[];
}): Promise<(CompanyMemberModel | Error)[]> => {
  try {
    await knex.raw(
      `UPDATE company_members
        SET setting = ('{"senang_pay" : "1"}')
        WHERE company_id = ${companyId} 
        AND user_id IN (${userIds})
        AND deleted_at IS NULL
          `,
    );
    const res = await knex('company_members')
      .whereIn('user_id', userIds)
      .andWhere({ company_id: companyId, deleted_at: null })
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeSenangPayUsers = async ({
  companyId,
  userIds,
}: {
  companyId: CompanyId;
  userIds: UserId[];
}): Promise<(CompanyMemberModel | Error)[]> => {
  try {
    await knex.raw(
      `UPDATE company_members
        SET setting = ('{"senang_pay" : "0"}')
        WHERE company_id = ${companyId} 
        AND user_id IN (${userIds})
        AND deleted_at IS NULL
          `,
    );
    const res = await knex('company_members')
      .whereIn('user_id', userIds)
      .andWhere({ company_id: companyId, deleted_at: null })
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanyMemberReferenceImage = async (
  companyMemberId: CompanyMemberId,
): Promise<CompanyMemberReferenceImageModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.COMPANY_MEMBER_REFERENCE_IMAGES)
      .where('company_member_id', companyMemberId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const setCompanyMemberReferenceImageSize = async ({
  companyMemberId,
  fileSize,
}: {
  companyMemberId: CompanyMemberId;
  fileSize: number;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex(TableNames.COMPANY_MEMBER_REFERENCE_IMAGES)
      .where({ company_member_id: companyMemberId })
      .update({ file_size: fileSize });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const setCompanyMemberReferenceImage = async ({
  companyMemberId,
  input,
}: {
  companyMemberId: CompanyMemberId;
  input: {
    image_url: string;
    s3_bucket: string;
    s3_key: string;
  };
}): Promise<CompanyMemberReferenceImageModel | Error> => {
  try {
    await knex(TableNames.COMPANY_MEMBER_REFERENCE_IMAGES)
      .insert({
        company_member_id: companyMemberId,
        image_url: input.image_url,
        status: 0,
        s3_bucket: input.s3_bucket,
        s3_key: input.s3_key,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      })
      .onConflict('company_member_id')
      .merge();

    const res = await knex
      .from(TableNames.COMPANY_MEMBERS)
      .where('id', companyMemberId)
      .select();

    invalidateCachedMember(camelize(_.head(res)));

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const insertSlugForCompany = async ({
  companyId,
  slug,
}: {
  companyId: CompanyId;
  slug: string;
}): Promise<CompanyModel | Error> => {
  try {
    await knex
      .from(TableNames.COMPANIES)
      .where({ id: companyId })
      .update({ slug });

    const res = await knex
      .from(TableNames.COMPANIES)
      .where({ id: companyId })
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAllCompanies = async (): Promise<(CompanyModel | Error)[]> => {
  try {
    const res = await knex.from(TableNames.COMPANIES).select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const setCompanyMemberReferenceImageStatus = async ({
  companyMemberIds,
  status,
  remark,
  userId,
}: {
  companyMemberIds: CompanyMemberId[];
  status: number;
  remark: string;
  userId: UserId;
}): Promise<CompanyMemberModel[] | Error> => {
  try {
    await knex(TableNames.COMPANY_MEMBER_REFERENCE_IMAGES)
      .whereIn('company_member_id', companyMemberIds)
      .update({ status, remark, action_by: userId });

    const res = await knex
      .from(TableNames.COMPANY_MEMBERS)
      .whereIn('id', companyMemberIds)
      .select();

    res.map((mem) => invalidateCachedMember(mem));
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createEmployeeType = async ({
  companyId,
  name,
  overtime,
}: {
  companyId: CompanyId;
  name: string;
  overtime: boolean;
}): Promise<EmployeeTypeModel | Error> => {
  try {
    const insertRes = await knex(TableNames.EMPLOYEE_TYPES).insert({
      company_id: companyId,
      name,
      has_overtime: overtime,
    });

    const res = await knex
      .from(TableNames.EMPLOYEE_TYPES)
      .where('id', _.head(insertRes))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateEmployeeType = async ({
  typeId,
  name,
  overtime,
  archived,
}: {
  typeId: EmployeeTypeId;
  name: string;
  overtime: boolean;
  archived: boolean;
}): Promise<EmployeeTypeModel | Error> => {
  try {
    await knex(TableNames.EMPLOYEE_TYPES).where('id', typeId).update({
      name,
      archived,
      has_overtime: overtime,
    });

    const res = await knex
      .from(TableNames.EMPLOYEE_TYPES)
      .where('id', typeId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const archiveEmployeeType = async ({
  typeId,
  archived,
}: {
  typeId: EmployeeTypeId;
  archived: boolean;
}): Promise<EmployeeTypeModel | Error> => {
  try {
    await knex(TableNames.EMPLOYEE_TYPES).where('id', typeId).update({
      archived,
    });

    const res = await knex
      .from(TableNames.EMPLOYEE_TYPES)
      .where('id', typeId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getEmployeeTypes = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<EmployeeTypeModel[] | Error> => {
  try {
    const res = await knex
      .from(TableNames.EMPLOYEE_TYPES)
      .where('company_id', companyId)
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getWorkDaySettings = async ({
  employeeTypeId,
}: {
  employeeTypeId: EmployeeTypeId;
}): Promise<CompanyWorkDaySettingModel[] | Error> => {
  try {
    const res = await knex
      .from(TableNames.WORK_HOURS)
      .where({ employee_type_id: employeeTypeId })
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getWorkDaySettingsByCompanyId = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<CompanyWorkDaySettingModel[] | Error> => {
  try {
    const res = await knex
      .from(TableNames.WORK_HOURS)
      .where({ company_id: companyId })
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createDefaultWorkWeek = async ({
  companyId,
  employeeTypeId,
  userId,
  timezone,
}: {
  companyId: CompanyId;
  employeeTypeId: EmployeeTypeId;
  userId: UserId;
  timezone: string;
}): Promise<CompanyWorkDaySettingModel[] | Error> => {
  try {
    const payload = [];
    for (let i = 1; i <= 7; i++) {
      payload.push({
        company_id: companyId,
        employee_type_id: employeeTypeId,
        day: i,
        open: i < 6 ? true : false,
        start_hour: '09:00:00',
        end_hour: '18:00:00',
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
        created_by: userId,
        updated_by: userId,
        timezone,
      });
    }

    const insertRes = await knex(TableNames.WORK_HOURS).insert(payload);

    const res = await knex
      .from(TableNames.WORK_HOURS)
      .whereIn('id', insertRes)
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanyWorkDaySetting = async ({
  companyId,
  day,
  typeId,
  input,
  userId,
}: {
  companyId: CompanyId;
  day: number;
  typeId: EmployeeTypeId;
  input: UpdateCompanyWorkDayPayload;
  userId: UserId;
}): Promise<CompanyWorkDaySettingModel | Error> => {
  try {
    const updateRes = await knex(TableNames.WORK_HOURS)
      .where({
        company_id: companyId,
        day,
        employee_type_id: typeId,
      })
      .update({
        ...input,
        updated_by: userId,
        updated_at: knex.fn.now(),
      });

    const res = await knex
      .from(TableNames.WORK_HOURS)
      .where({ company_id: companyId, day, employee_type_id: typeId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanyPermissions = async ({
  companyId,
  grants,
}: {
  companyId: CompanyId;
  grants: string;
}): Promise<CompanyPermissionModel | Error> => {
  try {
    const check = await knex
      .from(TableNames.COMPANY_ROLES)
      .where({ company_id: companyId })
      .select();

    if (check?.length > 0) {
      await knex
        .from(TableNames.COMPANY_ROLES)
        .where({ company_id: companyId })
        .update({ grants });
    } else {
      await knex
        .from(TableNames.COMPANY_ROLES)
        .insert({ company_id: companyId, grants });
    }

    const res = await knex
      .from(TableNames.COMPANY_ROLES)
      .where({ company_id: companyId })
      .select();

    // await knex
    //   .from(TableNames.COMPANY_ROLES)
    //   .where({ company_id: companyId })
    //   .delete();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanyPermission = async (
  companyId: CompanyId,
): Promise<CompanyPermissionModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.COMPANY_ROLES)
      .where({ company_id: companyId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanyTeamsByMemberId = async ({
  memberId,
}: {
  memberId: CompanyMemberId;
}): Promise<(CompanyTeamMemberModel | Error)[]> => {
  try {
    const res = await knex
      .from(TableNames.COMPANY_TEAM_MEMBERS)
      .where({ member_id: memberId })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanyProfile = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<CompanyProfileModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.COMPANY_PROFILES)
      .where('company_id', companyId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanyProfile = async ({
  companyId,
  profile,
}: {
  companyId: CompanyId;
  profile: { [key: string]: unknown };
}): Promise<string> => {
  try {
    await knex(TableNames.COMPANY_PROFILES)
      .insert({ company_id: companyId, profile: JSON.stringify(profile) })
      .onConflict('company_id')
      .merge();

    const res = await knex
      .from(TableNames.COMPANY_PROFILES)
      .where('company_id', companyId)
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const upsertCompanyQuotaUsage = async ({
  services,
  interval,
  companyId,
}: {
  services: { whatsapp?: boolean; email?: boolean };
  companyId: CompanyId;
  interval: string;
}): Promise<CompanyQuotaUsageModel | Error | void> => {
  try {
    const exist = await knex
      .from(TableNames.COMPANY_QUOTA_USAGE)
      .where('company_id', companyId)
      .select();

    const currentMonth = dayjs().month();
    const currentYear = dayjs().year();

    if (exist?.length > 0) {
      const existingMonth = dayjs(_.head(exist)?.timestamp).month();
      const existingYear = dayjs(_.head(exist)?.timestamp).year();
      if (
        (interval === 'month' && currentMonth === existingMonth) ||
        (interval === 'year' && currentYear === existingYear)
      ) {
        if (services?.email) {
          await knex
            .from(TableNames.COMPANY_QUOTA_USAGE)
            .where('company_id', companyId)
            .increment('email_quota_usage', 1);
        }

        if (services?.whatsapp) {
          await knex
            .from(TableNames.COMPANY_QUOTA_USAGE)
            .where('company_id', companyId)
            .increment('whatsapp_quota_usage', 1);
        }
        await knex
          .from(TableNames.COMPANY_QUOTA_USAGE)
          .where('company_id', companyId)
          .update({ timestamp: knex.fn.now() });
      } else {
        await knex
          .from(TableNames.COMPANY_QUOTA_USAGE)
          .where({ company_id: companyId })
          .update({
            timestamp: knex.fn.now(),
            email_quota_usage: services?.email ? 1 : 0,
            whatsapp_quota_usage: services?.whatsapp ? 1 : 0,
          });
      }
    } else {
      await knex.from(TableNames.COMPANY_QUOTA_USAGE).insert({
        company_id: companyId,
        timestamp: knex.fn.now(),
        email_quota_usage: services?.email ? 1 : 0,
        whatsapp_quota_usage: services?.whatsapp ? 1 : 0,
      });
    }

    const res = await knex
      .from(TableNames.COMPANY_QUOTA_USAGE)
      .where({ company_id: companyId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    logger.errorLogger.log('info', 'upsertCompanyQuotaUsage', error);
    return;
    // return Promise.reject(error);
  }
};

const updateCompanyTimezone = async ({
  companyId,
  default_timezone,
}: {
  companyId: CompanyId;
  default_timezone: string;
}): Promise<CompanyProfileModel | Error> => {
  try {
    await knex(TableNames.COMPANY_PROFILES)
      .insert({ company_id: companyId, default_timezone })
      .onConflict('company_id')
      .merge();

    const res = await knex
      .from(TableNames.COMPANY_PROFILES)
      .where('company_id', companyId)
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanyQuotaUsage = async (
  companyId: CompanyId,
): Promise<CompanyQuotaUsageModel> => {
  try {
    const res = await knex
      .from(TableNames.COMPANY_QUOTA_USAGE)
      .where({ company_id: companyId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanyQuotaLastRemind = async (
  companyId: CompanyId,
): Promise<CompanyQuotaUsageModel | null> => {
  try {
    const check = await knex
      .from(TableNames.COMPANY_QUOTA_USAGE)
      .where({ company_id: companyId })
      .select();

    if (check?.length > 0) {
      await knex
        .from(TableNames.COMPANY_QUOTA_USAGE)
        .where({ company_id: companyId })
        .update({ last_remind_exceeded: knex.fn.now() });
    } else {
      await knex
        .from(TableNames.COMPANY_QUOTA_USAGE)
        .insert({ company_id: companyId, last_remind_exceeded: knex.fn.now() });
    }

    const res = await knex
      .from(TableNames.COMPANY_QUOTA_USAGE)
      .where({ company_id: companyId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    logger.errorLogger.log('info', 'updateCompanyQuotaLastRemind', error);
    return null;
  }
};

const updateCompanyMemberActiveStatus = async ({
  companyMemberId,
  active,
  userId,
}: {
  companyMemberId: CompanyMemberId;
  active: boolean;
  userId: UserId;
}): Promise<CompanyMemberModel> => {
  try {
    await knex(TableNames.COMPANY_MEMBERS)
      .update({
        active,
        updated_by: userId,
        updated_at: knex.fn.now(),
      })
      .where({
        id: companyMemberId,
      });

    // NOTE: need to invalidate the user cache because it contains the
    // list of companies they are in
    await UserStore.invalidateCachedUser(userId);

    const res = await knex
      .from(TableNames.COMPANY_MEMBERS)
      .where({ id: companyMemberId })
      .select();
    invalidateCachedMember(camelize(_.head(res)));
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanyInvoicePrefix = async (input: {
  companyId: CompanyId;
  prefix: string;
}) => {
  try {
    const { companyId, prefix } = input;
    await knex(TableNames.COMPANY_PROFILES)
      .insert({ company_id: companyId, invoice_prefix: prefix })
      .onConflict('company_id')
      .merge();

    const res = await knex
      .from(TableNames.COMPANIES)
      .where({ id: companyId })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createCompanyPaymentMethod = async (input: {
  stripeCustomerId: string;
  stripePaymentMethodId: string;
  companyId: CompanyId;
  userId: UserId;
  isDefault: boolean;
}) => {
  try {
    const {
      stripeCustomerId,
      stripePaymentMethodId,
      companyId,
      userId,
      isDefault,
    } = input;

    const insertRes = await knex(TableNames.COMPANY_PAYMENT_METHODS).insert({
      stripe_customer_id: stripeCustomerId,
      stripe_payment_method_id: stripePaymentMethodId,
      is_default: isDefault,
      company_id: companyId,
      user_id: userId,
      created_by: userId,
      updated_by: userId,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.COMPANY_PAYMENT_METHODS)
      .where('id', _.head(insertRes))
      .select();

    return camelizeOnly(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanyProfileForInvoice = async (input: {
  companyId: CompanyId;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  registrationCode?: string | null;
  invoiceStart?: string | null;
}) => {
  try {
    const {
      companyId,
      address,
      email,
      phone,
      website,
      registrationCode,
      invoiceStart,
    } = input;

    await knex(TableNames.COMPANY_PROFILES)
      .insert({
        company_id: companyId,
        address,
        email,
        phone,
        website,
        registration_code: registrationCode,
        invoice_start: +(invoiceStart || 0),
        invoice_start_string: invoiceStart,
      })
      .onConflict('company_id')
      .merge();

    const res = await knex
      .from({ c: TableNames.COMPANIES })
      .leftJoin({ cp: TableNames.COMPANY_PROFILES }, 'c.id', 'cp.company_id')
      .where('id', companyId)
      .first('c.*', 'cp.*');

    return camelizeOnly(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanyPaymentMethods = async ({
  companyId,
}: {
  companyId: CompanyId;
}) => {
  try {
    const res = await knex
      .from(TableNames.COMPANY_PAYMENT_METHODS)
      .where('company_id', companyId)
      .select();

    return camelizeOnly(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCompanyPaymentMethod = async (input: {
  companyId: CompanyId;
  stripePaymentMethodId: string;
}) => {
  try {
    const { companyId, stripePaymentMethodId } = input;

    const res = await knex(TableNames.COMPANY_PAYMENT_METHODS)
      .where({
        company_id: companyId,
        stripe_payment_method_id: stripePaymentMethodId,
      })
      .del();

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanyDefaultPaymentMethod = async (input: {
  companyId: CompanyId;
}) => {
  try {
    const { companyId } = input;

    const res = await knex
      .from(TableNames.COMPANY_PAYMENT_METHODS)
      .where({ company_id: companyId, is_default: true })
      .select();

    if (res.length > 1) {
      throw new Error('More than one default payment method found');
    }

    return camelizeOnly(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const setCompanyPaymentMethodIsDefault = async (input: {
  companyId: CompanyId;
  stripePaymentMethodId: string;
  isDefault: boolean;
}) => {
  try {
    const { companyId, stripePaymentMethodId, isDefault } = input;

    await knex(TableNames.COMPANY_PAYMENT_METHODS)
      .update({
        is_default: isDefault,
      })
      .where({
        company_id: companyId,
        stripe_payment_method_id: stripePaymentMethodId,
      });

    const res = await knex
      .from(TableNames.COMPANY_PAYMENT_METHODS)
      .where({
        company_id: companyId,
        stripe_payment_method_id: stripePaymentMethodId,
      })
      .select();

    return camelizeOnly(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanyByStripeCusId = async (stripeCusId: string) => {
  try {
    const res = await knex
      .from({ c: TableNames.COMPANIES })
      .join(
        { cpm: TableNames.COMPANY_PAYMENT_METHODS },
        'c.id',
        'cpm.company_id',
      )
      .where('cpm.stripe_customer_id', stripeCusId)
      .select('c.*')
      .first();

    return camelize(res);
  } catch (error) {
    console.error(error);
  }
};
const getCompanyAdmins = async (companyId: CompanyId) => {
  try {
    const res = await knex
      .from({ u: TableNames.USERS })
      .join({ cm: TableNames.COMPANY_MEMBERS }, 'u.id', 'cm.user_id')
      .where({
        company_id: companyId,
        type: companyMemberTypes.ADMIN,
        deleted_at: null,
      })
      .select('u.*');

    return camelizeOnly(res);
  } catch (error) {
    console.error(error);
  }
};

const getCompanyTeamsByMemberIdV2 = async ({
  memberId,
}: {
  memberId: CompanyMemberId;
}): Promise<CompanyTeamModel[]> => {
  try {
    const res = await knex
      .from({ ctm: TableNames.COMPANY_TEAM_MEMBERS })
      .leftJoin({ team: TableNames.COMPANY_TEAMS }, 'ctm.team_id', 'team.id')
      .where({ 'ctm.member_id': memberId, 'team.deleted_at': null })
      .select('team.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const exportFunctions = {
  createLoaders,
  batchGetCompanies,
  getCompaniesByUserId,
  addCompanyMembersByUserId,
  addCompanyTeamStatus,
  addMembersToCompanyTeam,
  addSenangPayUsers,
  archiveEmployeeType,
  checkCompanyServiceHistory,
  createCompany,
  createCompanyPaymentMethod,
  createCompanyServiceHistory,
  createCompanyTeam,
  createDefaultWorkWeek,
  createEmployeeType,
  deleteCompany,
  deleteCompanyPaymentMethod,
  deleteCompanyTeam,
  deleteCompanyTeamStatus,
  getAllCompanies,
  getCompaniesById,
  getCompanyDefaultPaymentMethod,
  getCompanyMember,
  getCompanyMemberReferenceImage,
  getCompanyMembers,
  getCompanyMembersByUserId,
  getCompanyPaymentMethods,
  getCompanyPermission,
  getCompanyProfile,
  getCompanyQuotaUsage,
  getCompanySenangPayCredentials,
  getCompanySettings,
  getCompanyStorageDetails,
  getCompanyStorageUsage,
  getCompanySubscription,
  getCompanyTeamMembers,
  getCompanyTeams,
  getCompanyTeamsById,
  getCompanyTeamsByMemberId,
  getCompanyTeamsByUserId,
  getCompanyTeamStatuses,
  getEmployeeTypes,
  getMemberByUserIdAndCompanyId,
  getSenangPayUsers,
  getWorkDaySettings,
  getWorkDaySettingsByCompanyId,
  insertSlugForCompany,
  removeCompanyMember,
  removeMemberFromCompanyTeam,
  removeSenangPayUsers,
  setCompanyMemberReferenceImage,
  setCompanyMemberReferenceImageSize,
  setCompanyMemberReferenceImageStatus,
  setCompanyPaymentMethodIsDefault,
  updateCompanyInfo,
  updateCompanyInvoicePrefix,
  updateCompanyMemberActiveStatus,
  updateCompanyMemberInfo,
  updateCompanyPermissions,
  updateCompanyProfile,
  updateCompanyProfileForInvoice,
  updateCompanyQuotaLastRemind,
  updateCompanySenangPayCredentials,
  updateCompanyServiceHistory,
  updateCompanyTeamInfo,
  updateCompanyTeamStatus,
  updateCompanyTeamStatusSequence,
  updateCompanyTimezone,
  updateCompanyWorkDaySetting,
  updateEmployeeType,
  updateSenangPayOptions,
  upsertCompanyQuotaUsage,
  listCompanies,
  getCompanyByStripeCusId,
  getCompanyAdmins,
  getCompanyTeamsByMemberIdV2,
};

export default exportFunctions;
