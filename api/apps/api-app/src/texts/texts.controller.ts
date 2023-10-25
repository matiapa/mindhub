import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import { TextsService } from '@Feature/texts';
import {
  GetUserTextsReqDto,
  GetUserTextsResDto,
} from '@Feature/texts/dtos/get-user-texts.dto';
import { ProviderEnum } from '@Feature/providers';
import { CreateTextDto } from '@Feature/texts/dtos/create-text.dto';

@Controller('/texts')
export class TextsController {
  constructor(private readonly textsService: TextsService) {}

  @Post('/')
  @ApiOperation({ summary: 'Post a new text' })
  @ApiCreatedResponse({ description: 'OK' })
  @UseGuards(AuthGuard)
  async create(
    @Body() dto: CreateTextDto,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.textsService.upsertMany([
      {
        userId: user.id,
        provider: ProviderEnum.USER,
        rawText: dto.rawText,
        language: dto.language,
        date: new Date(),
      },
    ]);
  }

  @Get('/')
  @ApiOperation({ summary: 'Get the texts of the authenticated user' })
  @ApiOkResponse({ description: 'OK', type: GetUserTextsResDto })
  @UseGuards(AuthGuard)
  getOwn(
    @Query() dto: GetUserTextsReqDto,
    @AuthUser() user: PrincipalData,
  ): Promise<GetUserTextsResDto> {
    return this.textsService.getUserTexts(dto, user.id);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a text' })
  @ApiCreatedResponse({ description: 'OK' })
  @UseGuards(AuthGuard)
  async delete(
    @Param('id') id: string,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.textsService.remove(id, user.id);
  }
}
