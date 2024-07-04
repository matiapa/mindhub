import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
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
import { CreateManualTextDto } from '@Feature/texts/dtos/create-text.dto';
import { Text } from '@Feature/texts';

@ApiTags('Texts')
@ApiBearerAuth()
@Controller('/texts')
export class TextsController {
  constructor(private readonly textsService: TextsService) {}

  @Post('/')
  @ApiOperation({ summary: 'Post a new text' })
  @UseGuards(AuthGuard)
  async create(
    @Body() dto: CreateManualTextDto,
    @AuthUser() user: PrincipalData,
  ): Promise<Text> {
    return this.textsService.upsertManual(
      {
        rawText: dto.rawText,
        language: dto.language,
      },
      user.id
    );
  }

  @Get('/')
  @ApiOperation({ summary: 'Get the texts of the authenticated user' })
  @UseGuards(AuthGuard)
  getOwn(
    @Query() dto: GetUserTextsReqDto,
    @AuthUser() user: PrincipalData,
  ): Promise<GetUserTextsResDto> {
    return this.textsService.getUserTexts(dto, user.id);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a text' })
  @UseGuards(AuthGuard)
  async delete(
    @Param('id') id: string,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.textsService.delete(id, user.id);
  }
}
