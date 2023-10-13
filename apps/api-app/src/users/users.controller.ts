import {
  UsersService,
  SharedUserInfo,
  SharedUserInfoConfig,
} from '@Feature/users';
import {
  UpdateProfileResDto,
  UpdateProfileDto,
  UpdateLastConnectionResDto,
  UpdateLastConnectionDto,
  GetPictureUploadUrlDto,
} from '@Feature/users/dto';
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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('/me/profile')
  @ApiOperation({ summary: 'Update authenticated user profile' })
  @ApiCreatedResponse({ description: 'OK', type: UpdateProfileResDto })
  @UseGuards(AuthGuard)
  updateProfile(
    @Body() dto: UpdateProfileDto,
    @AuthUser() user: PrincipalData,
  ): Promise<UpdateProfileResDto> {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Put('/me/connection')
  @ApiOperation({ summary: 'Update authenticated user last connection' })
  @ApiCreatedResponse({ description: 'OK', type: UpdateLastConnectionResDto })
  @UseGuards(AuthGuard)
  updateLastConnection(
    @Body() dto: UpdateLastConnectionDto,
    @AuthUser() user: PrincipalData,
  ): Promise<UpdateLastConnectionResDto> {
    return this.usersService.updateLastConnection(user.id, dto);
  }

  @Get('/me/pictureUploadUrl')
  @ApiOperation({ summary: 'Get a temporary URL for uploading picture' })
  @ApiOkResponse({ description: 'OK', type: String })
  @UseGuards(AuthGuard)
  getPictureUploadUrl(
    @Query() dto: GetPictureUploadUrlDto,
    @AuthUser() user: PrincipalData,
  ): Promise<string> {
    return this.usersService.getPictureUploadUrl(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public information of a user' })
  @ApiOkResponse({ description: 'OK', type: SharedUserInfo })
  @UseGuards(AuthGuard)
  getById(
    @Param('id') id: string,
    @Query() config: SharedUserInfoConfig,
    @AuthUser() user: PrincipalData,
  ): Promise<SharedUserInfo> {
    return this.usersService.getSharedUserInfo(id, user.id, config);
  }
}
