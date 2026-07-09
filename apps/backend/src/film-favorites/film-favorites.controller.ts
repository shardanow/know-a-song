import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FilmFavoritesService } from './film-favorites.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('film-favorites')
@Controller('api')
export class FilmFavoritesController {
  constructor(private filmFavoritesService: FilmFavoritesService) {}

  @Get('film/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user favorite films' })
  getFavorites(@Req() req: any) {
    return this.filmFavoritesService.getFavorites(req.user.id);
  }

  @Post('film/:id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle favorite for a film' })
  toggleFavorite(@Param('id') id: string, @Req() req: any) {
    return this.filmFavoritesService.toggleFavorite(Number(id), req.user.id);
  }
}
