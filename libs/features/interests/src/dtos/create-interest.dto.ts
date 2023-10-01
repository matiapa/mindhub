import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { InterestRelevance } from '../interest.entity';

export class CreateInterestDto {
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @IsNumber()
  relevance: InterestRelevance;
}
