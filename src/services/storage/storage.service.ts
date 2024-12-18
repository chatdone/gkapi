import {
  PutObjectCommand,
  CopyObjectCommand,
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fromIni } from '@aws-sdk/credential-providers';
import { Readable } from 'stream';
import logger from '@tools/logger';
import axios from 'axios';
import { TaskAttachmentPayload } from '@models/task.model';

const credentials =
  process.env.GK_ENVIRONMENT === 'development'
    ? fromIni({ profile: 'gokudos' })
    : {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      };

const s3Client = new S3Client({
  region: 'ap-southeast-1',
  credentials,
});

const generatePresignedS3Url = async ({
  bucketName,
  filePath,
}: {
  bucketName: string;
  filePath: string;
}): Promise<string> => {
  const bucketParams = {
    Bucket: bucketName,
    Key: filePath,
  };
  try {
    const command = new PutObjectCommand(bucketParams);

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return signedUrl;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'storage',
        fnName: 'generatePresignedS3Url',
        bucketName,
        filePath,
      },
    });
    return Promise.reject(error);
  }
};

const copyS3File = async ({
  sourcePath,
  destinationBucket,
  destinationKey,
}: {
  sourcePath: string;
  destinationBucket: string;
  destinationKey: string;
}) => {
  try {
    const command = new CopyObjectCommand({
      Bucket: destinationBucket,
      CopySource: sourcePath,
      Key: destinationKey,
    });

    const res = await s3Client.send(command);
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const putObjectS3File = async ({
  configs,
}: {
  configs: {
    Bucket: string;
    destinationKey: string;
    Body: Readable | ReadableStream | Buffer;
    ACL?: string | null;
  };
}) => {
  try {
    const command = new PutObjectCommand({
      Bucket: configs.Bucket,
      Key: configs.destinationKey,
      Body: configs.Body,
      ACL: configs?.ACL || undefined,
    });

    const res = await s3Client.send(command);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'storage',
        fnName: 'putObjectS3File',
        configs,
      },
    });
    return Promise.reject(error);
  }
};

const getObjectS3File = async ({
  isPublicAccess,
  destinationPath,
}: {
  isPublicAccess: boolean;
  destinationPath: string;
}) => {
  try {
    const command = new GetObjectCommand({
      Bucket: isPublicAccess
        ? process.env.AWS_S3_BUCKET_PUBLIC
        : process.env.AWS_S3_BUCKET,
      Key: destinationPath,
    });

    const res = await s3Client.send(command);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'storage',
        fnName: 'headObjectS3',
        isPublicAccess,
        destinationPath,
      },
    });
    return Promise.reject(error);
  }
};

const headObjectS3 = async ({
  bucketName,
  destinationPath,
}: {
  bucketName: string;
  destinationPath: string;
}) => {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: destinationPath,
    });

    const res = await s3Client.send(command);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'storage',
        fnName: 'headObjectS3',
        bucketName,
        destinationPath,
      },
    });
    return Promise.reject(error);
  }
};

const isS3ObjectsExist = async ({
  bucketName,
  destinationPaths,
}: {
  bucketName: string;
  destinationPaths: string[];
}): Promise<boolean> => {
  let existsArr = [];
  for (let i = 0; i < destinationPaths.length; i++) {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: destinationPaths[i],
    });

    const res = await s3Client
      .send(command)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return err;
      });

    if (res?.$metadata.httpStatusCode === 200) {
      existsArr.push(true);
    } else {
      existsArr.push(false);
    }
  }

  const isObjectsExist = existsArr.every((item) => item === true);

  if (isObjectsExist) {
    return true;
  } else {
    return false;
  }
};

const generateResizedImages = async ({ body }: { body: unknown }) => {
  try {
    const api = axios.create({
      baseURL: process.env.IMAGE_RESIZER_API || '',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const stringifiedBody = JSON.stringify(body);

    await api
      .post('/', stringifiedBody)
      .then((response) => {
        console.log(response?.data);
      })
      .catch((err) => {
        logger.logError({
          error: err,
          payload: {
            service: 'storage',
            fnName: 'generateResizedImages',
            stringifiedBody,
            apiFail: true,
          },
        });
      });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'storage',
        fnName: 'generateResizedImages',
        body,
      },
    });
  }
};

const getFileSize = async (input: TaskAttachmentPayload) => {
  try {
    const { createReadStream, filename, mimetype, encoding } = await input; //Do not remove await
    const stream = createReadStream();
    const fileSize = await new Promise((resolve, reject) => {
      stream.on('data', (chunk) => {
        resolve(chunk.length);
      });
    });
    return fileSize as number;
  } catch (error) {
    return Promise.reject(error);
  }
};

const exportFunctions = {
  generatePresignedS3Url,
  copyS3File,
  putObjectS3File,
  getObjectS3File,
  headObjectS3,
  isS3ObjectsExist,
  generateResizedImages,
  getFileSize,
};

export default exportFunctions;
