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
  UseGuards,
} from '@nestjs/common';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import { TextsService } from '@Feature/texts';
import { CreateTextDto, GetTextsResDto } from '@Feature/texts/dtos/text-dto';
import { ProviderEnum } from '@Feature/providers';

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
    return this.textsService.create({
      ownerId: user.id,
      provider: ProviderEnum.USER,
      rawText: dto.rawText,
      language: dto.language,
      date: new Date().toISOString(),
    });
  }

  @Get('/')
  @ApiOperation({ summary: 'Get the texts of the authenticated user' })
  @ApiOkResponse({ description: 'OK', type: GetTextsResDto })
  @UseGuards(AuthGuard)
  getOwn(@AuthUser() user: PrincipalData): Promise<GetTextsResDto> {
    return this.textsService.getUserTexts(user.id);
  }

  @Delete('/:date')
  @ApiOperation({ summary: 'Delete a text' })
  @ApiCreatedResponse({ description: 'OK' })
  @UseGuards(AuthGuard)
  async delete(
    @Param('date') date: string,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.textsService.remove(user.id, date);
  }
}
