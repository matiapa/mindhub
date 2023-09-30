import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { Interest } from '../interest.entity';

export class InterestDto implements Interest {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @IsNumber()
  relevance?: number;
}
