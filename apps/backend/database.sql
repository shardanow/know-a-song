--Creating Tables (DB STRUCTURE)
CREATE TABLE IF NOT EXISTS APIKeys (
    id SERIAL PRIMARY KEY,
    api_tmdb_key VARCHAR(50) UNIQUE,
    api_shiki_key VARCHAR(50) UNIQUE
);

CREATE TABLE IF NOT EXISTS Films (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL,
    api_tmdb_id INT UNIQUE,
    api_shiki_id INT UNIQUE,
    tv_series BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS UserType (
    id     SERIAL PRIMARY KEY,
    title  VARCHAR(50)  NOT NULL,
    rights VARCHAR(255) NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    token VARCHAR(50) UNIQUE NOT NULL,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_type_id INT NOT NULL DEFAULT 1,
    user_is_active INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_type_id) REFERENCES UserType (id)
);

CREATE TABLE IF NOT EXISTS Songs (
    id SERIAL PRIMARY KEY,
    owner_id INT NOT NULL,
    film_id INT NOT NULL,
    season INT DEFAULT 0,
    episode_season_id INT,
    is_opening BOOLEAN NOT NULL DEFAULT FALSE,
    is_ending BOOLEAN NOT NULL DEFAULT FALSE,
    author VARCHAR(50) NOT NULL,
    title VARCHAR(50) NOT NULL,
    FOREIGN KEY (film_id) REFERENCES Films (id),
    FOREIGN KEY (owner_id) REFERENCES Users (id)
);

CREATE TABLE IF NOT EXISTS EpisodeSeasonSongs (
    id SERIAL PRIMARY KEY,
    song_id INT NOT NULL,
    season INT DEFAULT 0,
    episode INT DEFAULT 0,
    FOREIGN KEY (song_id) REFERENCES Songs (id)
);

CREATE TABLE IF NOT EXISTS SongSources (
    id SERIAL PRIMARY KEY,
    song_id INT NOT NULL,
    owner_id INT NOT NULL,
    youtube_id VARCHAR(50),
    spotify_id VARCHAR(50),
    apple_m_id VARCHAR(50),
    youtube_link VARCHAR(50),
    spotify_link VARCHAR(50),
    apple_m_link VARCHAR(50),
    FOREIGN KEY (song_id) REFERENCES Songs (id),
    FOREIGN KEY (owner_id) REFERENCES Users (id)
);

CREATE TABLE IF NOT EXISTS SongRating (
    id SERIAL PRIMARY KEY,
    song_id INT NOT NULL,
    owner_id INT NOT NULL,
    rating_value INT NOT NULL,
    FOREIGN KEY (song_id) REFERENCES Songs (id),
    FOREIGN KEY (owner_id) REFERENCES Users (id)
);

CREATE TABLE IF NOT EXISTS SongFavorite (
    id SERIAL PRIMARY KEY,
    song_id INT NOT NULL,
    owner_id INT NOT NULL,
    FOREIGN KEY (song_id) REFERENCES Songs (id),
    FOREIGN KEY (owner_id) REFERENCES Users (id)
);

--Inserts
INSERT INTO UserType VALUES
    (1, 'Inactive', '{"authorization": 1, "edit_films": 0, "edit_songs": 0, "edit_users": 0, "edit_settings": 0, "add_films": 0, "add_songs": 0, "add_users": 0}'),
    (2, 'User', '{"authorization": 1, "edit_films": 0, "edit_songs": 0, "edit_users": 0, "edit_settings": 0, "add_films": 0, "add_songs": 0, "add_users": 0}'),
    (3, 'Admin', '{"authorization": 1, "edit_films": 1, "edit_songs": 1, "edit_users": 1, "edit_settings": 1, "add_films": 1, "add_songs": 1, "add_users": 1}'),
    (4, 'Moderator', '{"authorization": 1, "edit_films": 1, "edit_songs": 1, "edit_users": 0, "edit_settings": 0, "add_films": 1, "add_songs": 1, "add_users": 0}'),
    (5, 'Banned', '{"authorization": 0, "edit_films": 0, "edit_songs": 0, "edit_users": 0, "edit_settings": 0, "add_films": 0, "add_songs": 0, "add_users": 0}');