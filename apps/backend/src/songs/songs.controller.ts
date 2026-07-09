import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

import { SongsService } from './songs.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('songs')
@Controller('api')
export class SongsController {
  constructor(private songsService: SongsService) {}

  @Get('songs/tmdb/:tmdbId')
  @Public()
  @ApiOperation({ summary: 'Get songs by TMDB ID' })
  findByTmdbId(@Param('tmdbId') tmdbId: string) {
    return this.songsService.findByTmdbId(Number(tmdbId));
  }

  @Get('songs/search')
  @Public()
  @ApiOperation({ summary: 'Search all songs' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  searchSongs(
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.songsService.searchSongs({
      q,
      type,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('songs/:id')
  @Public()
  @ApiOperation({ summary: 'Get songs by film ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findByFilmId(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.songsService.findByFilmId(Number(id), {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
    });
  }

  @Get('songs')
  @Public()
  @ApiOperation({ summary: 'Get songs by multiple film IDs (batch)' })
  @ApiQuery({ name: 'filmIds', required: true, description: 'Comma-separated film IDs' })
  findByFilmIds(@Query('filmIds') filmIds: string) {
    const ids = filmIds.split(',').map(Number).filter(Boolean);
    return this.songsService.findByFilmIds(ids);
  }

  @Get('song/:id')
  @Public()
  @ApiOperation({ summary: 'Get song by ID' })
  findById(@Param('id') id: string) {
    return this.songsService.findById(Number(id));
  }

  @Post('song')
  @Public()
  @ApiOperation({ summary: 'Create a song' })
  create(@Body() body: any) {
    return this.songsService.create(body);
  }

  @Post('song_source/:id')
  @Public()
  @ApiOperation({ summary: 'Create a song source' })
  createSource(@Param('id') id: string, @Body() body: any) {
    return this.songsService.createSource({ ...body, songId: Number(id) });
  }

  @Put('song/:id')
  @Public()
  @ApiOperation({ summary: 'Update a song' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.songsService.update(Number(id), body);
  }

  @Put('song_source/:id')
  @Public()
  @ApiOperation({ summary: 'Update a song source' })
  updateSource(@Param('id') id: string, @Body() body: any) {
    return this.songsService.updateSource(Number(id), body);
  }

  @Delete('song/:id')
  @Public()
  @ApiOperation({ summary: 'Delete a song and its sources' })
  async delete(@Param('id') id: string) {
    await this.songsService.deleteSource(Number(id));
    return this.songsService.delete(Number(id));
  }

  @Delete('song_source/:id')
  @Public()
  @ApiOperation({ summary: 'Delete a song source' })
  deleteSource(@Param('id') id: string) {
    return this.songsService.deleteSource(Number(id));
  }

  @Post('song/:id/episode')
  @Public()
  @ApiOperation({ summary: 'Set song episode (season + episode)' })
  setEpisode(
    @Param('id') id: string,
    @Body() body: { season: number; episode: number },
  ) {
    return this.songsService.upsertEpisode(Number(id), body.season, body.episode);
  }

  @Delete('song/:id/episode')
  @Public()
  @ApiOperation({ summary: 'Remove song episode binding' })
  deleteEpisode(@Param('id') id: string) {
    return this.songsService.deleteEpisode(Number(id));
  }

  // ─── Ratings ───────────────────────────────
  @Get('song/:id/rating')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get song ratings' })
  getRating(@Param('id') id: string, @Req() req: any) {
    return this.songsService.getRating(Number(id), req.user.id);
  }

  @Post('song/:id/rating')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rate a song (1=up, -1=down)' })
  setRating(@Param('id') id: string, @Body() body: { value: number }, @Req() req: any) {
    return this.songsService.setRating(Number(id), req.user.id, body.value);
  }

  @Delete('song/:id/rating')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove rating' })
  deleteRating(@Param('id') id: string, @Req() req: any) {
    return this.songsService.deleteRating(Number(id), req.user.id);
  }

  @Get('song/:id/rating/counts')
  @Public()
  @ApiOperation({ summary: 'Get aggregate rating counts for a song' })
  getRatingCounts(@Param('id') id: string) {
    return this.songsService.getRatingCounts(Number(id));
  }

  // ─── Artists ───────────────────────────────
  @Get('artists')
  @Public()
  @ApiOperation({ summary: 'Get unique artists (authors)' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getArtists(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.songsService.getArtists({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
    });
  }

  @Get('artists/:name/songs')
  @Public()
  @ApiOperation({ summary: 'Get songs by artist name' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getArtistSongs(
    @Param('name') name: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.songsService.getArtistSongs(name, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('artists/db/:id/songs')
  @Public()
  @ApiOperation({ summary: 'Get songs by artist DB ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByArtistId(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.songsService.findByArtistId(Number(id), {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  // ─── Similar Songs ──────────────────────────
  @Get('song/:id/similar')
  @Public()
  @ApiOperation({ summary: 'Get similar songs' })
  getSimilar(@Param('id') id: string) {
    return this.songsService.getSimilar(Number(id));
  }

  // ─── Favorites ─────────────────────────────
  @Post('song/:id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle favorite for a song' })
  toggleFavorite(@Param('id') id: string, @Req() req: any) {
    return this.songsService.toggleFavorite(Number(id), req.user.id);
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user favorites' })
  getFavorites(@Req() req: any) {
    return this.songsService.getFavorites(req.user.id);
  }
}
