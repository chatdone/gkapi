import knex from '@db/knex';
import { CompanyId } from '@models/company.model';
import { TeamId } from '@models/team.model';
import _ from 'lodash';
// import {
//   getBinaryMatchFromPublicId,
//   getBinaryMatchFromPublicIds
// } from '@db/utils';

const getById = async (id: TeamId) => {
  try {
    const res = await knex.from('teams').where('id', id).select();

    return _.head(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getByIds = async (ids: TeamId[]) => {
  try {
    const res = await knex.from('teams').whereIn('id', ids).select();

    return res;
  } catch (err) {
    return Promise.reject(err);
  }
};

// const getByPublicId = async publicId => {
//   try {
//     const res = await knex
//       .from('teams')
//       .whereRaw(getBinaryMatchFromPublicId(publicId))
//       .select();

//     return _.head(res);
//   } catch (err) {
//     return Promise.reject(err);
//   }
// };

// const getByPublicIds = async publicIds => {
//   try {
//     const res = await knex
//       .from('teams')
//       .whereRaw(getBinaryMatchFromPublicIds(publicIds))
//       .select();

//     return res;
//   } catch (err) {
//     return Promise.reject(err);
//   }
// };

const getTeams = async (companyId: CompanyId) => {
  try {
    const res = await knex
      .from('teams')
      .where('company_id', companyId)
      .whereNull('deleted_at')
      .select();

    return res;
  } catch (err) {
    return Promise.reject(err);
  }
};

const getTeamMembers = async ({
  teamIds,
  companyId,
}: {
  teamIds: TeamId[];
  companyId: CompanyId;
}) => {
  const query = knex.from('team_members');
  if (Array.isArray(teamIds)) {
    query.whereIn('team_id', teamIds);
  } else if (teamIds) {
    query.where('team_id', teamIds);
  }

  if (companyId) {
    query.where('company_id', companyId);
  }
  try {
    const res = await query

      .innerJoin(
        'company_members',
        'company_members.id',
        'team_members.member_id',
      )
      .innerJoin('users', 'company_members.user_id', 'users.id')
      .select();

    return res;
  } catch (err) {
    return Promise.reject(err);
  }
};

export default {
  getById,
  getByIds,
  //   getByPublicId,
  //   getByPublicIds,
  getTeams,
  getTeamMembers,
};
