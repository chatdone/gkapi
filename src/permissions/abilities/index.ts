import {
  AbilityBuilder,
  PureAbility,
  AbilityTuple,
  MatchConditions,
  AbilityClass,
} from '@casl/ability';
import { CompanyMemberModel } from '@models/company.model';
import { UserModel } from '@models/user.model';
import { CompanyService } from '@services';

import companyAbilities from './company.ability';

export type DefinePermissions = (
  user: UserModel,
  builder: AbilityBuilder<AppAbility>,
) => void;
type Role = 'anon' | 'member' | 'manager' | 'admin' | 'superadmin';

export type AppAbility = PureAbility<AbilityTuple, MatchConditions>;
const AppAbility = PureAbility as AbilityClass<AppAbility>;
const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;

const roleTypes: Role[] = ['anon', 'member', 'manager', 'admin', 'superadmin'];

const rolePermissions: Record<Role, DefinePermissions | null> =
  roleTypes.reduce(
    (accumulator, value) => {
      return {
        ...accumulator,
        [value]: (user: UserModel, builder: AbilityBuilder<AppAbility>) => {
          companyAbilities[value](user, builder);
        },
      };
    },
    { anon: null, member: null, manager: null, admin: null, superadmin: null },
  );

export const defineAbilityFor = async (
  user: UserModel,
): Promise<AppAbility> => {
  const builder = new AbilityBuilder(AppAbility);

  let userRole: Role = 'anon';
  if (user.activeCompany) {
    // TODO: Note to self: Cache this asap oh gosh
    const member = (await CompanyService.getMemberByUserIdAndCompanyId({
      companyId: user.activeCompany,
      userId: user.id,
    })) as CompanyMemberModel;

    const roleMapping: { [key: number]: Role } = {
      1: 'admin',
      2: 'manager',
      3: 'member',
      999: 'superadmin',
    };

    userRole = roleMapping[member.type] || 'anon';
  }

  if (rolePermissions[userRole]) {
    rolePermissions[userRole]!(user, builder);
  } else {
    throw new Error(`Trying to use unknown role "${userRole}"`);
  }

  return builder.build({ conditionsMatcher: lambdaMatcher });
};
