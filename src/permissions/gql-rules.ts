// import { rule, and, or, not } from 'graphql-shield';
// import _ from 'lodash';

// /* Checks if the requesting user is a member of the company info being
//  * requested, and if not only allow admins to make this request */
// export const adminRequestCheck = rule()(
//   async (parent: any, args, { auth: { authPayload, user } }) => {
//     const matchingUserCompanies = !!_.find(
//       user.companyUuids,
//       (e) => e === user.activeCompany,
//     );

//     if (matchingUserCompanies) {
//       return true;
//     } else {
//       const apiRoles = authPayload['https://api.gokudos.io/roles'];

//       const hasAdminRole = !!_.find(apiRoles, (e) => 'AdminPanelUser');

//       return hasAdminRole;
//     }
//   },
// );
