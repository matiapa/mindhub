import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProviderConnectionDto {
  provider: string;
  oauth?: {
    date: Date;
  };
  file?: {
    date: Date;
  };
}

export class GetProviderConnsResDto {
  @Type(() => ProviderConnectionDto)
  @ValidateNested({ each: true })
  connections: ProviderConnectionDto[];
}
