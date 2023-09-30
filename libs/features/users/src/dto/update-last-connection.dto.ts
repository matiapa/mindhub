import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UpdateLastConnectionDto {
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class UpdateLastConnectionResDto extends UpdateLastConnectionDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;
}
