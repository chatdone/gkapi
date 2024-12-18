import { AbilityBuilder } from '@casl/ability';
import { UserModel } from '@models/user.model';
import { AppAbility } from '.';

const anon = (user: UserModel, { can }: AbilityBuilder<AppAbility>) => {};

const member = (user: UserModel, { can }: AbilityBuilder<AppAbility>) => {
  can('update', 'Company', (company) => {
    console.log('got member');
    return true;
  });
};

const manager = (user: UserModel, { can }: AbilityBuilder<AppAbility>) => {};

const admin = (user: UserModel, { can }: AbilityBuilder<AppAbility>) => {};

const superadmin = (user: UserModel, { can }: AbilityBuilder<AppAbility>) => {};

export default { anon, member, manager, admin, superadmin };
