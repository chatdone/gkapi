// this is maybe a temporary setup for assembling the initial permissions object
import * as companyPermissions from './company';

export default {
  admin: [...companyPermissions.admin],
  manager: [...companyPermissions.manager],
  member: [...companyPermissions.member],
};
