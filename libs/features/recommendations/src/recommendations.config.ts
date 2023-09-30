import { IsNotEmpty, IsString } from 'class-validator';

export class RecommendationsConfig {
  @IsString()
  @IsNotEmpty()
  recommendationsTableName: string = process.env.RECOMMENDATIONS_TABLE_NAME!;
}
