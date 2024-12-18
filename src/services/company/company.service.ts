import {
  BillingStore,
  CompanyStore,
  createLoaders,
  SubscriptionStore,
} from '@data-access';
import _ from 'lodash';
import s3 from '@tools/s3';
import { v4 as uuid } from 'uuid';
import joi from 'joi';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
  CompanyMemberReferenceImageModel,
  CompanyModel,
  CompanyPermissionModel,
  CompanyPermissionPayload,
  CompanyProfileModel,
  CompanyPublicId,
  CompanyQuotaUsageModel,
  CompanyServiceHistoryId,
  CompanyServiceHistoryModel,
  CompanyStorageDetailsModel,
  CompanyStorageListModel,
  CompanyTeamId,
  CompanyTeamMemberModel,
  CompanyTeamModel,
  CompanyTeamStatusId,
  CompanyTeamStatusModel,
  CompanyTeamStatusPayload,
  CompanyTeamStatusSequenceUpdatePayload,
  CompanyWorkDaySettingModel,
  EmployeeTypeId,
  EmployeeTypeModel,
  ParseMembersResultCsvModel,
  ResourcePermissionModel,
  ResourcePermissionPayload,
  UpdateCompanyInfoPayload,
  UpdateCompanyMemberInfoPayload,
  UpdateCompanyTeamInfoPayload,
  UpdateCompanyWorkDayPayload,
} from '@models/company.model';
import { AffectedRowsResult, TaskId, TaskModel } from '@models/task.model';
import { UserId, UserModel } from '@models/user.model';
import {
  AddMemberToCompanyInput,
  CreateCompanyInput,
} from '@generated/graphql-types';
import {
  EventManagerService,
  StorageService,
  StripeService,
  SubscriptionService,
  UrlService,
  UserService,
  WorkspaceService,
} from '@services';
import { CompanySubscriptionModel } from '@models/subscription.model';
import { MessageServiceModel } from '@models/notification.model';
import { CollectionId, CollectionModel } from '@models/collection.model';
import { AttachmentPayload, UploadImagePayload } from '@models/common.model';
import { AccessControl } from 'accesscontrol';
import { DEFAULT_COMPANY_GRANTS, memberTypes, ResourceTypes } from './constant';
import logger from '@tools/logger';
import { companyMemberTypes } from '@data-access/company/company.store';
import path from 'path';
import csv from 'csv-parser';
import { ReadStream } from 'fs';
import { getMemberTypeFromString } from './company.helper';
import { PACKAGES_TYPES } from '@data-access/subscription/subscription.store';
import axios from 'axios';

const validateUserInCompany = async ({
  userId,
  companyId,
}: {
  userId: UserId;
  companyId: CompanyId;
}): Promise<boolean> => {
  try {
    const members = (await CompanyStore.getCompanyMembers(
      companyId,
    )) as CompanyMemberModel[];
    const result = _.find(members, { user_id: userId });
    return !!result;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'validateUserInCompany',
        userId,
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const getCompanyMembers = async (
  companyId: CompanyId,
): Promise<(CompanyMemberModel | Error)[]> => {
  try {
    const res = await CompanyStore.getCompanyMembers(companyId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanyMembers',
        companyId,
      },
    });

    return Promise.reject(error);
  }
};

//make a generic function to get company members by multiple fields
const getMemberByUserIdAndCompanyId = async ({
  companyId,
  userId,
}: {
  companyId: CompanyId;
  userId: UserId;
}): Promise<CompanyMemberModel> => {
  try {
    const res = (await CompanyStore.getMemberByUserIdAndCompanyId({
      companyId,
      userId,
    })) as CompanyMemberModel;
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getMemberByUserIdAndCompanyId',
        companyId,
        userId,
      },
    });

    return Promise.reject(error);
  }
};

const getCompanyMembersByUserId = async (
  userId: UserId,
): Promise<(CompanyMemberModel | Error)[]> => {
  try {
    const res = await CompanyStore.getCompanyMembersByUserId(userId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanyMembersByUserId',
        userId,
      },
    });
    return Promise.reject(err);
  }
};

const getCompanyTeamStatuses = async (
  teamId: CompanyTeamId,
): Promise<(CompanyTeamStatusModel | Error)[]> => {
  try {
    const res = CompanyStore.getCompanyTeamStatuses(teamId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanyTeamStatuses',
        teamId,
      },
    });
    return Promise.reject(error);
  }
};

const getCompanyTeams = (
  id: CompanyId,
): Promise<(CompanyTeamModel | Error)[]> => {
  try {
    const res = CompanyStore.getCompanyTeams(id);
    return res;
  } catch (error) {
    const err = error as Error;
    console.log(error);
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanyTeams',
        id,
      },
    });
    return Promise.reject(error);
  }
};

const getCompanyTeamMembers = async (
  teamId: CompanyTeamId,
): Promise<(CompanyMemberModel | Error)[]> => {
  try {
    const res = await CompanyStore.getCompanyTeamMembers(teamId);

    return res;
  } catch (error) {
    const err = error as Error;
    console.log(error);
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanyTeamMembers',
        teamId,
      },
    });
    return Promise.reject(error);
  }
};

const getCompanies = async (
  userId: UserId,
): Promise<(CompanyModel | Error)[]> => {
  try {
    const res = (await CompanyStore.getCompaniesByUserId(
      userId,
    )) as CompanyModel[];
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanies',
        userId,
      },
    });
    return Promise.reject(error);
  }
};

const createCompany = async ({
  userId,
  payload,
}: {
  userId: UserId;
  payload: CreateCompanyInput;
}): Promise<CompanyModel | Error> => {
  try {
    const createResult = (await CompanyStore.createCompany({
      userId,
      payload,
    })) as CompanyModel;

    await insertSlugForCompany({ company: createResult });

    if (!createResult) {
      return Promise.reject('Error creating company');
    }

    const res = await exportFunctions.addCompanyMembersByUserId({
      currentUserId: userId,
      userIds: [userId],
      type: 1,
      company: createResult,
    });

    await createDefaultForCompany({ company: createResult, userId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'createCompany',
        userId,
        payload,
      },
    });
    return Promise.reject(error);
  }
};

const createDefaultForCompany = async (input: {
  company: CompanyModel;
  userId: UserId;
}) => {
  try {
    const { company, userId } = input;
    if (process.env.TASK_UNIFICATION) {
      await WorkspaceService.createDefaultProject({
        companyId: company.id,
        userId: userId,
      });

      await BillingStore.updateCompanyPrefix(company);
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'createDefaultForCompany',
        input,
      },
    });
    return Promise.reject(error);
  }
};

const deleteCompany = async (
  companyId: CompanyId,
): Promise<CompanyModel | Error> => {
  try {
    const res = await CompanyStore.deleteCompany(companyId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'deleteCompany',
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const updateCompanyInfo = async ({
  userId,
  companyId,
  payload,
}: {
  userId: UserId;
  companyId: CompanyId;
  payload: UpdateCompanyInfoPayload;
}): Promise<CompanyModel | Error> => {
  try {
    let res = (await CompanyStore.updateCompanyInfo({
      userId,
      companyId,
      payload,
    })) as CompanyModel;

    const { address, email, phone, website, registrationCode, invoiceStart } =
      payload;

    if (
      address ||
      email ||
      phone ||
      website ||
      registrationCode ||
      invoiceStart
    ) {
      res = await updateCompanyProfileForInvoice({
        address,
        email,
        phone,
        website,
        registrationCode,
        invoiceStart,
        companyId,
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'updateCompanyInfo',
        companyId,
        userId,
        payload,
      },
    });
    return Promise.reject(error);
  }
};

const updateCompanyMemberInfo = async ({
  companyMemberId,
  companyMemberType,
  companyId,
  userId,
  payload,
}: {
  companyMemberId: CompanyMemberId;
  companyMemberType: number;
  companyId: CompanyId;
  userId: UserId;
  payload: UpdateCompanyMemberInfoPayload;
}): Promise<CompanyMemberModel | Error> => {
  // TODO: validate that user is of admin type
  try {
    if (companyMemberType === 1 && payload.type !== 1) {
      const companyMembers = (await CompanyStore.getCompanyMembers(
        companyId,
      )) as CompanyMemberModel[];
      const admins = companyMembers.filter((member) => member.type === 1);

      if (admins.length === 1) {
        return Promise.reject(
          'Need to have at least one admin, please assign a new admin before remove yourself.',
        );
      }
    }

    if (companyMemberType !== payload?.type) {
      await EventManagerService.notifyMemberTypeChanged({
        updatedById: userId,
        memberId: companyMemberId,
        type: payload.type,
      });
    }

    const res = (await CompanyStore.updateCompanyMemberInfo({
      companyMemberId,
      userId,
      payload,
    })) as CompanyMemberModel;

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'updateCompanyMemberInfo',
        companyId,
        userId,
        payload,
      },
    });
    return Promise.reject(error);
  }
};

const createCompanyTeam = async ({
  currentUser,
  companyId,
  payload,
  memberIds,
}: {
  currentUser: UserModel;
  companyId: CompanyId;
  payload: UpdateCompanyTeamInfoPayload;
  memberIds: CompanyMemberId[];
}): Promise<CompanyTeamModel | Error> => {
  try {
    await SubscriptionService.handleSubscriptionQuota({
      companyId,
      quotaType: 'team',
      isDecrement: true,
    });

    const team = (await CompanyStore.createCompanyTeam({
      userId: currentUser.id,
      companyId,
      payload: {
        title: payload.title,
      },
    })) as CompanyTeamModel;

    if (team && memberIds?.length > 0) {
      await addMembersToCompanyTeam({
        memberIds,
        team,
        user: currentUser,
      });
    }

    return team;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'createCompanyTeam',
        companyId,
        payload,
        memberIds,
      },
    });
    return Promise.reject(error);
  }
};

const deleteCompanyTeam = async (input: {
  teamId: CompanyTeamId;
  companyId: CompanyId;
}): Promise<CompanyTeamModel | Error> => {
  const { teamId, companyId } = input;
  try {
    const res = await CompanyStore.deleteCompanyTeam(teamId);

    await SubscriptionService.handleSubscriptionQuota({
      companyId: companyId,
      quotaType: 'team',
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'deleteCompanyTeam',
        teamId,
      },
    });
    return Promise.reject(error);
  }
};

const updateCompanyTeamInfo = async ({
  currentUserId,
  team,
  payload,
  memberIds,
  user,
}: {
  currentUserId: UserId;
  team: CompanyTeamModel;
  payload: UpdateCompanyTeamInfoPayload;
  memberIds: CompanyMemberId[];
  user: UserModel;
}): Promise<CompanyTeamModel | Error> => {
  try {
    const res = (await CompanyStore.updateCompanyTeamInfo({
      userId: currentUserId,
      teamId: team.id,
      payload: {
        title: payload.title,
      },
    })) as CompanyTeamModel;

    if (memberIds?.length > 0) {
      await addMembersToCompanyTeam({
        memberIds,
        team,
        user,
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'updateCompanyTeamInfo',
        teamId: team?.id,
        payload,
        memberIds,
      },
    });
    return Promise.reject(error);
  }
};

const removeCompanyMember = async ({
  companyMember,
  company,
  removedById,
}: {
  companyMember: CompanyMemberModel;
  company: CompanyModel;
  removedById: UserId;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = (await CompanyStore.removeCompanyMember({
      companyMemberId: companyMember.id,
    })) as AffectedRowsResult;

    if (companyMember.user_id !== removedById) {
      await EventManagerService.handleRemovedMemberFromCompany({
        company,
        companyMemberUserId: companyMember.user_id,
        removedByUserId: removedById,
      });
    }

    await SubscriptionService.handleSubscriptionQuota({
      companyId: company.id,
      quotaType: 'user',
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'removeCompanyMember',
        companyMemberId: companyMember?.id,
        companyId: company?.id,
        removedById,
      },
    });
    return Promise.reject(error);
  }
};

const removeMemberFromCompanyTeam = async ({
  companyTeam,
  companyMember,
  removedById,
}: {
  companyTeam: CompanyTeamModel;
  companyMember: CompanyMemberModel;
  removedById: UserId;
}): Promise<CompanyTeamModel | Error> => {
  try {
    const res = (await CompanyStore.removeMemberFromCompanyTeam({
      teamId: companyTeam.id,
      userId: companyMember.user_id,
      memberId: companyMember.id,
    })) as CompanyTeamModel;

    if (companyMember?.user_id !== removedById) {
      await EventManagerService.handleRemovedMemberFromTeam({
        companyMember,
        companyTeam,
        updatedById: removedById,
      });
    }

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const addCompanyMemberByEmail = async ({
  companyId,
  payload,
  memberUser,
  employeeTypeId,
  isBatchUpload,
}: {
  companyId: CompanyId;
  employeeTypeId?: EmployeeTypeId;
  payload: AddMemberToCompanyInput;
  memberUser: UserModel;
  isBatchUpload?: boolean;
}): Promise<CompanyModel | Error | null> => {
  try {
    let user = (await UserService.getUserByEmail(payload.email)) as UserModel;
    if (!user) {
      user = (await UserService.createUserByEmail({
        email: payload.email,
        currentUserId: memberUser?.id,
        signUpData: JSON.stringify({ inviteType: 'member' }),
      })) as UserModel;
    }

    const exists = await validateUserInCompany({
      userId: user.id,
      companyId,
    });
    if (exists && !isBatchUpload) {
      return Promise.reject('User is already in company');
    }

    await SubscriptionService.handleSubscriptionQuota({
      companyId,
      quotaType: 'user',
      isDecrement: true,
    });

    if (!exists) {
      const res = await CompanyStore.addCompanyMembersByUserId({
        currentUserId: memberUser.id,
        companyId,
        employeeTypeId,
        userIds: [user.id],
        type: payload.type,
        position: payload.position,
        hourly_rate: payload.hourly_rate,
      });

      if (user.id !== memberUser.id) {
        await EventManagerService.handleInvitedMemberToCompany({
          user,
          company: res as CompanyModel,
          type: _.get(payload, 'type'),
          memberUser,
        });
      }

      return res;
    } else {
      return null;
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'addCompanyMemberByEmail',
        companyId,
        payload,
        memberUserId: memberUser?.id,
        employeeTypeId,
      },
    });
    return Promise.reject(error);
  }
};

const addCompanyMembersByUserId = async ({
  currentUserId,
  userIds,
  company,
  type,
}: {
  currentUserId: UserId;
  userIds: UserId[];
  company: CompanyModel;
  type: number;
}): Promise<CompanyModel | Error> => {
  try {
    const companyOwnerId = company?.user_id;
    if (!userIds.includes(companyOwnerId)) {
      const valid = await validateUserInCompany({
        userId: currentUserId,
        companyId: company.id,
      });

      if (!valid) {
        return Promise.reject('User not in company');
      }
    }

    const res = await CompanyStore.addCompanyMembersByUserId({
      currentUserId,
      userIds,
      companyId: company.id,
      type,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'addCompanyMembersByUserId',
        userIds,
        currentUserId,
        type,
      },
    });
    return Promise.reject(error);
  }
};

const addMembersToCompanyTeam = async ({
  memberIds,
  team,
  user,
}: {
  memberIds: CompanyMemberId[];
  team: CompanyTeamModel;
  user: UserModel;
}): Promise<number | Error> => {
  try {
    const res = await CompanyStore.addMembersToCompanyTeam({
      memberIds,
      teamId: team.id,
    });

    memberIds.forEach(async (memberId) => {
      await EventManagerService.handleMemberAssignedToTeam({
        memberId,
        team,
        updatedBy: user,
      });
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'addMembersToCompanyTeam',
        memberIds,
        teamId: team?.id,
        userId: user?.id,
      },
    });
    return Promise.reject(error);
  }
};

const getCompanyMember = async (
  companyMemberId: CompanyMemberId,
): Promise<CompanyMemberModel | Error> => {
  try {
    const res = await CompanyStore.getCompanyMember(companyMemberId);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanyMember',
        companyMemberId,
      },
    });
    return Promise.reject(err);
  }
};

const getUserByCompanyMemberId = async (
  companyMemberId: CompanyMemberId,
): Promise<UserModel | Error> => {
  try {
    const companyMember = (await getCompanyMember(
      companyMemberId,
    )) as CompanyMemberModel;

    const res = await UserService.getUser(companyMember.user_id);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getUserByCompanyMemberId',
        companyMemberId,
      },
    });
    return Promise.reject(error);
  }
};

const updateSenangPayOptions = async ({
  companyId,
  defaultPayment,
  instalmentOption,
  fullOption,
  enabled,
}: {
  companyId: CompanyId;
  defaultPayment: boolean;
  instalmentOption: boolean;
  fullOption: boolean;
  enabled: boolean;
}): Promise<CompanyModel | Error> => {
  try {
    const originalSettings = await CompanyStore.getCompanySettings(companyId);
    let defaultSettings;

    if (!originalSettings.settings || originalSettings.settings === '') {
      defaultSettings = {
        allowedPaymentType: {
          full: false,
          instalment: false,
          subscription: false,
        },
        senangpay: {
          applicationStatus: false,
          enabled: false,
          default_payment: false,
        },
        dedoco: {
          enabled: false,
        },
      };
    } else {
      defaultSettings = originalSettings.settings;
    }

    const isDefaultPayment =
      defaultPayment === undefined
        ? defaultSettings.senangpay.default_payment
        : defaultPayment;

    const isInstalment: boolean =
      instalmentOption === undefined
        ? defaultSettings.allowedPaymentType.instalment
        : instalmentOption;

    const isFull: boolean =
      fullOption === undefined
        ? defaultSettings.allowedPaymentType.instalment
        : fullOption;

    const isEnabled =
      enabled === undefined ? defaultSettings.senangpay.enabled : enabled;

    const updatedSettings = {
      ...defaultSettings,
      allowedPaymentType: {
        full: isFull,
        instalment: isInstalment,
        subscription: defaultSettings.allowedPaymentType.subscription,
      },
      senangpay: {
        applicationStatus: defaultSettings.senangpay.applicationStatus,
        enabled: isEnabled,
        default_payment: isDefaultPayment,
      },
    };
    const res = await CompanyStore.updateSenangPayOptions({
      companyId,
      payload: updatedSettings,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'updateSenangPayOptions',
        companyId,
        defaultPayment,
        instalmentOption,
        fullOption,
        enabled,
      },
    });
    return Promise.reject(error);
  }
};

const createCompanyServiceHistory = async ({
  companyId,
  collectionId,
  type,
  status,
  to,
  data,
}: {
  companyId: CompanyId;
  collectionId: CollectionId;
  type: string;
  status: number;
  to: string;
  data: any;
}): Promise<CompanyServiceHistoryModel | Error> => {
  try {
    const res = await CompanyStore.createCompanyServiceHistory({
      companyId,
      collectionId,
      type,
      status,
      to,
      data: JSON.stringify(data),
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'createCompanyServiceHistory',
        companyId,
        collectionId,
        type,
        status,
        to,
        data,
      },
    });
    return Promise.reject(error);
  }
};

const getCompanySubscription = async (
  companyId: CompanyId,
): Promise<CompanySubscriptionModel | Error> => {
  try {
    const res = await CompanyStore.getCompanySubscription(companyId);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanySubscription',
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const getCompanySubscriptions = async ({
  companyId,
  data,
}: {
  companyId: CompanyId;
  data: { whatsAppNotify: boolean; emailNotify: boolean };
}): Promise<MessageServiceModel> => {
  try {
    const res = (await CompanyStore.getCompanySubscription(
      companyId,
    )) as CompanySubscriptionModel;

    if (!res) {
      throw new Error(
        'Your current subscription plans may have expired or you may not possess the relevant plan to perform this service.',
      );
    }
    const subscriptionServices = {
      whatsApp: {
        notify: data.whatsAppNotify,
        quota: res.whatsApp_quota,
      },
      email: {
        notify: data.emailNotify,
        quota: res.email_quota,
      },
    };
    return { ...subscriptionServices, subscriptionId: res.id };
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanySubscriptions',
        companyId,
        data,
      },
    });
    return Promise.reject(error);
  }
};

const updateCompanyServiceHistory = async ({
  historyId,
  status,
}: {
  historyId: CompanyServiceHistoryId;
  status: number;
}): Promise<number | Error> => {
  try {
    const res = await CompanyStore.updateCompanyServiceHistory({
      historyId,
      status,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'updateCompanyServiceHistory',
        historyId,
        status,
      },
    });
    return Promise.reject(error);
  }
};

const checkCompanyServiceHistory = async ({
  collectionId,
  type,
}: {
  collectionId: CollectionId;
  type: string;
}): Promise<CompanyServiceHistoryModel | Error> => {
  try {
    const res = await CompanyStore.checkCompanyServiceHistory({
      collectionId,
      type,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'checkCompanyServiceHistory',
        collectionId,
        type,
      },
    });
    return Promise.reject(error);
  }
};

const addCompanyTeamStatus = async ({
  userId,
  payload,
}: {
  userId: UserId;
  payload: CompanyTeamStatusPayload;
}): Promise<CompanyTeamStatusModel | Error> => {
  try {
    if (payload.stage) {
      const parentStatus = getParentStatus(payload.stage);
      const updatedPayload = {
        ...payload,
        parent_status: parentStatus,
      };

      const res = await CompanyStore.addCompanyTeamStatus({
        userId,
        payload: updatedPayload,
      });
      return res;
    }
    const res = await CompanyStore.addCompanyTeamStatus({
      userId,
      payload,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'addCompanyTeamStatus',
        userId,
        payload,
      },
    });
    return Promise.reject(error);
  }
};

export const PARENT_STATUSES = {
  PENDING: 1,
  DONE: 2,
  REJECTED: 3,
};

export const STATUS_STAGES = {
  PENDING: 1,
  PASS: 2,
  FAIL: 3,
  CLOSED: 4,
};

const getParentStatus = (stage: number): number => {
  const stages: Record<number, number> = {
    1: PARENT_STATUSES.PENDING,
    2: PARENT_STATUSES.PENDING,
    3: PARENT_STATUSES.PENDING,
    4: PARENT_STATUSES.DONE,
  };

  return stages[stage] || 0;
};

const updateCompanyTeamStatus = async ({
  userId,
  statusId,
  payload,
  taskIds,
}: {
  userId: UserId;
  statusId: CompanyTeamStatusId;
  payload: CompanyTeamStatusPayload;
  taskIds: TaskId[];
}): Promise<CompanyTeamStatusModel | Error> => {
  try {
    if (payload.stage) {
      const parentStatus = getParentStatus(payload.stage);
      const updatedPayload = { ...payload, parent_status: parentStatus };
      const res = await CompanyStore.updateCompanyTeamStatus({
        userId,
        statusId,
        payload: updatedPayload,
        taskIds,
      });

      return res;
    }
    const res = await CompanyStore.updateCompanyTeamStatus({
      userId,
      statusId,
      payload,
      taskIds,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'updateCompanyTeamStatus',
        userId,
        statusId,
        payload,
        taskIds,
      },
    });
    return Promise.reject(error);
  }
};

const deleteCompanyTeamStatus = async ({
  companyTeamStatusId,
}: {
  companyTeamStatusId: number;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await CompanyStore.deleteCompanyTeamStatus({
      companyTeamStatusId,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    console.log(error);
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'deleteCompanyTeamStatus',
        companyTeamStatusId,
      },
    });
    return Promise.reject(error);
  }
};

const updateCompanyTeamStatusSequence = async ({
  payload,
  loaders,
}: {
  loaders: any;
  payload: CompanyTeamStatusSequenceUpdatePayload[];
}): Promise<(CompanyTeamStatusModel | Error)[]> => {
  try {
    const payloadWithCompanyTeamStatuses = await Promise.all(
      payload.map(async (cts) => {
        return {
          company_team_status: (await loaders.teamStatuses.load(
            cts.company_team_status_id,
          )) as CompanyTeamStatusModel,
          sequence: cts.sequence,
        };
      }),
    );

    const updatedTaskPayload = (await payloadWithCompanyTeamStatuses).map(
      (each) => {
        return {
          company_team_status_id: each.company_team_status.id,
          sequence: each.sequence,
        };
      },
    );

    const res = await CompanyStore.updateCompanyTeamStatusSequence({
      payload: updatedTaskPayload,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'updateCompanyTeamStatusSequence',
        payload,
      },
    });
    return Promise.reject(error);
  }
};

const uploadCompanyProfileImage = async ({
  attachment,
  user,
  company,
}: {
  attachment: UploadImagePayload;
  user: UserModel;
  company: CompanyModel;
}): Promise<CompanyModel | Error> => {
  try {
    const uploaded = await s3.processUploadToS3({
      attachment,
      s3Directory: `images/${process.env.GK_ENVIRONMENT}/${company.id_text}/`,
      isPublicAccess: true,
      companyId: company?.id,
    });

    if (!uploaded.success) {
      throw new Error('Upload failed');
    }

    const payload = {
      logo_url: uploaded?.url,
      logo_size: uploaded?.file_size,
    };

    const res = await updateCompanyInfo({
      payload,
      userId: user?.id,
      companyId: company?.id,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'uploadCompanyProfileImage',
        attachment,
        userId: user?.id,
        companyId: company?.id,
      },
    });
    return Promise.reject(error);
  }
};

const getCompanyMemberReferenceImage = async (
  companyMemberId: CompanyMemberId,
): Promise<CompanyMemberReferenceImageModel | Error> => {
  try {
    const res = await CompanyStore.getCompanyMemberReferenceImage(
      companyMemberId,
    );

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanyMemberReferenceImage',
        companyMemberId,
      },
    });
    return Promise.reject(error);
  }
};

const setCompanyMemberReferenceImage = async ({
  companyMemberId,
  input,
}: {
  companyMemberId: CompanyMemberId;
  input: {
    image_url: string;
    s3_bucket: string;
    s3_key: string;
  };
}): Promise<CompanyMemberReferenceImageModel | Error> => {
  try {
    const { s3_key, s3_bucket } = input;

    await s3.setCompanyMemberReferenceImageSize({
      key: s3_key,
      bucket: s3_bucket,
      companyMemberId,
    });

    const res = await CompanyStore.setCompanyMemberReferenceImage({
      companyMemberId,
      input,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'setCompanyMemberReferenceImage',
        companyMemberId,
        input,
      },
    });
    return Promise.reject(error);
  }
};

const getReferenceImageUploadUrl = async (
  companyPublicId: CompanyPublicId,
): Promise<{ s3_bucket: string; s3_key: string; upload_url: string }> => {
  try {
    const filename = uuid();
    const options = {
      bucketName: 'gokudos-assets',
      filePath: `${process.env.GK_ENVIRONMENT}/member-reference-images/${companyPublicId}/${filename}.jpg`,
    };
    const res = await StorageService.generatePresignedS3Url(options);
    return {
      s3_bucket: options.bucketName,
      s3_key: options.filePath,
      upload_url: res,
    };
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getReferenceImageUploadUrl',
        companyPublicId,
      },
    });
    return Promise.reject(error);
  }
};

const insertSlugForCompany = async ({
  company,
}: {
  company: CompanyModel;
}): Promise<CompanyModel | Error | void> => {
  try {
    //TODO: Implement actual slug in the future
    // const slug = slugify(company.name, {
    //   lower: true,
    //   remove: /[*+~.()'"!:@]/g,
    // });

    const slug = await UrlService.getShortId();

    const res = await CompanyStore.insertSlugForCompany({
      companyId: company.id,
      slug,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'insertSlugForCompany',
        companyId: company.id,
      },
    });
    return Promise.reject(error);
  }
};

const insertSlugsForAllCompanies = async (): Promise<void | Error> => {
  try {
    const allCompanies =
      (await CompanyStore.getAllCompanies()) as CompanyModel[];

    _.forEach(allCompanies, async (company) => {
      if (!company.slug) {
        await insertSlugForCompany({ company });
      }
    });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'company',
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const setCompanyMemberReferenceImageStatus = async ({
  companyMemberIds,
  status,
  remark,
  userId,
}: {
  companyMemberIds: CompanyMemberId[];
  status: number;
  remark: string;
  userId: UserId;
}): Promise<CompanyMemberModel[] | Error> => {
  try {
    const res = await CompanyStore.setCompanyMemberReferenceImageStatus({
      companyMemberIds,
      status,
      remark,
      userId,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'setCompanyMemberReferenceImageStatus',
        companyMemberIds,
        userId,
        status,
      },
    });
    return Promise.reject(error);
  }
};

const createEmployeeType = async ({
  companyId,
  name,
  overtime,
  userId,
  timezone,
}: {
  companyId: CompanyId;
  name: string;
  overtime: boolean;
  userId: UserId;
  timezone: string;
}): Promise<EmployeeTypeModel | Error> => {
  try {
    const res = (await CompanyStore.createEmployeeType({
      companyId,
      name,
      overtime,
    })) as EmployeeTypeModel;

    await CompanyStore.createDefaultWorkWeek({
      companyId,
      employeeTypeId: res.id,
      userId,
      timezone,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'createEmployeeType',
        companyId,
        userId,
        name,
        overtime,
      },
    });
    return Promise.reject(error);
  }
};

const updateEmployeeType = async ({
  typeId,
  name,
  overtime,
  archived = false,
}: {
  typeId: EmployeeTypeId;
  name: string;
  overtime: boolean;
  archived: boolean;
}): Promise<EmployeeTypeModel | Error> => {
  try {
    const res = await CompanyStore.updateEmployeeType({
      typeId,
      name,
      overtime,
      archived,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'updateEmployeeType',
        typeId,
        name,
        overtime,
        archived,
      },
    });
    return Promise.reject(error);
  }
};

const archiveEmployeeType = async ({
  typeId,
  archived,
}: {
  typeId: EmployeeTypeId;
  archived: boolean;
}): Promise<EmployeeTypeModel | Error> => {
  try {
    const res = await CompanyStore.archiveEmployeeType({
      typeId,
      archived,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'archiveEmployeeType',
        typeId,
        archived,
      },
    });
    return Promise.reject(error);
  }
};

const getEmployeeTypes = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<EmployeeTypeModel[] | Error> => {
  try {
    const res = await CompanyStore.getEmployeeTypes({ companyId });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getEmployeeTypes',
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const getWorkDaySettings = async ({
  employeeTypeId,
}: {
  employeeTypeId: EmployeeTypeId;
}): Promise<CompanyWorkDaySettingModel[] | Error> => {
  try {
    const res = await CompanyStore.getWorkDaySettings({
      employeeTypeId,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getWorkDaySettings',
        employeeTypeId,
      },
    });
    return Promise.reject(error);
  }
};

const getWorkDaySettingsByCompanyId = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<CompanyWorkDaySettingModel[] | Error> => {
  try {
    const res = await CompanyStore.getWorkDaySettingsByCompanyId({
      companyId,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getWorkDaySettingsByCompanyId',
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const getMemberWorkingHours = async ({
  companyMemberId,
  day,
}: {
  companyMemberId: CompanyMemberId;
  day: number;
}): Promise<CompanyWorkDaySettingModel | Error | undefined> => {
  const loaders = createLoaders();
  try {
    const member = (await loaders.companyMembers.load(
      companyMemberId,
    )) as CompanyMemberModel;
    const { employee_type } = member;

    const workDaySettings = (await CompanyStore.getWorkDaySettings({
      employeeTypeId: employee_type,
    })) as CompanyWorkDaySettingModel[];
    const currentDaySetting = _.find(workDaySettings, (wd) => wd.day === day);

    return currentDaySetting;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getMemberWorkingHours',
        companyMemberId,
        day,
      },
    });
    return Promise.reject(error);
  }
};

const updateCompanyWorkDaySetting = async ({
  companyId,
  day,
  typeId,
  input,
  userId,
}: {
  companyId: CompanyId;
  day: number;
  typeId: EmployeeTypeId;
  input: UpdateCompanyWorkDayPayload;
  userId: UserId;
}): Promise<CompanyWorkDaySettingModel | Error> => {
  try {
    const res = await CompanyStore.updateCompanyWorkDaySetting({
      companyId,
      day,
      typeId,
      input,
      userId,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'updateCompanyWorkDaySetting',
        companyId,
        day,
        typeId,
        input,
        userId,
      },
    });
    return Promise.reject(error);
  }
};

const updateCompanyPermissions = async ({
  companyId,
  grantsObj,
}: CompanyPermissionPayload): Promise<
  CompanyPermissionModel | Error | void
> => {
  try {
    let ac: AccessControl;

    const existingAc = (await CompanyStore.getCompanyPermission(
      companyId,
    )) as CompanyPermissionModel;

    if (existingAc) {
      const grants =
        typeof existingAc?.grants === 'string'
          ? JSON.parse(existingAc?.grants)
          : existingAc?.grants;

      ac = new AccessControl(grants);
    } else {
      ac = new AccessControl(DEFAULT_COMPANY_GRANTS);
    }

    if (grantsObj?.member) {
      const memberCrud = grantsObj?.member;

      if (memberCrud.member) {
        if (memberCrud.member.create) {
          ac.grant(memberTypes.MEMBER).create(memberTypes.MEMBER);
        } else if (memberCrud.member.create === false) {
          ac.deny(memberTypes.MEMBER).create(memberTypes.MEMBER);
        }

        if (memberCrud.member.read) {
          ac.grant(memberTypes.MEMBER).read(memberTypes.MEMBER);
        } else if (memberCrud.member.read === false) {
          ac.deny(memberTypes.MEMBER).read(memberTypes.MEMBER);
        }

        if (memberCrud.member.update) {
          ac.grant(memberTypes.MEMBER).update(memberTypes.MEMBER);
        } else if (memberCrud.member.update === false) {
          ac.deny(memberTypes.MEMBER).update(memberTypes.MEMBER);
        }

        if (memberCrud.member.delete) {
          ac.grant(memberTypes.MEMBER).delete(memberTypes.MEMBER);
        } else if (memberCrud.member.delete === false) {
          ac.deny(memberTypes.MEMBER).delete(memberTypes.MEMBER);
        }
      }
    }

    if (grantsObj?.manager) {
      const memberCrud = grantsObj?.manager;

      if (memberCrud.member) {
        if (memberCrud.member.create) {
          ac.grant(memberTypes.MANAGER).create(memberTypes.MEMBER);
        } else if (memberCrud.member.create === false) {
          ac.deny(memberTypes.MANAGER).create(memberTypes.MEMBER);
        }

        if (memberCrud.member.read) {
          ac.grant(memberTypes.MANAGER).read(memberTypes.MEMBER);
        } else if (memberCrud.member.read === false) {
          ac.deny(memberTypes.MANAGER).read(memberTypes.MEMBER);
        }

        if (memberCrud.member.update) {
          ac.grant(memberTypes.MANAGER).update(memberTypes.MEMBER);
        } else if (memberCrud.member.update === false) {
          ac.deny(memberTypes.MANAGER).update(memberTypes.MEMBER);
        }

        if (memberCrud.member.delete) {
          ac.grant(memberTypes.MANAGER).delete(memberTypes.MEMBER);
        } else if (memberCrud.member.delete === false) {
          ac.deny(memberTypes.MANAGER).delete(memberTypes.MEMBER);
        }
      }
    }

    const res = await CompanyStore.updateCompanyPermissions({
      companyId,
      grants: JSON.stringify(ac.getGrants()),
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'updateCompanyPermissions',
        companyId,
        grantsObj,
      },
    });
    return Promise.reject(error);
  }
};

const getCompanyPermission = async (
  companyId: CompanyId,
): Promise<CompanyPermissionModel | Error> => {
  try {
    let res = await CompanyStore.getCompanyPermission(companyId);
    if (!res) {
      const ac = new AccessControl(DEFAULT_COMPANY_GRANTS);

      res = await CompanyStore.updateCompanyPermissions({
        companyId,
        grants: JSON.stringify(ac.getGrants()),
      });
    }
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanyPermission',
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const checkCompanyMemberPermission = async ({
  memberType,
  companyId,
  resource,
  action,
}: {
  memberType: number;
  companyId: CompanyId;
  resource: string;
  action: string;
}): Promise<{ hasPermission: boolean; type: string }> => {
  let allowed = false;
  try {
    const permissions = (await getCompanyPermission(
      companyId,
    )) as CompanyPermissionModel;

    const grants =
      typeof permissions?.grants === 'string'
        ? JSON.parse(permissions?.grants)
        : permissions?.grants;

    const ac = new AccessControl(grants);

    if (memberType === 3) {
      const memType = memberTypes.MEMBER;
      const hasAddMemberPermission = ac.permission({
        role: memType,
        resource,
        action,
      }).granted;

      if (!hasAddMemberPermission) {
        return { hasPermission: allowed, type: memberTypes.MEMBER };
      } else {
        allowed = true;
        return { hasPermission: allowed, type: memberTypes.MEMBER };
      }
    } else if (memberType === 2) {
      const memType = memberTypes.MANAGER;
      const hasAddMemberPermission = ac.permission({
        role: memType,
        resource,
        action,
      }).granted;

      if (!hasAddMemberPermission) {
        return { hasPermission: allowed, type: memberTypes.MANAGER };
      } else {
        allowed = true;
        return { hasPermission: allowed, type: memberTypes.MANAGER };
      }
    } else if (memberType === 1) {
      allowed = true;
      return { hasPermission: allowed, type: memberTypes.ADMIN };
    }
    return {
      hasPermission: allowed,
      type:
        memberType === 3
          ? memberTypes.MEMBER
          : memberType === 2
          ? memberTypes.MANAGER
          : memberTypes.ADMIN,
    };
  } catch (error) {
    const err = error as Error;
    return {
      hasPermission: allowed,
      type:
        memberType === 3
          ? memberTypes.MEMBER
          : memberType === 2
          ? memberTypes.MANAGER
          : memberTypes.ADMIN,
    };
  }
};

const getCompanyTeamsByMemberId = async ({
  memberId,
}: {
  memberId: CompanyMemberId;
}): Promise<(CompanyTeamMemberModel | Error)[]> => {
  try {
    const res = await CompanyStore.getCompanyTeamsByMemberId({ memberId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanyTeamsByMemberId',
        memberId,
      },
    });
    return Promise.reject(error);
  }
};

const getProfileString = (profile: unknown): string => {
  if (typeof profile === 'string') {
    return profile;
  } else {
    return JSON.stringify(profile);
  }
};

const getCompanyProfileJson = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<string> => {
  try {
    const res = await CompanyStore.getCompanyProfile({ companyId });
    const jsonProfile = _.get(res, 'profile');
    return getProfileString(jsonProfile);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanyProfileJson',
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const updateCompanyProfile = async ({
  companyId,
  value,
  key,
}: {
  companyId: CompanyId;
  key: string;
  value: string;
}): Promise<string> => {
  try {
    const profileRes = await CompanyStore.getCompanyProfile({ companyId });
    const jsonProfile = _.get(profileRes, 'profile');
    let parsedData: { [key: string]: string } = {};

    if (typeof jsonProfile === 'string') {
      parsedData = JSON.parse(jsonProfile || '{}');
    } else {
      parsedData = jsonProfile || {};
    }

    parsedData[key] = value;

    const res = await CompanyStore.updateCompanyProfile({
      companyId,
      profile: parsedData,
    });

    return getProfileString(_.get(res, 'profile'));
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'updateCompanyProfile',
        companyId,
        key,
        value,
      },
    });
    return Promise.reject(error);
  }
};

const upsertCompanyQuotaUsage = async ({
  services,
  companyId,
  interval,
}: {
  services: { whatsapp?: boolean; email?: boolean };
  companyId: CompanyId;
  interval: string;
}): Promise<CompanyQuotaUsageModel | Error | void> => {
  try {
    const res = await CompanyStore.upsertCompanyQuotaUsage({
      services,
      companyId,
      interval,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'upsertCompanyQuotaUsage',
        companyId,
        interval,
        services,
      },
    });
    return Promise.reject(error);
  }
};

const getCompanyProfile = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<CompanyProfileModel | Error> => {
  try {
    const res = await CompanyStore.getCompanyProfile({ companyId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanyProfile',
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const updateCompanyTimezone = async ({
  companyId,
  default_timezone,
}: {
  companyId: CompanyId;
  default_timezone: string;
}): Promise<CompanyProfileModel | Error> => {
  try {
    const res = await CompanyStore.updateCompanyTimezone({
      companyId,
      default_timezone,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'updateCompanyTimezone',
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const getCompanyDefaultTimezone = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<string> => {
  try {
    const res = (await CompanyStore.getCompanyProfile({
      companyId,
    })) as CompanyProfileModel;

    if (!res) {
      return process.env.LOCAL_TIMEZONE || 'Asia/Kuala_Lumpur';
    } else if (!res?.default_timezone) {
      return process.env.LOCAL_TIMEZONE || 'Asia/Kuala_Lumpur';
    } else {
      return res.default_timezone;
    }
  } catch (error) {
    const err = error as Error;
    return process.env.LOCAL_TIMEZONE || 'Asia/Kuala_Lumpur';
  }
};

const getMemberWorkingHourTimezone = async ({
  companyMemberId,
  day,
}: {
  companyMemberId: CompanyMemberId;
  day: number;
}): Promise<string> => {
  const loaders = createLoaders();
  try {
    const member = (await loaders.companyMembers.load(
      companyMemberId,
    )) as CompanyMemberModel;
    const { employee_type } = member;

    const workDaySettings = (await CompanyStore.getWorkDaySettings({
      employeeTypeId: employee_type,
    })) as CompanyWorkDaySettingModel[];
    const currentDaySetting = _.find(workDaySettings, (wd) => wd.day === day);

    if (!currentDaySetting) {
      const companyTimezone = await getCompanyDefaultTimezone({
        companyId: member.company_id,
      });

      return companyTimezone;
    } else {
      return (
        currentDaySetting?.timezone ||
        process.env.LOCAL_TIMEZONE ||
        'Asia/Kuala_Lumpur'
      );
    }
  } catch (error) {
    const err = error as Error;
    const member = (await loaders.companyMembers.load(
      companyMemberId,
    )) as CompanyMemberModel;

    if (member) {
      return await getCompanyDefaultTimezone({
        companyId: member.company_id,
      });
    } else {
      return process.env.LOCAL_TIMEZONE || 'Asia/Kuala_Lumpur';
    }
  }
};

const getLastRemindExceeded = async (
  companyId: CompanyId,
): Promise<string | null> => {
  try {
    const res = (await CompanyStore.getCompanyQuotaUsage(
      companyId,
    )) as CompanyQuotaUsageModel;
    const lastRemindExceeded = res.lastRemindExceeded;
    return lastRemindExceeded;
  } catch (error) {
    const err = error as Error;
    logger.errorLogger.log('info', 'getLastRemindExceeded', error);
    return null;
  }
};

const bulkUploadMembers = async ({
  attachment,
  companyId,
  user,
}: {
  attachment: AttachmentPayload;
  companyId: CompanyId;
  user: UserModel;
}): Promise<{
  members: (CompanyMemberModel | Error)[];
  duplicates: number;
}> => {
  try {
    const companyMembers = (await getCompanyMembers(
      companyId,
    )) as CompanyMemberModel[];

    const companyMember = _.find(
      companyMembers,
      (cm) => cm.user_id === user.id,
    );

    if (companyMember?.type === companyMemberTypes.MEMBER) {
      throw new Error('user not an admin or manager');
    }
    const extension = path.extname(attachment.filename);
    if (extension !== '.csv') {
      throw new Error('file extension is not csv');
    }

    const readStream = attachment.createReadStream();

    const parsedResults = (await exportFunctions.processFileStream(
      readStream,
    )) as ParseMembersResultCsvModel[];

    if (parsedResults.length > 1000) {
      throw new Error('Maximum of 1000 entries');
    }

    const membersToBeAdded = _.uniqBy(parsedResults, 'email');

    const addedMembers = await Promise.all(
      _.map(membersToBeAdded, async (memberRow) => {
        const res = (await exportFunctions.addCompanyMemberByEmail({
          companyId,
          isBatchUpload: true,
          memberUser: user,
          payload: {
            email: memberRow.email,
            type: memberRow.type,
            position: memberRow.position,
          },
        })) as CompanyModel;

        if (res?.id) {
          const user = (await UserService.getUserByEmail(
            memberRow?.email,
          )) as UserModel;
          const member = CompanyStore.getMemberByUserIdAndCompanyId({
            companyId,
            userId: user?.id,
          });

          return member;
        }
      }),
    );
    const addedMembersFiltered = addedMembers.filter(
      (member) => member,
    ) as CompanyMemberModel[];
    const membersToBeAddedEmails = _.map(
      membersToBeAdded,
      (member) => member.email,
    );
    const loaders = createLoaders();

    let duplicateMembers = 0;

    await Promise.all(
      _.map(companyMembers, async (member) => {
        const user = (await loaders.users.load(member.user_id)) as UserModel;

        if (user) {
          if (membersToBeAddedEmails.includes(user?.email)) {
            duplicateMembers++;
          }
        }
      }),
    );

    return {
      members: addedMembersFiltered,
      duplicates: duplicateMembers || 0,
    };
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'bulkUploadMembers',
        companyId,
        userId: user?.id,
      },
    });
    return Promise.reject(error);
  }
};

const processFileStream = (readStream: ReadStream): Promise<any> => {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    const parseResults = [];
    const csvOptions = {
      mapHeaders: ({ header, index }: { header: string; index: number }) =>
        header.toLowerCase().replace(' ', '_'),
    };
    readStream
      .pipe(csv(csvOptions))
      .on(
        'data',
        async (data: { email: string; position: string; role: string }) => {
          const validateEmailRes = joi.string().email().validate(data?.email);
          if (validateEmailRes.error) {
            throw new Error('One of the email in provided .csv is not valid');
          }

          const row = {
            email: data.email,
            position: data.position,
            type: getMemberTypeFromString(data?.role),
          };
          return parseResults.push(row);
        },
      )
      .on('end', () => {
        //@ts-ignore
        resolve(parseResults);
      });
  });
};

const getCompanyStorageDetails = async (
  companyId: CompanyId,
): Promise<CompanyStorageDetailsModel | Error> => {
  try {
    const companyStorageList = (await CompanyStore.getCompanyStorageDetails(
      companyId,
    )) as CompanyStorageListModel[];
    const totalFileSize = _.round(
      _.sum(
        _.map(companyStorageList, (list) => {
          return _.toNumber(list.fileSize);
        }),
      ),
      2,
    );
    const totalFileSizeInMB = _.round(totalFileSize / 1024, 2);
    const res = {
      summary: companyStorageList,
      totalUsageInKB: totalFileSize,
      totalUsageInMB: totalFileSizeInMB,
    } as CompanyStorageDetailsModel;

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'getCompanyStorageDetails',
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const validateUploadRequest = async ({
  companyId,
  fileSize,
}: {
  companyId: CompanyId;
  fileSize: number;
}) => {
  try {
    const freePackageStorage = 5;
    let allocatedStorage = 0;
    const GigaByteToKiloByteConstant = 1048576;
    const storageSummary = (await getCompanyStorageDetails(
      companyId,
    )) as CompanyStorageDetailsModel;
    const subscriptions =
      (await SubscriptionStore.getActiveCompanySubscriptions(
        companyId,
      )) as CompanySubscriptionModel[];
    const basicSubscription = _.head(
      subscriptions.filter(
        (sub: CompanySubscriptionModel) =>
          sub.data?.type === PACKAGES_TYPES.BASIC,
      ),
    );
    if (!basicSubscription) {
      allocatedStorage = freePackageStorage * GigaByteToKiloByteConstant;
    } else {
      allocatedStorage =
        basicSubscription.data.storage * GigaByteToKiloByteConstant;
    }
    const totalStorageAfterUpload = storageSummary?.totalUsageInKB + fileSize;

    if (totalStorageAfterUpload > allocatedStorage) {
      throw Error('Insufficient storage available to upload the file');
    } else {
      return true;
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'validateUploadRequest',
        companyId,
        fileSize,
      },
    });
    return Promise.reject(error);
  }
};

const updateCompanyMemberActiveStatus = async ({
  companyMemberId,
  active,
  user,
}: {
  companyMemberId: CompanyMemberId;
  active: boolean;
  user: UserModel;
}) => {
  try {
    const res = await CompanyStore.updateCompanyMemberActiveStatus({
      companyMemberId,
      active,
      userId: user.id,
    });

    if (res && res?.active === 1) {
      await SubscriptionService.handleSubscriptionQuota({
        companyId: res?.companyId,
        quotaType: 'user',
        isDecrement: true,
        quota: 0,
      });
    } else if (res && res?.active === 0) {
      await SubscriptionService.handleSubscriptionQuota({
        companyId: res?.companyId,
        quotaType: 'user',
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'company',
        fnName: 'updateCompanyMemberActiveStatus',
        companyMemberId,
        active,
        userId: user?.id,
      },
    });
    return Promise.reject(error);
  }
};

const createCompanyPaymentMethod = async (input: {
  user: UserModel;
  stripePaymentMethodId: string;
  companyId: CompanyId;
}) => {
  try {
    const { user, stripePaymentMethodId, companyId } = input;

    let stripeCustomerId = null;

    // The legacy system had the stripe customer id on the user object
    // so we need to check if there's already one and use that
    if (user.customerId) {
      stripeCustomerId = user.customerId;
    } else {
      // Otherwise see if there's an existing stripe customer for this user's email
      const stripeCustomers = await StripeService.searchCustomerEmail({
        email: user.email,
      });

      if (_.isEmpty(stripeCustomers)) {
        const createdCustomer = await StripeService.createCustomer({
          email: user.email,
          name: user.name,
        });
        stripeCustomerId = createdCustomer.id;
      } else {
        const customer = _.head(stripeCustomers);
        stripeCustomerId = customer!.id;
      }
    }

    if (!stripeCustomerId) {
      throw new Error('There was a problem creating the stripe customer');
    }

    const existingPaymentMethods = await CompanyStore.getCompanyPaymentMethods({
      companyId,
    });
    const isDefaultPaymentMethod = _.isEmpty(existingPaymentMethods);

    const paymentMethod = await StripeService.attachPaymentMethodToCustomer({
      paymentMethodId: stripePaymentMethodId,
      customerId: stripeCustomerId,
    });

    const res = await CompanyStore.createCompanyPaymentMethod({
      companyId,
      userId: user.id,
      stripePaymentMethodId: paymentMethod.id,
      stripeCustomerId,
      isDefault: isDefaultPaymentMethod,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanyProfileForInvoice = async (input: {
  companyId: CompanyId;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  registrationCode?: string | null;
  invoiceStart?: string | null;
}) => {
  try {
    const res = await CompanyStore.updateCompanyProfileForInvoice(input);

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanyPaymentMethods = async (input: { companyId: CompanyId }) => {
  try {
    const { companyId } = input;

    const res = await CompanyStore.getCompanyPaymentMethods({ companyId });

    const resWithCardDetails = await Promise.all(
      res.map(async (paymentMethod) => {
        const cardDetails = await StripeService.getPaymentMethod(
          paymentMethod.stripePaymentMethodId,
        );

        return {
          ...paymentMethod,
          card: cardDetails.card,
        };
      }),
    );

    return resWithCardDetails;
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCompanyPaymentMethod = async (input: {
  companyId: CompanyId;
  stripePaymentMethodId: string;
  user: UserModel;
}) => {
  try {
    const { companyId, stripePaymentMethodId, user } = input;

    // before we remove we need to check if it is currently the payment method for the company subscription
    const companySubscription =
      await SubscriptionStore.getSubscriptionForCompanyId({
        companyId,
      });

    if (companySubscription) {
      const stripeSub = await StripeService.getSubscription(
        companySubscription.stripeSubscriptionId,
      );
      if (stripeSub.default_payment_method === stripePaymentMethodId) {
        throw new Error(
          'Cannot delete payment method as it is currently the active payment method for the company subscription',
        );
      }
    }

    await StripeService.detachPaymentMethodFromCustomer({
      paymentMethodId: stripePaymentMethodId,
    });

    const res = await CompanyStore.deleteCompanyPaymentMethod({
      companyId,
      stripePaymentMethodId,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const setDefaultCompanyPaymentMethod = async (input: {
  companyId: CompanyId;
  stripePaymentMethodId: string;
}) => {
  try {
    const { companyId, stripePaymentMethodId } = input;

    await SubscriptionService.updateSubscriptionPaymentMethod({
      companyId,
      stripePaymentMethodId,
    });

    const defaultPaymentOption =
      await CompanyStore.getCompanyDefaultPaymentMethod({ companyId });

    if (defaultPaymentOption) {
      await CompanyStore.setCompanyPaymentMethodIsDefault({
        companyId,
        stripePaymentMethodId: defaultPaymentOption.stripePaymentMethodId,
        isDefault: false,
      });
    }

    const res = await CompanyStore.setCompanyPaymentMethodIsDefault({
      companyId,
      stripePaymentMethodId,
      isDefault: true,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanyLogoInBase64 = async (logoUrl: string): Promise<string> => {
  try {
    const image = await axios.get(logoUrl, {
      responseType: 'arraybuffer',
    });

    const logoUrlExtension = _.last(logoUrl.split('.'));
    const formattedLogoExtension =
      logoUrlExtension === 'jpg' ? 'jpeg' : logoUrlExtension;

    const bas64Image = Buffer.from(image.data).toString('base64');
    const base64Logo = `data:image/${formattedLogoExtension};base64,${bas64Image}`;
    return base64Logo;
  } catch (error) {
    return Promise.reject(error);
  }
};

const exportFunctions = {
  addCompanyTeamStatus,
  updateCompanyTeamStatus,
  getCompanyMembers,
  getMemberByUserIdAndCompanyId,
  getCompanyTeams,
  getCompanyTeamStatuses,
  deleteCompanyTeamStatus,
  getCompanyTeamMembers,
  createCompany,
  deleteCompany,
  updateCompanyInfo,
  updateCompanyMemberInfo,
  updateCompanyTeamInfo,
  addCompanyMembersByUserId,
  addMembersToCompanyTeam,
  createCompanyTeam,
  deleteCompanyTeam,
  removeMemberFromCompanyTeam,
  addCompanyMemberByEmail,
  getCompanyMember,
  getUserByCompanyMemberId,
  removeCompanyMember,
  updateCompanyTeamStatusSequence,
  getCompanyMembersByUserId,
  updateSenangPayOptions,
  createCompanyServiceHistory,
  getCompanySubscription,
  getCompanySubscriptions,
  updateCompanyServiceHistory,
  checkCompanyServiceHistory,
  validateUserInCompany,
  getCompanies,
  uploadCompanyProfileImage,
  getCompanyMemberReferenceImage,
  setCompanyMemberReferenceImage,
  getReferenceImageUploadUrl,
  insertSlugForCompany,
  insertSlugsForAllCompanies,
  setCompanyMemberReferenceImageStatus,
  createEmployeeType,
  updateEmployeeType,
  archiveEmployeeType,
  getEmployeeTypes,
  getWorkDaySettings,
  getWorkDaySettingsByCompanyId,
  updateCompanyWorkDaySetting,
  getMemberWorkingHours,
  updateCompanyPermissions,
  getCompanyPermission,
  checkCompanyMemberPermission,
  getCompanyTeamsByMemberId,
  getCompanyProfileJson,
  updateCompanyProfile,
  getProfileString,
  upsertCompanyQuotaUsage,
  getCompanyProfile,
  updateCompanyTimezone,
  getCompanyDefaultTimezone,
  getMemberWorkingHourTimezone,
  getLastRemindExceeded,
  bulkUploadMembers,
  processFileStream,
  getCompanyStorageDetails,
  validateUploadRequest,
  updateCompanyMemberActiveStatus,
  createCompanyPaymentMethod,
  updateCompanyProfileForInvoice,
  getCompanyPaymentMethods,
  deleteCompanyPaymentMethod,
  setDefaultCompanyPaymentMethod,
  getCompanyLogoInBase64,
};

export default exportFunctions;
