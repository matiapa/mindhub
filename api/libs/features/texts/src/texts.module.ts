import { Module } from '@nestjs/common';
import { TextsService } from './texts.service';
import { TextsRepository } from './texts.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Text, TextSchema } from './entities/text.entity';
import { QueueModule } from '@Provider/queue';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Text.name, schema: TextSchema }]),
    QueueModule
  ],
  providers: [TextsService, TextsRepository],
  exports: [TextsService],
})
export class TextsModule {}
