import {
  UsersService,
  SharedUserInfo,
  SharedUserInfoConfig,
} from '@Feature/users';
import {
  UpdateProfileReqDto,
  UpdateLastConnectionReqDto,
  GetPictureUploadUrlDto,
} from '@Feature/users/dto';
import { GetOwnUserResDto } from '@Feature/users/dto/get-own-user.dto';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me/profile')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @UseGuards(AuthGuard)
  getProfile(@AuthUser() user: PrincipalData): Promise<GetOwnUserResDto> {
    return this.usersService.getOwnUserInfo(user.id);
  }

  @Put('/me/profile')
  @ApiOperation({ summary: 'Update authenticated user profile' })
  @UseGuards(AuthGuard)
  updateProfile(
    @Body() dto: UpdateProfileReqDto,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Put('/me/connection')
  @ApiOperation({ summary: 'Update authenticated user last connection' })
  @UseGuards(AuthGuard)
  updateLastConnection(
    @Body() dto: UpdateLastConnectionReqDto,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.usersService.updateLastConnection(user.id, dto);
  }

  @Get('/me/pictureUploadUrl')
  @ApiOperation({ summary: 'Get a temporary URL for uploading picture' })
  @UseGuards(AuthGuard)
  getPictureUploadUrl(
    @Query() dto: GetPictureUploadUrlDto,
    @AuthUser() user: PrincipalData,
  ): Promise<string> {
    return this.usersService.getPictureUploadUrl(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public information of a user' })
  @UseGuards(AuthGuard)
  getById(
    @Param('id') id: string,
    @Query() config: SharedUserInfoConfig,
    @AuthUser() user: PrincipalData,
  ): Promise<SharedUserInfo> {
    return this.usersService.getSharedUserInfo(id, user.id, config);
  }
}
