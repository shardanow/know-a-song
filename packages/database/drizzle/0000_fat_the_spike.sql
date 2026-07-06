CREATE TABLE "APIKeys" (
	"id" serial PRIMARY KEY NOT NULL,
	"api_tmdb_key" varchar(50),
	"api_shiki_key" varchar(50),
	CONSTRAINT "APIKeys_api_tmdb_key_unique" UNIQUE("api_tmdb_key"),
	CONSTRAINT "APIKeys_api_shiki_key_unique" UNIQUE("api_shiki_key")
);
--> statement-breakpoint
CREATE TABLE "Films" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"api_tmdb_id" integer,
	"api_shiki_id" integer,
	"tv_series" boolean DEFAULT false NOT NULL,
	CONSTRAINT "Films_api_tmdb_id_unique" UNIQUE("api_tmdb_id"),
	CONSTRAINT "Films_api_shiki_id_unique" UNIQUE("api_shiki_id")
);
--> statement-breakpoint
CREATE TABLE "UserType" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(50) NOT NULL,
	"rights" varchar(255) DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"token" varchar(50) NOT NULL,
	"last_login" timestamp DEFAULT now(),
	"user_type_id" integer DEFAULT 1 NOT NULL,
	"user_is_active" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "Users_username_unique" UNIQUE("username"),
	CONSTRAINT "Users_email_unique" UNIQUE("email"),
	CONSTRAINT "Users_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "EpisodeSeasonSongs" (
	"id" serial PRIMARY KEY NOT NULL,
	"song_id" integer NOT NULL,
	"season" integer DEFAULT 0,
	"episode" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "SongFavorite" (
	"id" serial PRIMARY KEY NOT NULL,
	"song_id" integer NOT NULL,
	"owner_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SongRating" (
	"id" serial PRIMARY KEY NOT NULL,
	"song_id" integer NOT NULL,
	"owner_id" integer NOT NULL,
	"rating_value" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SongSources" (
	"id" serial PRIMARY KEY NOT NULL,
	"song_id" integer NOT NULL,
	"owner_id" integer NOT NULL,
	"youtube_id" varchar(50),
	"spotify_id" varchar(50),
	"apple_m_id" varchar(50),
	"youtube_link" varchar(100),
	"spotify_link" varchar(100),
	"apple_m_link" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "Songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"film_id" integer NOT NULL,
	"season" integer DEFAULT 0,
	"is_opening" boolean DEFAULT false NOT NULL,
	"is_ending" boolean DEFAULT false NOT NULL,
	"author" varchar(50) NOT NULL,
	"title" varchar(50) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Users" ADD CONSTRAINT "Users_user_type_id_UserType_id_fk" FOREIGN KEY ("user_type_id") REFERENCES "public"."UserType"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "EpisodeSeasonSongs" ADD CONSTRAINT "EpisodeSeasonSongs_song_id_Songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."Songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SongFavorite" ADD CONSTRAINT "SongFavorite_song_id_Songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."Songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SongFavorite" ADD CONSTRAINT "SongFavorite_owner_id_Users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SongRating" ADD CONSTRAINT "SongRating_song_id_Songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."Songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SongRating" ADD CONSTRAINT "SongRating_owner_id_Users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SongSources" ADD CONSTRAINT "SongSources_song_id_Songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."Songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SongSources" ADD CONSTRAINT "SongSources_owner_id_Users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Songs" ADD CONSTRAINT "Songs_film_id_Films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."Films"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Songs" ADD CONSTRAINT "Songs_owner_id_Users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;