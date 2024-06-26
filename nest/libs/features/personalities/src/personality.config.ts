import { IsNotEmpty } from 'class-validator';

export class PersonalityConfig {
  @IsNotEmpty()
  uuidNamespace: string = 'DEPRECATED_FIELD';
}
