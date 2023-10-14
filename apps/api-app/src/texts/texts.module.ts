import { Module } from '@nestjs/common';
import { TextsController } from './texts.controller';
import { TextsModule } from '@Feature/texts';

@Module({
  imports: [TextsModule],
  controllers: [TextsController],
})
export class ApiTextsModule {}
