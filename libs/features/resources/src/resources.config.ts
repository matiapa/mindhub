import { IsNotEmpty, IsString } from 'class-validator';

export class ResourcesConfig {
  @IsString()
  @IsNotEmpty()
  resourcesTableName: string = process.env.RESOURCES_TABLE_NAME!;
}
