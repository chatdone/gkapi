import { getImageSizes } from './image.util';

describe('image.util.ts', () => {
  describe('getImageSizes', () => {
    test('it should return an array with three links', async () => {
      const originalPath =
        'your-bucket-name/your-folder-name/your-file-name.jpg';

      const ext = '.jpg';
      const result = getImageSizes({ originalPath, ext });
      expect(result).toEqual(
        expect.arrayContaining([
          'your-bucket-name/your-folder-name/your-file-name_32.jpg',
          'your-bucket-name/your-folder-name/your-file-name_64.jpg',
          'your-bucket-name/your-folder-name/your-file-name_128.jpg',
        ]),
      );
    });
  });
});
