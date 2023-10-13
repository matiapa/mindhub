import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ProvidersModule } from '@Feature/providers';
import { FileController } from './file.controller';
import { QueueModule } from '@Provider/queue';
import { StorageModule } from '@Provider/storage';

@Module({
  imports: [ProvidersModule, QueueModule, StorageModule],
  controllers: [AuthController, FileController],
})
export class ApiProvidersModule {}
