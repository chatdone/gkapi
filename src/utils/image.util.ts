export const getImageSizes = ({
  originalPath,
  ext,
}: {
  originalPath: string;
  ext: string;
}): string[] => {
  const IMAGE_SIZES = [32, 64, 128];
  const filenameWithExt = originalPath?.split('/').slice(-1)[0];
  const filename = filenameWithExt?.split('.')[0];
  const imageSizesWithPath = IMAGE_SIZES.map((size) => {
    const filenameWithSize = `${filename}_${size}${ext}`;
    const pathSize = `${originalPath.replace(
      filenameWithExt,
      filenameWithSize,
    )}`;
    return pathSize;
  });
  return imageSizesWithPath;
};
