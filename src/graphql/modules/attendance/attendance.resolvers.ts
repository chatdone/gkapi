import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Resolvers } from '@generated/graphql-types';
import { AttendanceStore, UserStore } from '@data-access';
import { handleResolverError } from '../../errors';
import { AttendanceService, CompanyService, TagService } from '@services';
import {
  AttendanceDailySummaryModel,
  AttendanceLabelModel,
  AttendanceModel,
  AttendanceMonthlySummaryModel,
  AttendanceSettingsModel,
  AttendanceWeeklySummaryModel,
} from '@models/attendance.model';
import { CompanyId, CompanyMemberModel } from '@models/company.model';
import { LocationModel } from '@models/location.model';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import _ from 'lodash';
import { TagModel } from '@models/tag.model';
import {
  getAttendance,
  getCompany,
  getCompanyMember,
  getContact,
} from '@data-access/getters';
import { ContactModel } from '@models/contact.model';
dayjs.extend(tz);

export const resolvers: Resolvers = {
  Attendance: {
    id: ({ id_text }) => id_text,
    location: async ({ location_id }, args, { loaders }) => {
      return location_id ? await loaders.locations.load(location_id) : null;
    },
    label: async ({ attendance_label_id }, args, { loaders }) => {
      return attendance_label_id
        ? await loaders.attendanceLabels.load(attendance_label_id)
        : null;
    },
    tags: async ({ id }) => {
      const res = await TagService.getTagsByAttendanceId({ attendanceId: id });

      return res;
    },
    companyMember: async ({ company_member_id }, args, { loaders }) => {
      return company_member_id
        ? await loaders.companyMembers.load(company_member_id)
        : company_member_id;
    },
    contact: async ({ contact_id }, args, { loaders }) => {
      return contact_id ? await loaders.contacts.load(contact_id) : contact_id;
    },
    startDate: ({ start_date }) => {
      return start_date ? start_date : null;
    },
    endDate: ({ end_date }) => {
      return end_date ? end_date : null;
    },
    submittedDate: ({ submitted_date }) => {
      return submitted_date ? submitted_date : null;
    },
    commentsOut: ({ comments_out }) => {
      return comments_out ? comments_out : null;
    },
    createdAt: ({ created_at }) => {
      return created_at ? created_at : null;
    },
    updatedAt: ({ updated_at }) => {
      return updated_at ? updated_at : null;
    },
    timeTotal: ({ time_total }) => {
      return time_total ? time_total : null;
    },
    verificationType: ({ verification_type }) => {
      return verification_type ? verification_type : null;
    },
    isLastOut: ({ is_last_out }) => {
      return is_last_out ? is_last_out : null;
    },
    imageUrl: ({ image_url }) => {
      return image_url ? image_url : null;
    },
    s3Bucket: ({ s3_bucket }) => {
      return s3_bucket ? s3_bucket : null;
    },
    s3Key: ({ s3_bucket }) => {
      return s3_bucket ? s3_bucket : null;
    },
    //DEPRECATED
    company_member: async ({ company_member_id }, args, { loaders }) => {
      return company_member_id
        ? await loaders.companyMembers.load(company_member_id)
        : company_member_id;
    },
  },
  AttendanceLabel: {
    id: ({ id_text }) => id_text,
    archived: ({ archived }) => !!archived,
    createdAt: ({ created_at }) => created_at,
    updatedAt: ({ updated_at }) => updated_at,
  },
  VerificationImageUploadUrlResponse: {
    s3Bucket: ({ s3_bucket }) => (s3_bucket ? s3_bucket : null),
    s3Key: ({ s3_key }) => (s3_key ? s3_key : null),
    uploadUrl: ({ upload_url }) => (upload_url ? upload_url : null),
  },
  AttendanceType: {
    CLOCK: 1,
    BREAK: 0,
  },
  AttendanceVerificationType: {
    BIOMETRIC: 1,
    DEVICE_PASSCODE: 2,
    IMAGE_COMPARE: 3,
  },
  AttendanceDaySummary: {
    generatedAt: ({ generated_at }) => {
      return generated_at ? generated_at : null;
    },
    updatedAt: ({ updated_at }) => {
      return updated_at ? updated_at : null;
    },
    createdAt: ({ created_at }) => {
      return created_at ? created_at : null;
    },
    companyMember: async ({ company_member_id }, args, { loaders }) => {
      return company_member_id
        ? await loaders.companyMembers.load(company_member_id)
        : null;
    },
    attendances: async (
      { generated_at, company_member_id },
      args,
      { loaders },
    ) => {
      const member = (await loaders.companyMembers.load(
        company_member_id,
      )) as CompanyMemberModel;
      const date = await AttendanceService.getDayRange(generated_at);

      const attendances = (await AttendanceStore.getAttendances({
        fromDate: date.start,
        toDate: date.end,
        companyId: member.company_id,
        companyMemberId: member.id,
      })) as AttendanceModel[];

      if (attendances?.length === 0) {
        return [];
      } else {
        return attendances;
      }
    },
    firstIn: ({ first_in }) => {
      return first_in ? first_in : null;
    },
    firstAttendance: async ({ first_attendance_id }, args, { loaders }) => {
      return first_attendance_id
        ? await loaders.attendances.load(first_attendance_id)
        : null;
    },
    lastAttendance: async ({ last_attendance_id }, args, { loaders }) => {
      return last_attendance_id
        ? await loaders.attendances.load(last_attendance_id)
        : null;
    },
    // DEPRECATED
    company_member: async ({ company_member_id }, args, { loaders }) => {
      return company_member_id
        ? await loaders.companyMembers.load(company_member_id)
        : null;
    },
  },
  AttendanceWeekSummary: {
    companyMember: async ({ company_member_id }, args, { loaders }) => {
      return company_member_id
        ? await loaders.companyMembers.load(company_member_id)
        : null;
    },
    trackedTotal: ({ tracked_total }) => {
      return tracked_total ? tracked_total : null;
    },
    workedTotal: ({ worked_total }) => {
      return worked_total ? worked_total : null;
    },
    regularTotal: ({ regular_total }) => {
      return regular_total ? regular_total : null;
    },
    overtimeTotal: ({ overtime_total }) => {
      return overtime_total ? overtime_total : null;
    },
    generatedAt: ({ generated_at }) => {
      return generated_at ? generated_at : null;
    },
    updatedAt: ({ updated_at }) => {
      return updated_at ? updated_at : null;
    },
    createdAt: ({ created_at }) => {
      return created_at ? created_at : null;
    },
    // DEPRECATED
    company_member: async ({ company_member_id }, args, { loaders }) => {
      return company_member_id
        ? await loaders.companyMembers.load(company_member_id)
        : null;
    },
  },
  AttendanceMonthSummary: {
    companyMember: async ({ company_member_id }, args, { loaders }) => {
      return company_member_id
        ? await loaders.companyMembers.load(company_member_id)
        : null;
    },
    trackedTotal: ({ tracked_total }) => {
      return tracked_total ? tracked_total : null;
    },
    workedTotal: ({ worked_total }) => {
      return worked_total ? worked_total : null;
    },
    regularTotal: ({ regular_total }) => {
      return regular_total ? regular_total : null;
    },
    overtimeTotal: ({ overtime_total }) => {
      return overtime_total ? overtime_total : null;
    },
    //DEPRECATED
    company_member: async ({ company_member_id }, args, { loaders }) => {
      return company_member_id
        ? await loaders.companyMembers.load(company_member_id)
        : null;
    },
  },
  AttendanceSettings: {
    allowMobile: ({ allow_mobile }) => {
      return allow_mobile ? allow_mobile : null;
    },
    allowWeb: ({ allow_web }) => {
      return allow_web ? allow_web : null;
    },
    requireVerification: ({ require_verification }) => {
      return require_verification ? require_verification : null;
    },
    requireLocation: ({ require_location }) => {
      return require_location ? require_location : null;
    },
    enable2d: ({ enable2d }) => {
      return enable2d ? enable2d : null;
    },
    enableBiometric: ({ enable_biometric }) => {
      return enable_biometric ? enable_biometric : null;
    },
  },
  Query: {
    memberLastOut: async (
      root,
      { companyMemberId },
      { loaders, auth: { user } },
    ) => {
      try {
        if (!user) {
          throw new Error('Missing user');
        }

        const member = (await loaders.companyMembers.load(
          companyMemberId,
        )) as CompanyMemberModel;
        if (!member) {
          throw new UserInputError('Member does not exist');
        }

        const { company_id } = member;
        const isValid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company_id,
        });

        if (!isValid) {
          throw new AuthenticationError('User not in company');
        }

        const res = await AttendanceService.getMemberLastOut({
          memberId: member.id,
        });

        return res;
      } catch (error) {
        handleResolverError(error);
        return null;
      }
    },

    getVerificationImageUploadUrl: async (
      root,
      { companyId },
      { loaders, auth: { user } },
    ) => {
      try {
        if (!user) {
          throw new Error('Missing user');
        }

        const company = await loaders.companies.load(companyId);

        const valid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });
        if (!valid) {
          throw new AuthenticationError('User not in company');
        }

        const res = await AttendanceService.getVerificationImageUploadUrl(
          companyId,
        );
        return res;
      } catch (error) {
        throw new Error((error as Error).message);
      }
    },

    attendances: async (root, { input }, { loaders, auth: { user } }) => {
      try {
        const { company_member_id, company_id, from_date, to_date } = input;
        const {
          companyMemberId: cmid,
          companyId: cid,
          fromDate: fm,
          toDate: td,
          contactId,
        } = input;

        const companyId = company_id || cid;
        const companyMemberId = company_member_id || cmid;
        const fromDate = from_date || (fm as string);
        const toDate = to_date || (td as string);

        let companyPrivateId;
        if (companyId) {
          const company = await getCompany(companyId);
          companyPrivateId = company.id;
        }
        let contactPrivateId;
        if (contactId) {
          const contact = await getContact(contactId);
          contactPrivateId = contact?.id;
        }

        let member;
        if (companyMemberId) {
          member = await getCompanyMember(companyMemberId);
          if (!member) {
            throw new UserInputError('That company member does not exist');
          }
          // FIXME: I think this is not comprehensive and possibly wrong, need to fix during RBAC stage
          if (member.company_id !== companyPrivateId) {
            throw new AuthenticationError(
              'User does not have access to view this company member',
            );
          }
        }

        const isValid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: companyPrivateId as CompanyId,
        });

        if (!isValid) {
          throw new AuthenticationError('User not in company');
        }

        const res = (await AttendanceService.getAttendances({
          companyId: companyPrivateId,
          contactId: contactPrivateId,
          fromDate,
          toDate,
          ...(member && companyMemberId && { companyMemberId: member.id }),
        })) as AttendanceModel[];

        return res;
      } catch (error) {
        handleResolverError(error);
        return [];
      }
    },

    attendanceLabels: async (
      root,
      { companyId },
      { loaders, auth: { user } },
    ) => {
      try {
        const company = await loaders.companies.load(companyId);
        if (!company) {
          throw new UserInputError('Company does not exist');
        }

        const isValid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isValid) {
          throw new AuthenticationError('User not in company');
        }

        const res = (await AttendanceService.getAttendanceLabels({
          companyId: company.id,
        })) as AttendanceLabelModel[];
        return res;
      } catch (error) {
        handleResolverError(error);
        return [];
      }
    },

    attendanceSettings: async (
      root,
      { companyId },
      { loaders, auth: { user } },
    ) => {
      try {
        const company = await loaders.companies.load(companyId);
        if (!company) {
          throw new UserInputError('Company does not exist');
        }

        const isValid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isValid) {
          throw new AuthenticationError('User not in company');
        }

        const res = (await AttendanceService.getAttendanceSettings({
          companyId: company.id,
        })) as AttendanceSettingsModel;
        return res;
      } catch (error) {
        handleResolverError(error);
        return null;
      }
    },

    // @ts-ignore
    getServerTime: async (root, args, context) => {
      try {
        // NOTE: For now, until timezone settings are available
        return dayjs().toISOString();
      } catch (error) {
        handleResolverError(error);
      }
    },
    // @ts-ignore
    attendanceDaySummary: async (
      root,
      { companyId, input },
      { loaders, auth: { user } },
    ) => {
      try {
        let memberPrivateId;
        if (input?.companyMemberId) {
          const member = (await loaders.companyMembers.load(
            input?.companyMemberId,
          )) as CompanyMemberModel;

          if (!member) {
            throw new UserInputError('Member does not exist');
          }

          memberPrivateId = member.id;
        }

        const company = await loaders.companies.load(companyId);
        if (!company) {
          throw new UserInputError('Company does not exist');
        }

        const isValid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isValid) {
          throw new AuthenticationError('User not in member company');
        }

        const totals = (await AttendanceService.getDaySummary({
          memberId: memberPrivateId,
          day: input.day,
          month: input.month,
          year: input.year,
          companyId: company?.id,
        })) as AttendanceDailySummaryModel[];

        if (totals?.length === 0) {
          const companyMembers = (await CompanyService.getCompanyMembers(
            company?.id,
          )) as CompanyMemberModel[];

          const attendances = await Promise.all(
            _.map(companyMembers, async (cm) => {
              const openAttendances =
                (await AttendanceService.getOpenAttendances(
                  cm?.id,
                )) as AttendanceModel[];
              return _.head(openAttendances);
            }),
          );

          const ongoingTotals = await Promise.all(
            _.map(attendances, (at) => {
              if (at) {
                return {
                  company_member_id: at?.company_member_id,
                  generated_at: dayjs().toDate().toDateString(),
                };
              }
            }),
          );

          return ongoingTotals;
        }

        return totals;
      } catch (error) {
        handleResolverError(error);
      }
    },
    // @ts-ignore
    attendanceWeekSummary: async (
      root,
      { companyId, input },
      { loaders, auth: { user } },
    ) => {
      try {
        let memberPrivateId;
        if (input?.companyMemberId) {
          const member = (await loaders.companyMembers.load(
            input?.companyMemberId,
          )) as CompanyMemberModel;

          if (!member) {
            throw new UserInputError('Member does not exist');
          }

          memberPrivateId = member.id;
        }

        const company = await loaders.companies.load(companyId);
        if (!company) {
          throw new UserInputError('Company does not exist');
        }

        const isValid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isValid) {
          throw new AuthenticationError('User not in member company');
        }

        // const res = await AttendanceService.({
        //   labelId: label.id,
        //   archived,
        // });

        const totals = (await AttendanceService.getWeeklySummaries({
          memberId: memberPrivateId,
          week: input.week,
          month: input.month,
          year: input.year,
          companyId: company.id,
        })) as AttendanceWeeklySummaryModel[];

        return totals;
      } catch (error) {
        handleResolverError(error);
      }
    },

    // @ts-ignore
    attendanceMonthSummary: async (
      root,
      { companyId, input },
      { loaders, auth: { user } },
    ) => {
      try {
        const { week, month, year } = input;
        let memberPrivateId;
        if (input?.companyMemberId) {
          const member = (await loaders.companyMembers.load(
            input?.companyMemberId,
          )) as CompanyMemberModel;

          if (!member) {
            throw new UserInputError('Member does not exist');
          }

          memberPrivateId = member.id;
        }

        const company = await loaders.companies.load(companyId);
        if (!company) {
          throw new UserInputError('Company does not exist');
        }

        const isValid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isValid) {
          throw new AuthenticationError('User not in member company');
        }

        const totals = (await AttendanceService.getMonthlySummary({
          companyMemberId: memberPrivateId,
          query: {
            week: week as number[],
            month,
            year,
          },
          companyId: company.id,
        })) as AttendanceMonthlySummaryModel[];

        return totals;
      } catch (error) {
        handleResolverError(error);
      }
    },

    // @ts-ignore
    attendanceWeeklyForMonthSummary: async (
      root,
      { companyId, input },
      { loaders, auth: { user } },
    ) => {
      try {
        const { week, month, year } = input;
        let memberPrivateId;
        if (input?.companyMemberId) {
          const member = (await loaders.companyMembers.load(
            input?.companyMemberId,
          )) as CompanyMemberModel;

          if (!member) {
            throw new UserInputError('Member does not exist');
          }

          memberPrivateId = member.id;
        }

        const company = await loaders.companies.load(companyId);
        if (!company) {
          throw new UserInputError('Company does not exist');
        }

        const isValid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isValid) {
          throw new AuthenticationError('User not in member company');
        }

        const totals = (await AttendanceService.getWeeklySummariesForMonth({
          companyMemberId: memberPrivateId,
          query: {
            week_numbers: week as number[],
            month,
            year,
          },
          companyId: company.id,
        })) as AttendanceWeeklySummaryModel[];

        return totals;
      } catch (error) {
        handleResolverError(error);
      }
    },

    //@ts-ignore
    attendanceMemberStats: async (
      root,
      { memberId },
      { loaders, auth: { user } },
    ) => {
      try {
        const member = (await loaders.companyMembers.load(
          memberId,
        )) as CompanyMemberModel;

        if (_.isEmpty(member)) {
          throw new UserInputError('Member does not exist');
        }

        const res = await AttendanceService.getMemberAttendanceStats(member.id);

        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },

    currentAttendance: async (root, { memberId }) => {
      const member = await getCompanyMember(memberId);
      const openAttendances = (await AttendanceService.getOpenAttendances(
        member?.id,
      )) as AttendanceModel[];

      return _.head(openAttendances);
    },
    attendanceDaySummaries: async (
      root,
      { selectedDate, companyMemberId, companyId },
    ) => {
      let privateMemberId;
      if (companyMemberId) {
        const member = (await getCompanyMember(
          companyMemberId,
        )) as CompanyMemberModel;
        privateMemberId = member?.id;
      }

      const company = await getCompany(companyId);

      const res = await AttendanceService.getAttendanceDaySummaries({
        selectedDate,
        companyMemberId: privateMemberId,
        companyId: company?.id,
      });
      return res;
    },
  },

  Mutation: {
    startAttendanceEntry: async (
      root,
      { companyMemberId, locationId, labelId, contactId, input },
      { loaders, auth: { user } },
    ) => {
      try {
        const {
          type,
          comments,
          lat,
          lng,
          address,
          tagIds,

          verificationType: vt,
          s3Bucket: s3b,
          s3Key: s3k,
          imageUrl: iurl,

          verification_type,
          s3_bucket,
          s3_key,
          image_url,
        } = input;

        const s3Bucket = s3b || s3_bucket;
        const s3Key = s3k || s3_key;
        const imageUrl = iurl || image_url;
        const verificationType = vt || verification_type;
        const member = (await loaders.companyMembers.load(
          companyMemberId,
        )) as CompanyMemberModel;

        if (!member) {
          throw new UserInputError('Member does not exist');
        }
        let location;
        if (locationId) {
          location = (await loaders.locations.load(
            locationId,
          )) as LocationModel;
          if (!location) {
            throw new UserInputError('That location does not exist');
          }
        }

        let label;
        if (labelId) {
          label = (await loaders.attendanceLabels.load(
            labelId,
          )) as AttendanceLabelModel;
          if (!label) {
            throw new UserInputError('That label does not exist');
          }
        }

        let contact;
        if (contactId) {
          contact = (await loaders.contacts.load(contactId)) as ContactModel;
          if (!contact) {
            throw new UserInputError('That contact does not exist');
          }
        }

        const payload = {
          type,
          ...(comments && { comments }),
          ...(lat && { lat }),
          ...(lng && { lng }),
          ...(address && { address }),
          ...(verificationType && { verification_type: verificationType }),
          ...(s3Bucket && { s3_bucket: s3Bucket }),
          ...(s3Key && { s3_key: s3Key }),
          ...(imageUrl && { image_url: imageUrl }),
        };
        const tags = tagIds
          ? ((await loaders.tags.loadMany(input?.tagIds)) as TagModel[])
          : undefined;
        if (input?.tagIds) {
          delete payload.tagIds;
        }

        const res = await AttendanceService.startAttendanceEntry({
          companyMemberId: member.id,
          ...(location && { locationId: location.id }),
          ...(label && { labelId: label.id }),
          ...(contact && { contactId: contact.id }),
          input: payload,
          tags,
          user,
        });
        return res;
      } catch (error) {
        handleResolverError(error);
        return [];
      }
    },

    closeAttendance: async (
      root,
      { companyMemberId, commentsOut },
      { loaders, auth: { user } },
    ) => {
      try {
        const member = (await loaders.companyMembers.load(
          companyMemberId,
        )) as CompanyMemberModel;

        if (!member) {
          throw new UserInputError('Member does not exist');
        }

        const res = await AttendanceService.closeAttendance({
          companyMemberId: member.id,
          ...(commentsOut && { commentsOut }),
          targetUser: user,
          initiatingUser: user,
        });
        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },

    closeAttendanceForUser: async (
      root,
      { companyMemberId, commentsOut },
      { loaders, auth: { user } },
    ) => {
      try {
        const member = (await loaders.companyMembers.load(
          companyMemberId,
        )) as CompanyMemberModel;

        if (!member) {
          throw new UserInputError('Member does not exist.');
        }

        const memberUser = await UserStore.getUserById(member.userId);

        const clockOutRepresentativeMember =
          (await CompanyService.getMemberByUserIdAndCompanyId({
            companyId: member?.company_id,
            userId: user?.id,
          })) as CompanyMemberModel;

        if (clockOutRepresentativeMember?.type === 3) {
          throw new UserInputError(
            'Member not authorized to clock out for other members.',
          );
        }

        const res = await AttendanceService.closeAttendance({
          companyMemberId: member.id,
          ...(commentsOut && { commentsOut }),
          targetUser: memberUser,
          initiatingUser: user,
        });
        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },

    createAttendanceLabel: async (
      root,
      { companyId, input },
      { loaders, auth: { user } },
    ) => {
      try {
        const company = (await loaders.companies.load(
          companyId,
        )) as CompanyMemberModel;

        if (!company) {
          throw new UserInputError('Company does not exist');
        }

        const isValid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isValid) {
          throw new AuthenticationError('User not in company');
        }

        const res = await AttendanceService.createAttendanceLabel({
          companyId: company.id,
          name: input.name,
          ...(input.color && { color: input.color }),
          ...(input.description && { description: input.description }),
        });

        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },

    updateAttendanceLabel: async (
      root,
      { labelId, input },
      { loaders, auth: { user } },
    ) => {
      try {
        const label = (await loaders.attendanceLabels.load(
          labelId,
        )) as AttendanceLabelModel;
        if (!label) {
          throw new UserInputError('That label does not exist');
        }

        const company = await loaders.companies.load(label.company_id);
        if (!company) {
          throw new UserInputError('Company does not exist');
        }

        const isValid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isValid) {
          throw new AuthenticationError('User not in company');
        }

        const res = await AttendanceService.updateAttendanceLabel({
          labelId: label.id,
          name: input.name,
          ...(input.color && { color: input.color }),
          ...(input.description && { description: input.description }),
        });

        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },

    archiveAttendanceLabel: async (
      root,
      { labelId, archived },
      { loaders, auth: { user } },
    ) => {
      try {
        const label = (await loaders.attendanceLabels.load(
          labelId,
        )) as AttendanceLabelModel;
        if (!label) {
          throw new UserInputError('That label does not exist');
        }

        const company = await loaders.companies.load(label.company_id);
        if (!company) {
          throw new UserInputError('Company does not exist');
        }

        const isValid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isValid) {
          throw new AuthenticationError('User not in company');
        }

        const res = await AttendanceService.archiveAttendanceLabel({
          labelId: label.id,
          archived,
        });

        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },

    updateAttendanceSettings: async (
      root,
      { companyId, input },
      { loaders, auth: { user } },
    ) => {
      try {
        const {
          allowMobile: am,
          allowWeb: aw,
          requireVerification: rv,
          requireLocation: rl,
          enable2d: e2d,
          enableBiometric: eb,

          allow_mobile,
          allow_web,
          require_verification,
          require_location,
          enable_2d,
          enable_biometric,
        } = input;
        const allowMobile = am || allow_mobile;
        const allowWeb = aw || allow_web;
        const requireVerification = rv || require_verification;
        const requireLocation = rl || require_location;
        const enable2d = e2d || enable_2d;
        const enableBiometric = eb || enable_biometric;
        const company = (await loaders.companies.load(
          companyId,
        )) as CompanyMemberModel;

        if (!company) {
          throw new UserInputError('Company does not exist');
        }

        const isValid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isValid) {
          throw new AuthenticationError('User not in company');
        }

        const res = await AttendanceService.updateAttendanceSettings({
          companyId: company.id,
          payload: {
            allow_mobile: allowMobile ? 1 : 0,
            allow_web: allowWeb ? 1 : 0,
            require_verification: requireVerification ? 1 : 0,
            require_location: requireLocation ? 1 : 0,
            enable_2d: enable2d ? 1 : 0,
            enable_biometric: enableBiometric ? 1 : 0,
          },
        });

        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },

    setAttendanceVerificationImage: async (
      root,
      { companyMemberId, attendanceId, input },
      { loaders, auth: { user } },
    ) => {
      try {
        const { s3Bucket, s3Key, imageUrl } = input;
        const companyMember = await getCompanyMember(companyMemberId);
        const attendance = await getAttendance(attendanceId);
        const res = await AttendanceService.setAttendanceVerificationImage({
          s3Bucket,
          s3Key,
          s3ImageUrl: imageUrl,
          companyMemberId: companyMember.id,
          attendanceId: attendance.id,
        });

        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },
  },
};
