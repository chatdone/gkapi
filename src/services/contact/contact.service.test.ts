import { ContactStore } from '@data-access';
import fixtures from '../../jest/fixtures';
import { Readable } from 'stream';
import ContactService from './contact.service';
import { CompanyService } from '@services';

jest.mock('@data-access');
jest.mock('@services');
jest.mock('knex');
jest.mock('lodash');
// jest.mock('path');
jest.mock('csv-parser');
// jest.mock('fs');
jest.mock('@data-access/contact/utils');
jest.mock('@tools/logger');

jest.mock('@data-access/loaders', () => ({
  contacts: jest.fn(),
}));

const mockReadStream = jest.fn().mockImplementation(() => {
  const readable = new Readable();
  readable.push('hello');
  readable.push('world');
  readable.push(null);

  return readable;
});

const mockFile = jest.fn().mockImplementation(() => {
  return {
    createReadStream: mockReadStream,
  };
});

describe('contact.service.ts', () => {
  describe('createContact', () => {
    test('it should create a contact without a group id', async () => {
      const payload = {
        name: 'Shirakami Fubuki',
        type: 1,
        company_id: 123,
      };

      const mockCreateResponse = {
        id_text: 'abc123',
      };

      const mockUserId = 4;

      (ContactStore.createContact as jest.Mock).mockResolvedValue(
        mockCreateResponse,
      );

      const res = await ContactStore.createContact({
        payload,
        userId: mockUserId,
        dealCreatorId: undefined,
      });

      expect(ContactStore.createContact).toBeCalledWith({
        payload,
        userId: mockUserId,
      });

      const expectedResponse = mockCreateResponse;
      expect(res).toEqual(expectedResponse);
    });
  });

  describe('bulkUploadContacts', () => {
    const attachment = {
      createReadStream: mockFile,
      filename: 'ame.csv',
      mimetype: 'application/csv',
      encoding: '7-bit',
    };
    const companyMembers = fixtures.generate('companyMember', 3);
    const user = fixtures.generate('user');

    test('it should reject non csv files', async () => {
      try {
        (CompanyService.getCompanyMembers as jest.Mock).mockResolvedValue(
          companyMembers,
        );
        jest.spyOn(ContactService, 'processFileStream').mockResolvedValue(true);
        jest
          .spyOn(ContactService, 'createContactsFromParsed')
          .mockResolvedValue([]);
        jest
          .spyOn(ContactService, 'createContactPicsFromParsed')
          .mockResolvedValue([]);

        await ContactService.bulkUploadContacts({
          groupId: 1,
          attachment: { ...attachment, filename: 'ame.pdf' },
          user,
          companyId: 1,
        });
      } catch (error) {
        const err = error as Error;
        expect(err.message).toBe('file extension is not csv');
      }

      jest.restoreAllMocks();
    });
  });
});
