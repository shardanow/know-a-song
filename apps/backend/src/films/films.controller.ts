import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FilmsService } from './films.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('films')
@Controller('api')
export class FilmsController {
  constructor(private filmsService: FilmsService) {}

  @Get('films')
  @Public()
  @ApiOperation({ summary: 'Get all films' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.filmsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
    });
  }

  @Get('film/:id/by_id')
  @Public()
  @ApiOperation({ summary: 'Get film by ID' })
  findById(@Param('id') id: string) {
    return this.filmsService.findById(Number(id));
  }

  @Get('films/song-likes')
  @Public()
  @ApiOperation({ summary: 'Get total song upvotes per film' })
  @ApiQuery({ name: 'ids', required: true, type: String, description: 'Comma-separated film IDs' })
  getSongLikes(@Query('ids') ids: string) {
    const filmIds = ids ? ids.split(',').map(Number).filter((n) => !isNaN(n)) : [];
    return this.filmsService.getFilmLikes(filmIds);
  }

  @Get('film/:slug/by_slug')
  @Public()
  @ApiOperation({ summary: 'Get film by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.filmsService.findBySlug(slug);
  }

  @Post('film')
  @Public()
  @ApiOperation({ summary: 'Create a film' })
  create(@Body() body: any) {
    return this.filmsService.create(body);
  }

  @Put('film/:id')
  @Public()
  @ApiOperation({ summary: 'Update a film' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.filmsService.update(Number(id), body);
  }

  @Delete('film/:id')
  @Public()
  @ApiOperation({ summary: 'Delete a film' })
  delete(@Param('id') id: string) {
    return this.filmsService.delete(Number(id));
  }
}
