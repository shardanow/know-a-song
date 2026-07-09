import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SuggestionsService } from './suggestions.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('suggestions')
@Controller('api')
export class SuggestionsController {
  constructor(private suggestionsService: SuggestionsService) {}

  @Get('suggestions/film/:filmId')
  @Public()
  @ApiOperation({ summary: 'Get suggestions for a film' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByFilmId(
    @Param('filmId') filmId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.suggestionsService.findByFilmId(
      Number(filmId),
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Post('suggestions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a suggestion' })
  create(
    @Body() body: { filmId: number; title: string; author: string; type?: string; link?: string },
    @Req() req: any,
  ) {
    return this.suggestionsService.create({ ...body, ownerId: req.user.id });
  }

  @Put('suggestions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('authorization')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update suggestion status' })
  update(@Param('id') id: string, @Body() body: { status: string }) {
    return this.suggestionsService.updateStatus(Number(id), body.status);
  }

  @Delete('suggestions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own suggestion' })
  delete(@Param('id') id: string, @Req() req: any) {
    return this.suggestionsService.delete(Number(id), req.user.id);
  }
}
