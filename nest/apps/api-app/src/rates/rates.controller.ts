import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';

import { GetGivenRatesResDto } from '@Feature/rates/dtos';
import { RatesService } from '@Feature/rates/rates.service';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import { PostRateDto } from '@Feature/rates/dtos/post-rate.dto';

@ApiTags('Rates')
@ApiBearerAuth()
@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a rate' })
  @UseGuards(AuthGuard)
  postRate(
    @Body() dto: PostRateDto,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.ratesService.rateUser(user.id, dto.rateeId, dto.rating);
  }

  @Get()
  @ApiOperation({
    summary: 'Get given rates',
  })
  @UseGuards(AuthGuard)
  getGivenRates(@AuthUser() user: PrincipalData): Promise<GetGivenRatesResDto> {
    return this.ratesService.getGivenRates(user.id);
  }
}
