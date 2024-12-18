import { SHA3 } from 'sha3';

const createSha3HashFromFile = (file: Buffer): string => {
  const hash = new SHA3(256);

  hash.update(file);
  const hashedFile = hash.digest('hex');
  return hashedFile;
};

export { createSha3HashFromFile };
