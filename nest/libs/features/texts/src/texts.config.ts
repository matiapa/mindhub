import { IsNotEmpty, IsUUID } from 'class-validator';

export class TextsConfig {
  @IsUUID()
  @IsNotEmpty()
  uuidNamespace: string = process.env.TEXTS_UUID_NAMESPACE;
}
