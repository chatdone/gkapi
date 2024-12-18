import { camelize } from '@data-access/utils';
import knex from '@db/knex';
import { CompanyId } from '@models/company.model';
import {
  CreateLocationPayload,
  LocationId,
  LocationModel,
  LocationUpdatePayload,
} from '@models/location.model';
import { AffectedRowsResult } from '@models/task.model';
import { UserId } from '@models/user.model';
import _ from 'lodash';

const LOCATION = 'locations';

const getLocations = async (
  companyId: CompanyId,
): Promise<(LocationModel | Error)[]> => {
  try {
    const res = await knex
      .from(LOCATION)
      .where({ company_id: companyId })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createLocation = async ({
  payload,
  userId,
  companyId,
}: {
  payload: CreateLocationPayload;
  userId: UserId;
  companyId: CompanyId;
}): Promise<LocationModel | Error> => {
  try {
    const insert = await knex.from(LOCATION).insert({
      ...payload,
      company_id: companyId,
      created_by: userId,
      created_at: knex.fn.now(),
    });
    const res = await knex(LOCATION).where('id', _.head(insert)).select();

    return camelize(_.head(res));
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
    await knex
      .from(LOCATION)
      .where({ id: locationId })
      .update({
        ...payload,
        updated_by: userId,
        updated_at: knex.fn.now(),
      });

    const res = await knex.from(LOCATION).where({ id: locationId }).select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteLocations = async (
  locationIds: LocationId[],
): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex(LOCATION).whereIn('id', locationIds).del();
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateLocationArchivedStatus = async ({
  locationIds,
  archived,
  userId,
}: {
  locationIds: LocationId[];
  archived: number;
  userId: UserId;
}): Promise<(LocationModel | Error)[]> => {
  try {
    await knex
      .from(LOCATION)
      .whereIn('id', locationIds)
      .update({ archived, updated_by: userId, updated_at: knex.fn.now() });

    const res = await knex.from(LOCATION).whereIn('id', locationIds).select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  getLocations,
  createLocation,
  deleteLocations,
  updateLocation,
  updateLocationArchivedStatus,
};
