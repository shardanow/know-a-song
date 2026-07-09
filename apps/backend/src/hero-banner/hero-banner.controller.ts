import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HeroBannerService } from './hero-banner.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('hero-banner')
@Controller('api')
export class HeroBannerController {
  constructor(private heroBannerService: HeroBannerService) {}

  @Get('hero-banner')
  @Public()
  @ApiOperation({ summary: 'Get hero banner slides' })
  findAll() {
    return this.heroBannerService.findAll();
  }

  @Post('hero-banner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('authorization', 'edit_users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Replace hero banner slides' })
  replace(@Body() body: { slides: { filmId: number; position: number }[] }) {
    return this.heroBannerService.replace(body.slides || []);
  }

  @Delete('hero-banner/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('authorization', 'edit_users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a hero banner slide' })
  remove(@Param('id') id: string) {
    return this.heroBannerService.remove(Number(id));
  }
}
