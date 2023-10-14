import { IsNotEmpty, IsNumber, IsNumberString } from 'class-validator';

export class PaginatedReqDto {
  @IsNumberString()
  @IsNotEmpty()
  offset: number;

  @IsNumberString()
  @IsNotEmpty()
  limit: number;
}

export class PaginatedResDto {
  @IsNumber()
  @IsNotEmpty()
  count: number;

  @IsNumber()
  @IsNotEmpty()
  total: number;
}
