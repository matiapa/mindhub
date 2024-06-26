import { IsNotEmpty } from 'class-validator';

export class InterestsConfig {
  @IsNotEmpty()
  uuidNamespace: string = 'DEPRECATED_FIELD';
}
