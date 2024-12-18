import { CompanyId, CompanyModel } from './company.model';
import { UserId } from './user.model';

export type LocationId = number;
export type LocationPublicId = string;

export type LocationModel = {
  id: LocationId;
  company_id: CompanyId;
  id_text: LocationPublicId;
  name: string;
  address: string;
  radius: number;
  lng: number;
  lat: number;
  archived: boolean;
  created_at: string;
  created_by: UserId;
  updated_at: string;
  updated_by: UserId;
  metadata: string;
};

export type CreateLocationPayload = {
  name: string;
  address?: string;
  radius?: number;
  lng?: number;
  lat?: number;
};

export type LocationUpdatePayload = {
  name?: string;
  address?: string;
  radius?: number;
  lng?: number;
  lat?: number;
};
