import { HolidayStore } from '@data-access';
import {
  HOLIDAY_STATUS,
  HOLIDAY_TYPE,
} from '@data-access/holiday/holiday.store';
import { CompanyHolidayModel, HolidayModel } from '@models/holiday.model';
import { HolidayService } from '@services';
import fixtures from '../../jest/fixtures';

jest.mock('@data-access/holiday/holiday.store');

describe('holiday.service', () => {
  test('it should create holiday and return it', async () => {
    const mockHoliday = fixtures.generate('holiday');
    (HolidayStore.createHoliday as jest.Mock).mockResolvedValue(mockHoliday);
    const res = await HolidayService.createHoliday({
      userId: 1,
      companyId: 1,
      payload: {
        name: mockHoliday?.name,
        start_date: mockHoliday?.start_date,
        end_date: mockHoliday?.end_date,
      },
    });

    expect(HolidayStore.createHoliday).toBeCalledWith({
      userId: 1,
      companyId: 1,
      payload: {
        name: mockHoliday?.name,
        description: mockHoliday?.description,
        start_date: mockHoliday?.start_date,
        end_date: mockHoliday?.end_date,
      },
    });

    expect(res).toEqual(mockHoliday);
    jest.resetAllMocks();
  });
  test('it should return all company and public holidays', async () => {
    const mockHoliday = fixtures.generate('holiday');
    (HolidayStore.getHolidays as jest.Mock).mockResolvedValue(mockHoliday);

    const res = await HolidayService.getHolidays({ companyId: 35, year: 2021 });
    expect(HolidayStore.getHolidays).toBeCalledWith({
      companyId: 35,
      year: 2021,
    });
    expect(res).toEqual(mockHoliday);
    jest.resetAllMocks();
  });
  test('it should deactivate selected public holiday for the selected company', async () => {
    const mockPublicHoliday = fixtures.generate('publicHoliday');
    const mockCompanyHoliday = fixtures.generate('companyHoliday');
    const mockDataPassedToStore = {
      name: mockPublicHoliday.name,
      active: HOLIDAY_STATUS.INACTIVE,
      start_date: mockPublicHoliday.start_date,
      end_date: mockPublicHoliday.end_date,
      type: HOLIDAY_TYPE.PUBLIC,
      company_id: 3,
      public_holiday_id: mockPublicHoliday.id,
      created_by: 12,
      updated_by: 12,
    } as CompanyHolidayModel;

    const mockDateReturnedFromStore = {
      ...mockCompanyHoliday,
      name: mockPublicHoliday.name,
      active: HOLIDAY_STATUS.INACTIVE,
      start_date: mockPublicHoliday.start_date,
      end_date: mockPublicHoliday.end_date,
      type: HOLIDAY_TYPE.PUBLIC,
      company_id: 3,
      public_holiday_id: mockPublicHoliday.id,
      created_by: 12,
      updated_by: 12,
    } as CompanyHolidayModel;

    (HolidayStore.deactivatePublicHoliday as jest.Mock).mockResolvedValue(
      mockDateReturnedFromStore,
    );
    const res = await HolidayService.deactivatePublicHoliday({
      companyId: 3,
      userId: 12,
      payload: { ...mockPublicHoliday },
    });
    expect(HolidayStore.deactivatePublicHoliday).toBeCalledWith({
      data: mockDataPassedToStore,
      companyId: 3,
      year: mockPublicHoliday.year,
    });
    expect(res).toEqual(mockDateReturnedFromStore);
    jest.resetAllMocks();
  });
  test('it should activate public holiday for selected company', async () => {
    const mockCompanyHoliday = fixtures.generate('companyHoliday');
    (HolidayStore.activatePublicHoliday as jest.Mock).mockResolvedValue(
      mockCompanyHoliday,
    );

    const res = await HolidayService.activatePublicHoliday({
      companyId: mockCompanyHoliday.company_id,
      companyHolidayId: mockCompanyHoliday.id,
    });

    expect(HolidayStore.activatePublicHoliday).toBeCalledWith({
      companyId: mockCompanyHoliday.company_id,
      companyHolidayId: mockCompanyHoliday.id,
    });
    expect(res).toEqual(mockCompanyHoliday);
    jest.resetAllMocks();
  });
  test('it should delete company holiday and return delete holiday', async () => {
    const mockCompanyHoliday = fixtures.generate('companyHoliday');
    (HolidayStore.deleteCompanyHoliday as jest.Mock).mockResolvedValue(
      mockCompanyHoliday,
    );

    const res = await HolidayService.deleteCompanyHoliday({
      companyId: mockCompanyHoliday.company_id,
      companyHolidayId: mockCompanyHoliday.id,
    });

    expect(HolidayStore.deleteCompanyHoliday).toBeCalledWith({
      companyId: mockCompanyHoliday.company_id,
      companyHolidayId: mockCompanyHoliday.id,
    });
    expect(res).toEqual(mockCompanyHoliday);
    jest.resetAllMocks();
  });
  test('it should update company holiday and return the updated data', async () => {
    const mockCompanyHoliday = fixtures.generate('companyHoliday');
    const payload = {
      name: 'HR Anniversary',
      start_date: new Date(),
      end_date: mockCompanyHoliday.end_date,
    };

    (HolidayStore.updateCompanyHoliday as jest.Mock).mockResolvedValue({
      ...mockCompanyHoliday,
      name: payload.name,
      start_date: payload.start_date,
    });

    const res = await HolidayService.updateCompanyHoliday({
      companyId: mockCompanyHoliday.company_id,
      companyHolidayId: mockCompanyHoliday.id,
      payload,
    });

    expect(HolidayStore.updateCompanyHoliday).toBeCalledWith({
      companyId: mockCompanyHoliday.company_id,
      companyHolidayId: mockCompanyHoliday.id,
      payload,
    });
    expect(res).toEqual({
      ...mockCompanyHoliday,
      name: payload.name,
      start_date: payload.start_date,
    });
    jest.resetAllMocks();
  });
});
