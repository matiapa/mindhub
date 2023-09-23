import { Module } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { ResourcesRepository } from './resources.repository';

@Module({
  providers: [ResourcesService, ResourcesRepository],
  exports: [ResourcesService],
})
export class ResourcesModule {}
