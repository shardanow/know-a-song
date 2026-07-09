CREATE TABLE "Comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"film_id" integer NOT NULL,
	"owner_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Suggestions" (
	"id" serial PRIMARY KEY NOT NULL,
	"film_id" integer NOT NULL,
	"owner_id" integer NOT NULL,
	"title" varchar(100) NOT NULL,
	"author" varchar(50) NOT NULL,
	"type" varchar(20),
	"link" varchar(255),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "FilmFavorite" (
	"id" serial PRIMARY KEY NOT NULL,
	"film_id" integer NOT NULL,
	"owner_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_film_id_Films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."Films"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_owner_id_Users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Suggestions" ADD CONSTRAINT "Suggestions_film_id_Films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."Films"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Suggestions" ADD CONSTRAINT "Suggestions_owner_id_Users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FilmFavorite" ADD CONSTRAINT "FilmFavorite_film_id_Films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."Films"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FilmFavorite" ADD CONSTRAINT "FilmFavorite_owner_id_Users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;