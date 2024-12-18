import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { createSha3HashFromFile } from './sha3';
import { AttachmentPayload, ErrorS3 } from '@models/common.model';
import { ReadStream } from 'fs';
import { CompanyId, CompanyMemberId } from '@models/company.model';
import { AttendanceStore, CompanyStore } from '@data-access';
import { AttendanceId } from '@models/attendance.model';
import { CompanyService, StorageService } from '@services';

dotenv.config();

export interface S3OjectResponse {
  AcceptRanges: string | undefined;
  LastModified: Date | undefined;
  ContentLength: number | undefined;
  ETag: string;
  ContentType: string | undefined;
  Metadata: {};
  Body: Buffer;
}

export interface AfterUpload {
  success: boolean;
  message: string;
  type: string;
  name: string;
  url: string;
  path: string;
  encoding: string;
  file_size: number;
  hash_result: string;
  bufferFile?: Buffer;
}

const processUploadToS3 = async ({
  attachment,
  s3Directory,
  isPublicAccess,
  companyId,
}: {
  attachment: AttachmentPayload;
  s3Directory: string;
  isPublicAccess: boolean;
  companyId?: CompanyId;
}): Promise<AfterUpload | ErrorS3> => {
  try {
    const { createReadStream, filename, mimetype, encoding } = await attachment; //Do not remove await

    const stream = createReadStream();
    const extension = path.extname(filename);

    const streamResult = (await processStream(stream)) as {
      size: number;
      hashedResult: string;
      bufferData: Buffer;
    };

    const { size, hashedResult } = streamResult;

    if (companyId) {
      await CompanyService.validateUploadRequest({ companyId, fileSize: size });
    }

    const destinationKey = `${s3Directory}${uuid()}${extension}`;

    const configs = {
      Bucket: isPublicAccess ? 'gokudos-dev-public' : 'gokudos-dev',
      ACL: isPublicAccess ? 'public-read' : null,
      destinationKey: destinationKey,
      Body: streamResult?.bufferData,
    };

    const upload = await StorageService.putObjectS3File({
      configs,
    });

    if (upload.$metadata.httpStatusCode === 200) {
      const url = `https://${configs.Bucket}.s3.ap-southeast-1.amazonaws.com/${destinationKey}`;

      const attachmentInfo = {
        success: true,
        message: 'Success',
        path: destinationKey,
        type: mimetype,
        name: filename,
        url,
        encoding: encoding,
        file_size: size,
        hash_result: hashedResult,
        bufferFile: streamResult.bufferData,
      };

      return attachmentInfo;
    } else {
      throw new Error('Error uploading file');
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const uploadBase64PdfToS3 = async ({
  fileBuffer,
  bucket,
  key,
}: {
  fileBuffer: string;
  bucket: string;
  key: string;
}) => {
  try {
    const uploadParams = {
      Bucket: bucket,
      destinationKey: key,
      Body: Buffer.from(fileBuffer, 'base64'),
      ContentType: 'application/pdf',
    };

    const response = await StorageService.putObjectS3File({
      configs: uploadParams,
    });
    return response;
  } catch (err) {
    return Promise.reject(err);
  }
};

const processStream = async (
  stream: ReadStream,
): Promise<{ size: number; hashedResult: string; bufferData: Buffer }> => {
  return new Promise((resolve, reject) => {
    let chunkedBufferData: Buffer[] = [];

    stream.on('data', function (data: Buffer) {
      chunkedBufferData.push(data as Buffer);
    });

    stream.on('end', () => {
      const combinedBufferData = Buffer.concat(chunkedBufferData);
      const hashedResult = createSha3HashFromFile(combinedBufferData);

      const size = Buffer.byteLength(combinedBufferData);
      //convert bytes to kiloBytes
      const sizeInKB = size / 1024;

      resolve({ size: sizeInKB, hashedResult, bufferData: combinedBufferData });
    });
  });
};

const getObjectFromS3 = async ({
  filePath,
  isPublicAccess,
}: {
  filePath: string;
  isPublicAccess: boolean;
}) => {
  try {
    const res = await StorageService.getObjectS3File({
      destinationPath: filePath,
      isPublicAccess,
    });
    const BufferBody = await processStream(res?.Body as ReadStream);

    const response = {
      AcceptRanges: res?.AcceptRanges,
      LastModified: res?.LastModified,
      ContentLength: res?.ContentLength,
      ETag: `"${res?.ETag}"`,
      ContentType: res?.ContentType,
      Metadata: {},
      Body: BufferBody.bufferData,
    } as S3OjectResponse;
    return response;
  } catch (error) {}
};

const setCompanyMemberReferenceImageSize = async ({
  key,
  bucket,
  companyMemberId,
}: {
  key: string;
  bucket: string;
  companyMemberId: CompanyMemberId;
}) => {
  try {
    const headObject = await StorageService.headObjectS3({
      bucketName: bucket,
      destinationPath: key,
    });

    //converting Bytes to kB
    const fileSize = headObject?.ContentLength
      ? headObject?.ContentLength / 1024
      : (0 as number);
    const res = await CompanyStore.setCompanyMemberReferenceImageSize({
      companyMemberId,
      fileSize,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const setAttendanceVerificationImageSize = async ({
  key,
  bucket,
  companyMemberId,
  attendanceId,
  imageUrl,
}: {
  key: string;
  bucket: string;
  companyMemberId: CompanyMemberId;
  attendanceId: AttendanceId;
  imageUrl: string;
}) => {
  try {
    const headObject = await StorageService.headObjectS3({
      bucketName: bucket,
      destinationPath: key,
    });

    //converting Bytes to kB
    const fileSize = headObject?.ContentLength
      ? headObject?.ContentLength / 1024
      : (0 as number);

    const res = await AttendanceStore.setAttendanceVerificationImageSize({
      companyMemberId,
      attendanceId,
      s3Bucket: bucket,
      s3Key: key,
      s3ImageUrl: imageUrl,
      fileSize,
    });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  processUploadToS3,
  uploadBase64PdfToS3,
  setCompanyMemberReferenceImageSize,
  setAttendanceVerificationImageSize,
  getObjectFromS3,
  processStream,
};
