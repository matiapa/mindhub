import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ReviewRequestDto {
  @IsBoolean()
  @IsNotEmpty()
  accept: boolean;
}
