import { IsNotEmpty } from 'class-validator';

export class TextsConfig {
  @IsNotEmpty()
  uuidNamespace: string = 'DEPRECATED_FIELD';
}
