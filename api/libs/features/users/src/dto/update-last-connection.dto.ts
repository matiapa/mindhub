import { IsNumber, IsOptional } from 'class-validator';

export class UpdateLastConnectionReqDto {
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}
