import { TableNames } from '@db-tables';
import knex from '@db/knex';
import { CompanyWorkDaySettingModel } from '@models/company.model';
import { CompanyMemberNotifyEventManagerModel } from '@models/event-manager.model';
import { UserModel } from '@models/user.model';

const getMembersRemindWorkingHours = async ({
  currentDay,
  isAfter,
  isEndHour,
  minutes,
}: {
  currentDay: number;
  isAfter?: boolean;
  isEndHour?: boolean;
  minutes: number;
}): Promise<(CompanyMemberNotifyEventManagerModel | Error)[]> => {
  try {
    const res = await knex
      .from<CompanyWorkDaySettingModel>({ wh: TableNames.WORK_HOURS })
      .leftJoin({ cm: 'company_members' }, 'cm.company_id', 'wh.company_id')
      .leftJoin<UserModel>({ u: 'users' }, 'u.id', 'cm.user_id')
      .where({ 'wh.day': currentDay })
      .whereRaw('cm.employee_type = wh.employee_type_id')
      .whereRaw('wh.open = 1')
      .whereRaw(
        `${isAfter ? 'ADD' : 'SUB'}TIME(TIME_FORMAT(CONVERT_TZ(wh.${
          isEndHour ? 'end_hour' : 'start_hour'
        }, '+8:00', '+0:00'), '%H:%i:00'), ${minutes}) = TIME_FORMAT(NOW(), '%H:%i:00')`,
      )

      .groupBy('cm.id')
      .select('cm.*', 'u.name as name');

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

export default { getMembersRemindWorkingHours };
