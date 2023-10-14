import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ProvidersModule } from '@Feature/providers';
import { FileController } from './file.controller';
import { QueueModule } from '@Provider/queue';
import { StorageModule } from '@Provider/storage';
import { ConnectionsController } from './conn.controller';
import { AuthenticationModule } from '@Provider/authentication';

@Module({
  imports: [ProvidersModule, QueueModule, StorageModule, AuthenticationModule],
  controllers: [ConnectionsController, AuthController, FileController],
})
export class ApiProvidersModule {}
