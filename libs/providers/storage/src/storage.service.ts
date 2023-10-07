import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';
import { Readable } from 'stream';

export interface StorageEvent {
  event: string;
  bucket: string;
  key: string;
}

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

  async getDownloadStream(bucket: string, key: string): Promise<Readable> {
    await this.s3
      .headObject({
        Bucket: bucket,
        Key: key,
      })
      .promise();

    return this.s3
      .getObject({
        Bucket: bucket,
        Key: key,
      })
      .createReadStream();
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: bucket,
        Key: key,
      })
      .promise();
  }

  parseStorageEvent(eventMessage: any): StorageEvent | undefined {
    try {
      const data = eventMessage.Records[0];
      return {
        event: data.eventName,
        bucket: data.s3.bucket.name,
        key: data.s3.object.key,
      };
    } catch (error) {
      return undefined;
    }
  }
}
