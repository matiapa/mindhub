import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';

@Injectable()
export class StorageService {
  private s3 = new AWS.S3();

  async getUploadUrl(
    bucket: string,
    key: string,
    ttl: number,
    fileMime: string,
  ): Promise<string> {
    const uploadURL = await this.s3.getSignedUrlPromise('putObject', {
      Bucket: bucket,
      Key: key,
      Expires: ttl,
      ContentType: fileMime,
    });

    return uploadURL;
  }

  async getDownloadUrl(
    bucket: string,
    key: string,
    ttl: number,
  ): Promise<string | undefined> {
    try {
      await this.s3
        .headObject({
          Bucket: bucket,
          Key: key,
        })
        .promise();

      const downloadURL = await this.s3.getSignedUrlPromise('getObject', {
        Bucket: bucket,
        Key: key,
        Expires: ttl,
      });

      return downloadURL;
    } catch (error) {
      return undefined;
    }
  }
}
