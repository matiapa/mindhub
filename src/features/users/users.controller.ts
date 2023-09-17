import { Controller, Get, Body, Param, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  UpdateProfileDto,
  UpdateProfileResDto,
} from './dto/update-profile.dto';
import {
  UpdateLastConnectionDto,
  UpdateLastConnectionResDto,
} from './dto/update-last-connection.dto';
import { GetPictureUploadUrlDto } from './dto/get-picture-upload-url.dto';
import { GetUserResDto } from './dto/get-user.dto';
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
  @ApiOkResponse({ description: 'OK', type: GetUserResDto })
  getById(@Param('id') id: string): Promise<GetUserResDto> {
    return this.usersService.getUser(id);
  }
}
