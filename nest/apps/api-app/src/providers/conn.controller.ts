import { GetProviderConnsResDto } from '@Feature/providers/dtos/get-connections.dto';
import { ProvidersConnService } from '@Feature/providers/services/conn.service';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

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
}
