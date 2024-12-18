import { ReadStream } from 'fs';
import csv from 'csv-parser';

export const processFileStream = (readStream: ReadStream): Promise<any> => {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    const parseResults = [];
    const csvOptions = {
      mapHeaders: ({ header, index }: { header: string; index: number }) =>
        header.toLowerCase().replace(' ', '_'),
    };
    readStream
      .pipe(csv(csvOptions))
      .on('data', (data) => parseResults.push(data))
      .on('end', () => {
        //@ts-ignore
        resolve(parseResults);
      });
  });
};
