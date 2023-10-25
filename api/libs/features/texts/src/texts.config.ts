import { IsNotEmpty, IsUUID } from 'class-validator';

export class TextsConfig {
  @IsUUID()
  @IsNotEmpty()
  uuidNamespace: string = process.env.INTERESTS_UUID_NAMESPACE;
}
