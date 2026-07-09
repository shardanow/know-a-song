import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { FilmsModule } from './films/films.module';
import { SongsModule } from './songs/songs.module';
import { UsersModule } from './users/users.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { CommentsModule } from './comments/comments.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { FilmFavoritesModule } from './film-favorites/film-favorites.module';
import { ArtistsModule } from './artists/artists.module';
import { HeroBannerModule } from './hero-banner/hero-banner.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    FilmsModule,
    SongsModule,
    UsersModule,
    UserRolesModule,
    CommentsModule,
    SuggestionsModule,
    FilmFavoritesModule,
    ArtistsModule,
    HeroBannerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
