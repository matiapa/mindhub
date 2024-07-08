import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  _id: string;

  @IsString()
  @IsNotEmpty()
  sender: string;

  @IsString()
  @IsNotEmpty()
  receiver: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsBoolean()
  @IsNotEmpty()
  seen: boolean;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

}

export class GetMessagesReqDto {
  @IsString()
  @IsOptional()
  counterpartyId?: string;

  @IsBooleanString()
  @IsOptional()
  onlyNew?: string;
}

export class GetMessagesResDto {
  @IsArray()
  @Type(() => MessageDto)
  @ValidateNested({ each: true })
  @IsNotEmpty()
  messages: MessageDto[];
}
