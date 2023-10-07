import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitterConfig } from './twitter.config';
import yauzl from 'yauzl';
import { Tweet } from './types/tweet.interface';
import { ProviderEnum } from '@Feature/providers';
import { SyncResult } from '@Feature/providers/entities/sync-result.entity';
import { ProviderSyncService } from '@Feature/providers/types/provider.interface';
import { TextData } from '@Feature/texts';

@Injectable()
export class TwitterSyncService implements ProviderSyncService {
  public providerName: ProviderEnum = ProviderEnum.TWITTER;

  private readonly logger = new Logger(TwitterSyncService.name);

  private config: TwitterConfig;

  constructor(configService: ConfigService) {
    this.config = configService.get<TwitterConfig>('twitter')!;
  }

  async syncFromFile(userId: string, file: Buffer): Promise<SyncResult> {
    const tweets = await this.getTweetsFromZip(file, this.config.tweetsPath);

    const textData: TextData[] = [];

    for (const t of tweets) {
      // Skip retweets because it's not text produced by the user
      if (t.tweet.full_text.substring(0, 4) === 'RT @') continue;

      textData.push({
        ownerId: userId,
        provider: ProviderEnum.TWITTER,
        rawText: t.tweet.full_text,
        language: t.tweet.lang,
        date: t.tweet.created_at,
      });
    }

    return {
      texts: textData,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async syncFromApi(userId: string, token: string): Promise<SyncResult> {
    throw Error('Method not implemented');
  }

  private getTweetsFromZip(zipFile: Buffer, tweetsFilePath): Promise<Tweet[]> {
    return new Promise<Tweet[]>((resolve, reject) => {
      let jsonData = '';

      yauzl.fromBuffer(zipFile, { lazyEntries: true }, function (err, zipfile) {
        if (err) reject(err);

        zipfile.readEntry();

        zipfile.on('entry', function (entry) {
          if (entry.fileName === tweetsFilePath) {
            zipfile.openReadStream(entry, function (err, readStream) {
              if (err) reject(err);

              readStream.on('end', function () {
                const json = jsonData.slice(
                  jsonData.indexOf('['),
                  jsonData.length,
                );
                resolve(JSON.parse(json));
              });

              readStream.on('data', (chunk) => {
                jsonData += chunk;
              });
            });
          }

          zipfile.readEntry();
        });
      });
    });
  }
}
