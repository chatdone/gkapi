export const Base64EncodeUrl = (str: string): string => {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
};

export const Base64DecodeUrl = (str: string): string => {
  str = (str + '===').slice(0, str.length + (str.length % 4));
  return str.replace(/-/g, '+').replace(/_/g, '/');
};

export const base64Size = (base64String: string): number => {
  const buffer = Buffer.from(base64String, 'base64');
  const byteSize = buffer.length;
  const kiloByte = Math.round(byteSize / 1024);

  return kiloByte;
};
