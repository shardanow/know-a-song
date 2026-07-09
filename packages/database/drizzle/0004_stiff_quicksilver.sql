CREATE TABLE "Artists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"tmdb_person_id" integer,
	"image_url" varchar(255),
	"biography" text,
	CONSTRAINT "Artists_name_unique" UNIQUE("name"),
	CONSTRAINT "Artists_tmdb_person_id_unique" UNIQUE("tmdb_person_id")
);
--> statement-breakpoint
ALTER TABLE "Songs" ADD COLUMN "artist_id" integer;--> statement-breakpoint
ALTER TABLE "Songs" ADD CONSTRAINT "Songs_artist_id_Artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."Artists"("id") ON DELETE no action ON UPDATE no action;