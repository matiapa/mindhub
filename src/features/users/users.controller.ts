import { Controller, Get, Body, Param, Put, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  UpdateProfileDto,
  UpdateProfileResDto,
  UpdateLastConnectionDto,
  UpdateLastConnectionResDto,
  GetPictureUploadUrlDto,
  UserInfo,
  UserInfoConfig,
} from './dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('/me/profile')
  @ApiOperation({ summary: 'Update authenticated user profile' })
  @ApiCreatedResponse({ description: 'OK', type: UpdateProfileResDto })
  updateProfile(@Body() dto: UpdateProfileDto): Promise<UpdateProfileResDto> {
    return this.usersService.updateProfile(dto);
  }

  @Put('/me/connection')
  @ApiOperation({ summary: 'Update authenticated user last connection' })
  @ApiCreatedResponse({ description: 'OK', type: UpdateLastConnectionResDto })
  updateLastConnection(
    @Body() dto: UpdateLastConnectionDto,
  ): Promise<UpdateLastConnectionResDto> {
    return this.usersService.updateLastConnection(dto);
  }

  @Get('/me/pictureUploadUrl')
  @ApiOperation({ summary: 'Get a temporary URL for uploading picture' })
  @ApiOkResponse({ description: 'OK', type: String })
  getPictureUploadUrl(@Query() dto: GetPictureUploadUrlDto): Promise<string> {
    return this.usersService.getPictureUploadUrl(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public information of a user' })
  @ApiOkResponse({ description: 'OK', type: UserInfo })
  getById(
    @Param('id') id: string,
    @Query() config: UserInfoConfig,
  ): Promise<UserInfo> {
    return this.usersService.getUserInfo(id, config);
  }
}
