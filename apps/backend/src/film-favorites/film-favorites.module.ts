import { Module } from '@nestjs/common';
import { FilmFavoritesController } from './film-favorites.controller';
import { FilmFavoritesService } from './film-favorites.service';

@Module({
  controllers: [FilmFavoritesController],
  providers: [FilmFavoritesService],
})
export class FilmFavoritesModule {}
