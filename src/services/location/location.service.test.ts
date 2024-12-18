import { LocationStore } from '@data-access';
import { CompanyMemberModel } from '@models/company.model';
import { LocationModel } from '@models/location.model';
import { CompanyService, LocationService } from '@services';
import fixtures from '@test/fixtures';

jest.mock('../../data-access/location/location.store');
jest.mock('../company/company.service');
jest.mock('../user/user.service');
jest.mock('knex');

describe('location.service.ts', () => {
  describe('createLocation', () => {
    const companyMembers = fixtures.generate('companyMember', 3);
    const user = fixtures.generate('user');
    const mockLocation = fixtures.generate('location');

    test('it should create and return location', async () => {
      const updatedMembers = companyMembers.map((cm: CompanyMemberModel) => {
        return { ...cm, type: 1 };
      });

      let selectedMember = updatedMembers[0];
      selectedMember = { ...selectedMember, user_id: 1 };
      (CompanyService.getCompanyMembers as jest.Mock).mockResolvedValue(
        updatedMembers,
      );

      (LocationStore.createLocation as jest.Mock).mockResolvedValue(
        mockLocation,
      );

      const res = await LocationService.createLocation({
        user: { ...user, id: 1 },
        companyId: selectedMember.company_id,
        payload: { name: mockLocation?.name },
      });

      expect(CompanyService.getCompanyMembers).toBeCalledWith(
        selectedMember.company_id,
      );

      expect(LocationStore.createLocation).toBeCalledWith({
        userId: 1,
        companyId: selectedMember.company_id,
        payload: { name: mockLocation?.name },
      });

      expect(res).toEqual(mockLocation);

      jest.restoreAllMocks();
    });

    test('it should reject non admins or managers', async () => {
      const updatedMembers = companyMembers.map((cm: CompanyMemberModel) => {
        return { ...cm, type: 3 };
      });

      const selectedMember = updatedMembers[0];
      (CompanyService.getCompanyMembers as jest.Mock).mockResolvedValue(
        updatedMembers,
      );

      try {
        await LocationService.createLocation({
          user: { ...user, id: 1 },
          companyId: selectedMember.company_id,
          payload: { name: mockLocation?.name },
        });
      } catch (error) {
        const err = error as Error;
        expect(err.message).toBe('user not an admin or manager');
      }

      expect(CompanyService.getCompanyMembers).toBeCalledWith(
        selectedMember.company_id,
      );

      jest.restoreAllMocks();
    });
  });

  describe('updateLocation', () => {
    test('it should update and return location', async () => {
      const mockLocation = fixtures.generate('location');
      (LocationStore.updateLocation as jest.Mock).mockResolvedValue({
        ...mockLocation,
        name: 'dingleberry',
      });

      const res = await LocationService.updateLocation({
        locationId: 1,
        payload: { name: 'dingleberry' },
        userId: 1,
      });

      expect(LocationStore.updateLocation).toBeCalledWith({
        locationId: 1,
        payload: { name: 'dingleberry' },
        userId: 1,
      });

      expect(res).toEqual({ ...mockLocation, name: 'dingleberry' });

      jest.restoreAllMocks();
    });
  });

  describe('deleteLocations', () => {
    test('it should delete and return locations ids', async () => {
      const mockLocations = fixtures.generate('location', 3);

      const mockLocationIds = mockLocations.map((ml: LocationModel) => ml.id);

      (LocationStore.deleteLocations as jest.Mock).mockResolvedValue(
        mockLocationIds,
      );
      const res = await LocationService.deleteLocations(mockLocations);

      expect(LocationStore.deleteLocations).toBeCalledWith(mockLocationIds);
      expect(res).toEqual(mockLocationIds);
      jest.restoreAllMocks();
    });
  });
});
