import { Module } from '@nestjs/common';
import { TextsService } from './texts.service';
import { TextsRepository } from './texts.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Text, TextSchema } from './entities/text.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Text.name, schema: TextSchema }]),
  ],
  providers: [TextsService, TextsRepository],
  exports: [TextsService],
})
export class TextsModule {}
