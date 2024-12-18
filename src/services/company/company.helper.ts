import { companyMemberTypes } from '@data-access/company/company.store';

export const getMemberTypeFromString = (role: string): number => {
  try {
    if (!role) {
      return companyMemberTypes.MEMBER;
    }

    const roleType = role.toLowerCase();

    if (roleType.includes('admin')) {
      return companyMemberTypes.ADMIN;
    } else if (roleType.includes('manager')) {
      return companyMemberTypes.MANAGER;
    } else {
      return companyMemberTypes.MEMBER;
    }
  } catch (error) {
    return companyMemberTypes.MEMBER;
  }
};
