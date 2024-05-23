import { IsNotEmpty, IsUUID } from 'class-validator';

export class PersonalityConfig {
  @IsUUID()
  @IsNotEmpty()
  uuidNamespace: string = process.env.PERSONALITIES_UUID_NAMESPACE;
}
