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
    youtube_link VARCHAR(100),
    spotify_link VARCHAR(100),
    apple_m_link VARCHAR(100),
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

-- Insert some sample User Types
INSERT INTO UserType VALUES
    (1, 'Inactive', '{"authorization": 1, "edit_films": 0, "edit_songs": 0, "edit_users": 0, "edit_settings": 0, "add_films": 0, "add_songs": 0, "add_users": 0}'),
    (2, 'User', '{"authorization": 1, "edit_films": 0, "edit_songs": 0, "edit_users": 0, "edit_settings": 0, "add_films": 0, "add_songs": 0, "add_users": 0}'),
    (3, 'Admin', '{"authorization": 1, "edit_films": 1, "edit_songs": 1, "edit_users": 1, "edit_settings": 1, "add_films": 1, "add_songs": 1, "add_users": 1}'),
    (4, 'Moderator', '{"authorization": 1, "edit_films": 1, "edit_songs": 1, "edit_users": 0, "edit_settings": 0, "add_films": 1, "add_songs": 1, "add_users": 0}'),
    (5, 'Banned', '{"authorization": 0, "edit_films": 0, "edit_songs": 0, "edit_users": 0, "edit_settings": 0, "add_films": 0, "add_songs": 0, "add_users": 0}');


-- Insert some sample users
INSERT INTO Users (id, username, email, password, token, user_type_id, user_is_active) VALUES
    (1, 'admin', 'somemail@gmail.com', 'admin', ' ', 3, 1);


-- Insert some sample films
INSERT INTO Films (id, slug, api_shiki_id, api_tmdb_id, tv_series) VALUES
    (1, 'Friren', NULL, 209867, TRUE),
    (2, 'Dungeon Meshi', NULL, 207784, TRUE),
    (3, 'Konosuba', NULL, 65844, TRUE),
    (4, 'Re Zero', NULL, 65942, TRUE),
    (5, 'Mushoku Tensei', NULL, 94664, TRUE);


-- Insert some sample songs
INSERT INTO Songs (id, owner_id, film_id, season, is_opening, is_ending, author, title) VALUES
    (1, 1, 1, 1, TRUE, FALSE, 'YOASOBI', 'Yuusha (勇者)'),
    (2, 1, 1, 1, FALSE, FALSE, 'Evan Call', 'Journey of a Lifetime'),
    (3, 1, 1, 1, FALSE, FALSE, 'Evan Call', 'One Last Adventure'),
    (4, 1, 1, 1, FALSE, TRUE, 'milet', 'Anytime Anywhere');


-- Insert some sample song sources
INSERT INTO SongSources (id, song_id, owner_id, youtube_id, spotify_id, apple_m_id, youtube_link, spotify_link, apple_m_link) VALUES
    (1, 1, 1, '-jGBp5HBLFs', '', '', 'https://youtu.be/-jGBp5HBLFs', '', ''),
    (2, 2, 1, 'sSmK6-O-0gk', '', '', 'https://youtu.be/sSmK6-O-0gk', '', ''),
    (3, 3, 1, 'kpQ2PdluABQ', '', '', 'https://youtu.be/kpQ2PdluABQ?list=PLRW80bBvVD3XSBlbe3M0dkxpD0QkCTe8a', '', ''),
    (4, 4, 1, '7pmd0kt3FOs', '', '', 'https://youtu.be/7pmd0kt3FOs', '', '');


-- Insert some sample song episodes
INSERT INTO EpisodeSeasonSongs (id, song_id, season, episode) VALUES
    (1, 1, 1, 1),
    (2, 1, 1, 2),
    (3, 2, 1, 1),
    (4, 3, 1, 1),
    (5, 4, 1, 1),
    (6, 4, 1, 2);
