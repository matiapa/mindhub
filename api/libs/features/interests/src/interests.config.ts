import { IsNotEmpty, IsUUID } from 'class-validator';

export class InterestsConfig {
  @IsUUID()
  @IsNotEmpty()
  uuidNamespace: string = process.env.INTERESTS_UUID_NAMESPACE;
}
