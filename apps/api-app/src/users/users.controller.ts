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
import { AuthenticationService } from '@Provider/authentication';
import { Controller, Get, Body, Param, Put, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthenticationService,
  ) {}

  @Put('/me/profile')
  @ApiOperation({ summary: 'Update authenticated user profile' })
  @ApiCreatedResponse({ description: 'OK', type: UpdateProfileResDto })
  updateProfile(@Body() dto: UpdateProfileDto): Promise<UpdateProfileResDto> {
    return this.usersService.updateProfile(
      this.authService.getAuthenticadedUserId(),
      dto,
    );
  }

  @Put('/me/connection')
  @ApiOperation({ summary: 'Update authenticated user last connection' })
  @ApiCreatedResponse({ description: 'OK', type: UpdateLastConnectionResDto })
  updateLastConnection(
    @Body() dto: UpdateLastConnectionDto,
  ): Promise<UpdateLastConnectionResDto> {
    return this.usersService.updateLastConnection(
      this.authService.getAuthenticadedUserId(),
      dto,
    );
  }

  @Get('/me/pictureUploadUrl')
  @ApiOperation({ summary: 'Get a temporary URL for uploading picture' })
  @ApiOkResponse({ description: 'OK', type: String })
  getPictureUploadUrl(@Query() dto: GetPictureUploadUrlDto): Promise<string> {
    return this.usersService.getPictureUploadUrl(
      this.authService.getAuthenticadedUserId(),
      dto,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public information of a user' })
  @ApiOkResponse({ description: 'OK', type: SharedUserInfo })
  getById(
    @Param('id') id: string,
    @Query() config: SharedUserInfoConfig,
  ): Promise<SharedUserInfo> {
    return this.usersService.getSharedUserInfo(
      id,
      this.authService.getAuthenticadedUserId(),
      config,
    );
  }
}
