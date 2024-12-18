import DataLoader from 'dataloader';
import { ReadStream } from 'fs-capacitor';
import { GraphQLScalarType } from 'graphql';
import { CompanyMemberId } from './company.model';
import { TaskBoardTeamId, TaskId } from './task.model';
import { WorkspaceId } from './workspace.model';

export type EnumStringToNumberType = { [key: string]: number };

export type PrivateOrPublicId = string | number;

export type DataLoaders = {
  [key: string]: DataLoader<string | number, unknown, string | number>;
};

export interface AttachmentPayload {
  createReadStream(): ReadStream;
  filename: string;
  mimetype: string;
  encoding: string;
}

export interface ErrorS3 extends Error {
  success: boolean;
  message: string;
  type: string;
  name: string;
  url: string;
  encoding: string;
  path: string;
  file_size: number;
  hash_result: string;
}

export interface UploadImagePayload extends GraphQLScalarType {
  createReadStream(): ReadStream;
  filename: string;
  mimetype: string;
  encoding: string;
}

export interface CrudPayload {
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
}

export interface ImageGroupModel {
  small?: string;
  medium?: string;
  large?: string;
  original: string;
}

export type CommonVisibilityModel = {
  workspaceId?: WorkspaceId;
  taskId?: TaskId;
  teamId?: TaskBoardTeamId;
  memberId?: CompanyMemberId;
};
