import { IsJWT, IsNotEmpty } from 'class-validator';

export class SignupReqDto {
  @IsJWT()
  @IsNotEmpty()
  token: string;
}
