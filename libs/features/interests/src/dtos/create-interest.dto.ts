import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateInterestDto {
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @IsNumber()
  relevance?: number;
}
