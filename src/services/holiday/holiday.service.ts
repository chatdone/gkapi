import { HolidayStore } from '@data-access';
import {
  HOLIDAY_STATUS,
  HOLIDAY_TYPE,
} from '@data-access/holiday/holiday.store';
import { CompanyId } from '@models/company.model';
import {
  CompanyHolidayId,
  CompanyHolidayModel,
  CreateHolidayPayload,
  HolidayModel,
  PublicHolidayId,
  PublicHolidayModel,
  UpdateCompanyHolidayPayload,
  UpdatePublicHolidayData,
  UpdatePublicHolidayPayload,
} from '@models/holiday.model';
import { UserId } from '@models/user.model';
import Holidays from 'date-holidays';

import holidays from 'date-holidays';

const createHoliday = async ({
  payload,
  companyId,
  userId,
}: {
  payload: CreateHolidayPayload;
  companyId: CompanyId;
  userId: UserId;
}): Promise<(HolidayModel | Error)[]> => {
  try {
    const res = (await HolidayStore.createHoliday({
      companyId,
      userId,
      payload,
    })) as HolidayModel[];
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updatePublicHolidays = async (
  payload: UpdatePublicHolidayPayload,
): Promise<(UpdatePublicHolidayData | Error)[]> => {
  try {
    const hd = new holidays(payload.country_code);
    hd.setLanguages('en');
    const rawData = hd.getHolidays(payload.year);

    const formattedData = rawData.map((data) => ({
      name: data.name,
      date: new Date(data.date),
      year: payload.year,
      country_code: payload.country_code,
      start_date: data.start,
      end_date: data.end,
    })) as UpdatePublicHolidayData[];

    const res = await HolidayStore.updatePublicHolidays({
      data: formattedData,
      payload,
    });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getHolidays = async ({
  companyId,
  year,
}: {
  companyId: CompanyId;
  year: number;
}): Promise<(HolidayModel | Error)[]> => {
  try {
    const res = await HolidayStore.getHolidays({ companyId, year });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const deactivatePublicHoliday = async ({
  companyId,
  userId,
  payload,
}: {
  companyId: CompanyId;
  userId: UserId;
  payload: PublicHolidayModel;
}): Promise<CompanyHolidayModel | Error> => {
  try {
    const data = {
      name: payload.name,
      start_date: payload.start_date,
      end_date: payload.end_date,
      type: HOLIDAY_TYPE.PUBLIC,
      company_id: companyId,
      public_holiday_id: payload.id,
      created_by: userId,
      updated_by: userId,
      active: HOLIDAY_STATUS.INACTIVE,
    } as CompanyHolidayModel;

    const res = await HolidayStore.deactivatePublicHoliday({
      companyId,
      data,
      year: payload.year,
    });
    return res;
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
}) => {
  try {
    const res = await HolidayStore.updateCompanyHoliday({
      companyHolidayId,
      companyId,
      payload,
    });
    return res;
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
    const res = await HolidayStore.getDeactivatedHoliday({
      companyId,
      publicHolidayId,
    });
    return res;
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
    const res = await HolidayStore.deleteCompanyHoliday({
      companyId,
      companyHolidayId,
    });
    return res;
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
    const res = await HolidayStore.activatePublicHoliday({
      companyId,
      companyHolidayId,
    });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  createHoliday,
  updatePublicHolidays,
  getHolidays,
  deactivatePublicHoliday,
  updateCompanyHoliday,
  getDeactivatedHoliday,
  deleteCompanyHoliday,
  activatePublicHoliday,
};
