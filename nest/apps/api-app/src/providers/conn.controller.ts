import { ProviderEnum } from '@Feature/providers';
import { GetProviderConnsResDto } from '@Feature/providers/dtos/get-connections.dto';
import { ProvidersConnService } from '@Feature/providers/services/conn.service';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Providers')
@ApiBearerAuth()
@Controller('/providers')
export class ConnectionsController {
  constructor(private readonly connService: ProvidersConnService) {}

  @Get('/')
  @ApiOperation({
    summary: 'Get the connected providers',
  })
  @UseGuards(AuthGuard)
  getConnections(
    @AuthUser() user: PrincipalData,
  ): Promise<GetProviderConnsResDto> {
    return this.connService.getConnections(user.id);
  }

  @Delete('/:providerName')
  @ApiOperation({
    summary: 'Delete a connected provider',
  })
  @UseGuards(AuthGuard)
  async deleteConnection(
    @Param('providerName') providerName: ProviderEnum,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    await this.connService.deleteConnection(providerName, user.id);
  }
}
