import { CompanyId } from './company.model';
import { UserId } from './user.model';

export type HolidayId = number;
export type HolidayPublicId = string;
export type CompanyHolidayId = number;
export type CompanyHolidayPublicId = string;
export type PublicHolidayId = number;
export type PublicHolidayPublicId = string;

export type HolidayModel = {
  id: HolidayId;
  id_text: HolidayPublicId;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  type: number;
  company_id: CompanyId;
  hidden: boolean;
  created_at: Date;
  created_by: UserId;
  updated_at: Date;
  updated_by: UserId;
};

export type CompanyHolidayModel = {
  id: CompanyHolidayId;
  id_text: CompanyHolidayPublicId;
  name: string;
  start_date: Date;
  end_date: Date;
  type: number;
  company_id: CompanyId;
  active: number;
  created_at: Date;
  created_by: UserId;
  updated_at: Date;
  updated_by: UserId;
  public_holiday_id: PublicHolidayId;
};

export type PublicHolidayModel = {
  id: PublicHolidayId;
  id_text: PublicHolidayPublicId;
  name: string;
  date: Date;
  year: number;
  country_code: string;
  start_date: Date;
  end_date: Date;
  created_at: Date;
  updated_at: Date;
};

export type CreateHolidayPayload = {
  name: string;
  start_date: Date;
  end_date: Date;
};

export type UpdateCompanyHolidayPayload = {
  name: string;
  start_date: Date;
  end_date: Date;
};

export type UpdatePublicHolidayPayload = {
  year: number;
  country_code: string;
};

export type UpdatePublicHolidayData = {
  name: string;
  date: Date;
  year: number;
  country_code: string;
  start_date: Date;
  end_date: Date;
};
