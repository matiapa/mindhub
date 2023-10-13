import { Module } from '@nestjs/common';
import { TextsController } from './texts.controller';
import { InterestsModule as TextsModule } from '@Feature/interests';

@Module({
  imports: [TextsModule],
  controllers: [TextsController],
})
export class ApiTextsModule {}
