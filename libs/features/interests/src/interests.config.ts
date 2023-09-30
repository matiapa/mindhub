import { IsNotEmpty, IsString } from 'class-validator';

export class InterestsConfig {
  @IsString()
  @IsNotEmpty()
  interestsTableName: string = process.env.INTERESTS_TABLE_NAME!;
}
