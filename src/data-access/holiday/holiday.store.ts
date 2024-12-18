import { camelize } from '@data-access/utils';
import knex from '@db/knex';
import { CompanyId } from '@models/company.model';
import {
  CompanyHolidayId,
  CompanyHolidayModel,
  CreateHolidayPayload,
  HolidayModel,
  PublicHolidayId,
  UpdateCompanyHolidayPayload,
  UpdatePublicHolidayData,
  UpdatePublicHolidayPayload,
} from '@models/holiday.model';
import { UserId } from '@models/user.model';
import _ from 'lodash';

export const HOLIDAY_TYPE = {
  CUSTOM: 1,
  PUBLIC: 2,
};

export const HOLIDAY_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
};

const getHolidays = async ({
  companyId,
  year,
}: {
  companyId: CompanyId;
  year: number;
}): Promise<(HolidayModel | Error)[]> => {
  try {
    let companyHolidays = await knex('company_holidays')
      .where('company_id', companyId)
      .andWhere(knex.raw(`YEAR(company_holidays.start_date) = ${year}`))
      .select(knex.raw(`*, YEAR(company_holidays.start_date) as year`));
    let publicHolidays = await knex('public_holidays')
      .where('year', year)
      .select();

    //remove inactive public holidays from list of public holidays
    companyHolidays.forEach((ch) => {
      publicHolidays = publicHolidays.filter(
        (holiday) => holiday.id !== ch.public_holiday_id,
      );
    });

    publicHolidays = publicHolidays.map((ph) => ({
      ...ph,
      active: HOLIDAY_STATUS.ACTIVE,
      type: HOLIDAY_TYPE.PUBLIC,
    }));

    const res = companyHolidays.concat(publicHolidays);
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createHoliday = async ({
  companyId,
  userId,
  payload,
}: {
  companyId: CompanyId;
  userId: UserId;
  payload: CreateHolidayPayload;
}): Promise<(HolidayModel | Error)[]> => {
  try {
    await knex('company_holidays').insert({
      ...payload,
      company_id: companyId,
      created_by: userId,
      created_at: knex.fn.now(),
      type: HOLIDAY_TYPE.CUSTOM,
    });
    const res = await knex('company_holidays')
      .where({ company_id: companyId, active: HOLIDAY_STATUS.ACTIVE })
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updatePublicHolidays = async ({
  data,
  payload,
}: {
  data: UpdatePublicHolidayData[];
  payload: UpdatePublicHolidayPayload;
}): Promise<(UpdatePublicHolidayData | Error)[]> => {
  try {
    await knex('public_holidays').insert(data);
    const res = await knex('public_holidays')
      .where({ country_code: payload.country_code, year: payload.year })
      .select('name', 'date', 'year', 'country_code', 'start_date', 'end_date');
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanyHoliday = async ({
  companyHolidayId,
  companyId,
  payload,
}: {
  companyHolidayId: CompanyHolidayId;
  companyId: CompanyId;
  payload: UpdateCompanyHolidayPayload;
}): Promise<CompanyHolidayModel | Error> => {
  try {
    await knex('company_holidays')
      .update({ ...payload })
      .where({ id: companyHolidayId, company_id: companyId });

    const res = await knex('company_holidays')
      .where('id', companyHolidayId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deactivatePublicHoliday = async ({
  companyId,
  data,
  year,
}: {
  companyId: CompanyId;
  data: CompanyHolidayModel;
  year: number;
}): Promise<CompanyHolidayModel | Error> => {
  try {
    const insertedId = await knex('company_holidays').insert(data);
    const res = await knex('company_holidays')
      .where('id', _.head(insertedId))
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getDeactivatedHoliday = async ({
  companyId,
  publicHolidayId,
}: {
  companyId: CompanyId;
  publicHolidayId: PublicHolidayId;
}): Promise<CompanyHolidayModel | Error> => {
  try {
    const res = await knex('company_holidays').where({
      company_id: companyId,
      public_holiday_id: publicHolidayId,
      active: HOLIDAY_STATUS.INACTIVE,
    });
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCompanyHoliday = async ({
  companyId,
  companyHolidayId,
}: {
  companyId: CompanyId;
  companyHolidayId: CompanyHolidayId;
}): Promise<CompanyHolidayModel | Error> => {
  try {
    const res = await knex('company_holidays')
      .where({ company_id: companyId, id: companyHolidayId })
      .select();
    await knex('company_holidays')
      .where({ company_id: companyId, id: companyHolidayId })
      .del();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const activatePublicHoliday = async ({
  companyId,
  companyHolidayId,
}: {
  companyId: CompanyId;
  companyHolidayId: CompanyHolidayId;
}): Promise<CompanyHolidayModel | Error> => {
  try {
    const res = await knex('company_holidays')
      .where({ company_id: companyId, id: companyHolidayId })
      .select();
    await knex('company_holidays')
      .where({ company_id: companyId, id: companyHolidayId })
      .del();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  getHolidays,
  createHoliday,
  updatePublicHolidays,
  deactivatePublicHoliday,
  updateCompanyHoliday,
  getDeactivatedHoliday,
  deleteCompanyHoliday,
  activatePublicHoliday,
};
