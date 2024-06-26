import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitterConfig } from './twitter.config';
import yauzl from 'yauzl';
import { Tweet } from './types/tweet.interface';
import { ProviderEnum } from '@Feature/providers';
import {
  ProviderSyncService,
  SyncResult,
} from '@Feature/providers/types/provider.interface';
import { Text } from '@Feature/texts';

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

    const textData: Text[] = [];

    for (const t of tweets) {
      // Skip retweets because it's not text produced by the user
      // NOTE: The tweet.retweeted field is not properly set in the data
      if (t.tweet.full_text.substring(0, 4) === 'RT @') continue;

      // Remove mentions from tweets
      t.tweet.full_text = t.tweet.full_text.replace(/@\w+/g, '');

      textData.push({
        userId: userId,
        provider: ProviderEnum.TWITTER,
        rawText: t.tweet.full_text,
        language: t.tweet.lang,
        date: new Date(t.tweet.created_at),
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

  private getTweetsFromZip(zip: Buffer, tweetsFilePath): Promise<Tweet[]> {
    return new Promise<Tweet[]>((resolve, reject) => {
      let jsonData = '';

      yauzl.fromBuffer(zip, { lazyEntries: true }, function (err, zipfile) {
        if (err) {
          reject(err);
          return;
        }

        try {
          zipfile.readEntry();

          zipfile.on('entry', function (entry) {
            try {
              if (entry.fileName === tweetsFilePath) {
                zipfile.openReadStream(entry, function (err, readStream) {
                  if (err) {
                    reject(err);
                    return;
                  }

                  readStream.on('end', function () {
                    try {
                      const json = jsonData.slice(
                        jsonData.indexOf('['),
                        jsonData.length,
                      );
                      resolve(JSON.parse(json));
                    } catch (err) {
                      reject(err);
                    }
                  });

                  readStream.on('data', (chunk) => {
                    try {
                      jsonData += chunk;
                    } catch (err) {
                      reject(err);
                    }
                  });
                });
              }

              zipfile.readEntry();
            } catch (err) {
              reject(err);
            }
          });
        } catch (err) {
          reject(err);
        }
      });
    });
  }
}
