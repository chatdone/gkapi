import { LocationStore } from '@data-access';
import { companyMemberTypes } from '@data-access/company/company.store';
import { CompanyId, CompanyMemberModel } from '@models/company.model';
import {
  CreateLocationPayload,
  LocationId,
  LocationModel,
  LocationUpdatePayload,
} from '@models/location.model';
import { AffectedRowsResult } from '@models/task.model';
import { UserId, UserModel } from '@models/user.model';
import { CompanyService } from '@services';
import _ from 'lodash';

const getLocations = async (
  companyId: CompanyId,
): Promise<(LocationModel | Error)[]> => {
  try {
    const res = await LocationStore.getLocations(companyId);
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createLocation = async ({
  payload,
  user,
  companyId,
}: {
  payload: CreateLocationPayload;
  user: UserModel;
  companyId: CompanyId;
}): Promise<LocationModel | Error> => {
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

    const res = await LocationStore.createLocation({
      payload,
      userId: user.id,
      companyId,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateLocation = async ({
  locationId,
  payload,
  userId,
}: {
  locationId: LocationId;
  payload: LocationUpdatePayload;
  userId: UserId;
}): Promise<LocationModel | Error> => {
  try {
    const res = await LocationStore.updateLocation({
      locationId,
      payload,
      userId,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteLocations = async (
  locations: LocationModel[],
): Promise<AffectedRowsResult | Error> => {
  try {
    const locationIds = locations.map((l) => l.id);
    const res = await LocationStore.deleteLocations(locationIds);
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateLocationArchivedStatus = async ({
  locations,
  archived,
  userId,
}: {
  locations: LocationModel[];
  archived: boolean;
  userId: UserId;
}): Promise<(LocationModel | Error)[]> => {
  try {
    const isArchived = archived ? 1 : 0;
    const locationIds = locations.map((l) => l.id);

    const res = (await LocationStore.updateLocationArchivedStatus({
      locationIds,
      archived: isArchived,
      userId,
    })) as LocationModel[];

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const exportFunctions = {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocations,
  updateLocationArchivedStatus,
};

export default exportFunctions;
