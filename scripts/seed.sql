-- Seed data for development

-- Ensure default user types exist
INSERT INTO "UserType" (title, rights) VALUES
  ('Admin', '{"authorization":1,"edit_users":1,"add_users":1}')
ON CONFLICT DO NOTHING;

INSERT INTO "UserType" (title, rights) VALUES
  ('User', '{}')
ON CONFLICT DO NOTHING;

-- Films with real TMDB IDs
INSERT INTO "Films" (slug, api_tmdb_id, tv_series) VALUES
  ('inception', 27205, false),
  ('interstellar', 157336, false),
  ('the-matrix', 603, false),
  ('breaking-bad', 1396, true)
ON CONFLICT DO NOTHING;

-- Admin user: admin / admin123
INSERT INTO "Users" (username, email, password, token, user_type_id, user_is_active)
SELECT 'admin', 'admin@knowasong.local', '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5Y7G5C5Yn5q5v5q5v5q5v5q', 'seed-token-admin', (SELECT id FROM "UserType" WHERE title = 'Admin' LIMIT 1), 1
WHERE NOT EXISTS (SELECT 1 FROM "Users" WHERE username = 'admin');

-- Test user: testuser / test123
INSERT INTO "Users" (username, email, password, token, user_type_id, user_is_active)
SELECT 'testuser', 'test@knowasong.local', '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5Y7G5C5Yn5q5v5q5v5q5v5q', 'seed-token-test', (SELECT id FROM "UserType" WHERE title = 'User' LIMIT 1), 1
WHERE NOT EXISTS (SELECT 1 FROM "Users" WHERE username = 'testuser');

-- Songs for Inception
INSERT INTO "Songs" (owner_id, film_id, season, is_opening, is_ending, author, title)
SELECT u.id, f.id, 0, true, false, 'Hans Zimmer', 'Time'
FROM "Users" u, "Films" f WHERE u.username = 'admin' AND f.slug = 'inception';

INSERT INTO "Songs" (owner_id, film_id, season, is_opening, is_ending, author, title)
SELECT u.id, f.id, 0, false, true, 'Hans Zimmer', 'Dream Is Collapsing'
FROM "Users" u, "Films" f WHERE u.username = 'admin' AND f.slug = 'inception';

-- Songs for Interstellar
INSERT INTO "Songs" (owner_id, film_id, season, is_opening, is_ending, author, title)
SELECT u.id, f.id, 0, true, false, 'Hans Zimmer', 'First Step'
FROM "Users" u, "Films" f WHERE u.username = 'admin' AND f.slug = 'interstellar';

INSERT INTO "Songs" (owner_id, film_id, season, is_opening, is_ending, author, title)
SELECT u.id, f.id, 0, false, true, 'Hans Zimmer', 'No Time for Caution'
FROM "Users" u, "Films" f WHERE u.username = 'admin' AND f.slug = 'interstellar';

-- Songs for The Matrix
INSERT INTO "Songs" (owner_id, film_id, season, is_opening, is_ending, author, title)
SELECT u.id, f.id, 0, true, false, 'Don Davis', 'Main Title / Trinity Infinity'
FROM "Users" u, "Films" f WHERE u.username = 'admin' AND f.slug = 'the-matrix';

INSERT INTO "Songs" (owner_id, film_id, season, is_opening, is_ending, author, title)
SELECT u.id, f.id, 0, false, true, 'Don Davis', 'Wake Up'
FROM "Users" u, "Films" f WHERE u.username = 'admin' AND f.slug = 'the-matrix';

-- Songs for Breaking Bad (TV series with seasons)
INSERT INTO "Songs" (owner_id, film_id, season, is_opening, is_ending, author, title)
SELECT u.id, f.id, 1, true, false, 'Dave Porter', 'Breaking Bad Theme (Extended)'
FROM "Users" u, "Films" f WHERE u.username = 'admin' AND f.slug = 'breaking-bad';

INSERT INTO "Songs" (owner_id, film_id, season, is_opening, is_ending, author, title)
SELECT u.id, f.id, 1, false, true, 'Various', 'Crystal Blue Persuasion'
FROM "Users" u, "Films" f WHERE u.username = 'admin' AND f.slug = 'breaking-bad';

INSERT INTO "Songs" (owner_id, film_id, season, is_opening, is_ending, author, title)
SELECT u.id, f.id, 2, true, false, 'Dave Porter', 'Breaking Bad Theme (Extended)'
FROM "Users" u, "Films" f WHERE u.username = 'admin' AND f.slug = 'breaking-bad';

-- YouTube links for songs
INSERT INTO "SongSources" (song_id, owner_id, youtube_id, youtube_link)
SELECT s.id, u.id, 'H0_sF6f2LQU', 'https://youtube.com/watch?v=H0_sF6f2LQU'
FROM "Songs" s, "Users" u WHERE u.username = 'admin' AND s.title = 'Time';

INSERT INTO "SongSources" (song_id, owner_id, youtube_id, youtube_link)
SELECT s.id, u.id, 'Ua0Vlq2sX48', 'https://youtube.com/watch?v=Ua0Vlq2sX48'
FROM "Songs" s, "Users" u WHERE u.username = 'admin' AND s.title = 'Dream Is Collapsing';

INSERT INTO "SongSources" (song_id, owner_id, youtube_id, youtube_link)
SELECT s.id, u.id, '8yGkEGG28_s', 'https://youtube.com/watch?v=8yGkEGG28_s'
FROM "Songs" s, "Users" u WHERE u.username = 'admin' AND s.title = 'First Step';

INSERT INTO "SongSources" (song_id, owner_id, youtube_id, youtube_link)
SELECT s.id, u.id, 'm3lF2qEA2cw', 'https://youtube.com/watch?v=m3lF2qEA2cw'
FROM "Songs" s, "Users" u WHERE u.username = 'admin' AND s.title = 'No Time for Caution';

INSERT INTO "SongSources" (song_id, owner_id, youtube_id, youtube_link)
SELECT s.id, u.id, 'CvZhaR1_rLY', 'https://youtube.com/watch?v=CvZhaR1_rLY'
FROM "Songs" s, "Users" u WHERE u.username = 'admin' AND s.title = 'Wake Up';

INSERT INTO "SongSources" (song_id, owner_id, youtube_id, youtube_link)
SELECT s.id, u.id, '5kiSrs1FpQ8', 'https://youtube.com/watch?v=5kiSrs1FpQ8'
FROM "Songs" s, "Users" u WHERE u.username = 'admin' AND s.title = 'Breaking Bad Theme (Extended)';
