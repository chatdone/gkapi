import { CompanyId, CompanyMemberId } from './company.model';
import { ContactId } from './contact.model';
import { LocationId } from './location.model';

export type AttendanceId = number;
export type AttendancePublicId = string;
export type AttendanceVerificationId = number;
export type AttendanceVerificationPublicId = number;
export type AttendanceLabelId = number;
export type AttendanceLabelPublicId = string;

export type AttendanceModel = {
  id: AttendanceId;
  id_text: AttendancePublicId;
  company_member_id: CompanyMemberId;
  start_date: string;
  end_date: string;
  type: number;
  submitted_date: string;
  comments: string;
  location_id: LocationId;
  time_total: number;
  overtime: number;
  worked: number;
  created_at: string;
  updated_at: string;
  verification_id?: AttendanceVerificationId;
  is_last_out: number;
  lat: number;
  lng: number;
  attendance_label_id: number;
  verification_type: number;
  image_url: string;
  s3_bucket: string;
  s3_key: string;
  address: string;
};

export type AttendanceVerificationModel = {
  id: AttendanceVerificationId;
  id_text: AttendanceVerificationPublicId;
  company_member_id: CompanyMemberId;
  image: AttendanceVerificationS3ObjectModel;
  status: number;
  created_at: string;
  updated_at: string;
};

export type AttendanceVerificationS3ObjectModel = {
  bucket: string;
  key: string;
};

export type StartAttendancePayload = {
  type: number;
  comments: string;
  verification_type?: number;
  lat?: number;
  lng?: number;
  s3_bucket?: string;
  s3_key?: string;
  image_url?: string;
  address?: string;
};
export interface CreateAttendancePayload extends StartAttendancePayload {
  company_member_id: CompanyMemberId;
  location_id?: LocationId;
  contact_id?: ContactId;
  attendance_label_id?: AttendanceLabelId;
}

export type AttendanceLabelModel = {
  id: AttendanceLabelId;
  id_text: AttendanceLabelPublicId;
  company_id: CompanyId;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
  archived: number;
  description: string;
};

export type AttendanceDailySummaryModel = {
  id: number;
  company_member_id: CompanyMemberId;
  first_in: string;
  first_attendance_id: number;
  last_attendance_id: number;
  day: number;
  month: number;
  year: number;
  tracked: number;
  worked: number;
  regular: number;
  overtime: number;
  generated_at: string;
  updated_at: string;
  created_at: string;
};

export type AttendanceWeeklySummaryModel = {
  id: number;
  company_member_id: CompanyMemberId;
  week: number;
  month: number;
  year: number;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  tracked_total: number;
  worked_total: number;
  regular_total: number;
  overtime_total: number;
  generated_at: string;
  updated_at: string;
  created_at: string;
};

export type AttendanceMonthlySummaryModel = {
  company_member_id: CompanyMemberId;
  month: number;
  year: number;
  tracked_total: number;
  worked_total: number;
  regular_total: number;
  overtime_total: number;
};

export type WorkHourTotalsModel = {
  tracked: number;
  worked: number;
  regular: number;
  overtime: number;
  day: number;
  month: number;
  year: number;
};

export type WorkHoursWeeklyTotalsModel = {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  tracked_total: number;
  worked_total: number;
  overtime_total: number;
  regular_total: number;
};

export interface UpdateMemberDailySummaryPayload extends WorkHourTotalsModel {
  day: number;
  month: number;
  year: number;
}

export interface UpdateMemberWeeklySummaryPayload {
  week: number;
  year: number;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  tracked_total: number;
  worked_total: number;
  regular_total: number;
  overtime_total: number;
  month: number;
}

export interface AttendanceSettingsModel {
  allow_mobile: number;
  allow_web: number;
  require_verification: number;
  require_location: number;
  enable_2d: number;
  enable_biometric: number;
}

export interface AttendanceSettingsPayload {
  allow_mobile?: number;
  allow_web?: number;
  require_verification?: number;
  require_location?: number;
  enable_2d?: number;
  enable_biometric?: number;
}

export type AttendanceTrackedHoursModel = {
  worked: number;
  tracked: number;
  overtime: number;
};

export type AttendanceTrackedHoursWeeklyModel = {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  tracked_total: number;
  worked_total: number;
  regular_total: number;
  overtime_total: number;
};

export type DateRangeModel = { days: number[]; month: number; year: number };
