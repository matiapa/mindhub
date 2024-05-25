import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class MessageDto {
  @IsBoolean()
  @IsNotEmpty()
  isOwn: boolean;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsString()
  @IsNotEmpty()
  text: string;
}

export class GetMessagesReqDto {
  @IsString()
  @IsNotEmpty()
  counterpartyId: string;
}

export class GetMessagesResDto {
  @IsArray()
  @Type(() => MessageDto)
  @ValidateNested({ each: true })
  @IsNotEmpty()
  messages: MessageDto[];
}
