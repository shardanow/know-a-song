import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ArtistsService } from './artists.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('artists')
@Controller('api')
export class ArtistsController {
  constructor(private artistsService: ArtistsService) {}

  @Get('artists/tmdb/:query')
  @Public()
  @ApiOperation({ summary: 'Search TMDB for persons' })
  searchTmdb(@Param('query') query: string) {
    return this.artistsService.searchTmdb(query);
  }

  @Get('artists/tmdb/person/:id')
  @Public()
  @ApiOperation({ summary: 'Get TMDB person details' })
  getTmdbPerson(@Param('id') id: string) {
    return this.artistsService.getTmdbPerson(Number(id));
  }

  @Get('artists/db')
  @Public()
  @ApiOperation({ summary: 'List all artists in our DB' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.artistsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
    });
  }

  @Post('artists/db')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create/reference artist from TMDB' })
  create(@Body() body: { name: string; tmdbPersonId?: number }) {
    return this.artistsService.create(body);
  }

  @Put('artists/db/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update artist' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.artistsService.update(Number(id), body);
  }

  @Delete('artists/db/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete artist' })
  delete(@Param('id') id: string) {
    return this.artistsService.delete(Number(id));
  }
}
