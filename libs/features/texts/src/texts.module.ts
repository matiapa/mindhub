import { Module } from '@nestjs/common';
import { TextsService } from './texts.service';
import { TextsRepository } from './texts.repository';

@Module({
  providers: [TextsService, TextsRepository],
  exports: [TextsService],
})
export class TextsModule {}
