import _ from 'lodash';
import { TeamStore } from '@data-access';
import { TeamId, TeamMemberModel, TeamModel } from '@models/team.model';
import { CompanyId } from '@models/company.model';

const getById = async (id: TeamId): Promise<TeamId | Error> => {
  try {
    let res = await TeamStore.getById(id);
    if (res) {
      res = { ...res, node_name: 'Team' };
    }
    return res;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const getTeams = async (
  companyId: CompanyId,
): Promise<(TeamModel | Error)[]> => {
  try {
    const res = await TeamStore.getTeams(companyId);
    return res;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getTeamMembers = async ({
  companyId,
  teamId,
}: {
  companyId: CompanyId;
  teamId: TeamId[];
}): Promise<TeamMemberModel[] | Error> => {
  try {
    const res = await TeamStore.getTeamMembers({ companyId, teamIds: teamId });
    return res;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default {
  getById,
  //   getByPublicId,
  //   getByPublicIds,
  getTeams,
  getTeamMembers,
};
