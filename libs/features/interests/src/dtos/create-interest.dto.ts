import { IsEnum, ValidateNested, IsNotEmpty } from 'class-validator';
import { Interest, InterestRelevance } from '../entities/interest.entity';
import { Type } from 'class-transformer';
import { ResourceDto } from './resource.dto';

export class CreateInterestDto
  implements Pick<Interest, 'relevance' | 'resource'>
{
  @IsEnum(InterestRelevance)
  @IsNotEmpty()
  relevance: InterestRelevance;

  @Type(() => ResourceDto)
  @ValidateNested()
  resource: ResourceDto;
}
