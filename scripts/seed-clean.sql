-- Remove seed data (reverse order)
DELETE FROM "SongSources" WHERE song_id IN (
  SELECT s.id FROM "Songs" s
  JOIN "Films" f ON s.film_id = f.id
  WHERE f.slug IN ('inception', 'interstellar', 'the-matrix', 'breaking-bad')
);
DELETE FROM "Songs" WHERE film_id IN (
  SELECT id FROM "Films" WHERE slug IN ('inception', 'interstellar', 'the-matrix', 'breaking-bad')
);
DELETE FROM "Films" WHERE slug IN ('inception', 'interstellar', 'the-matrix', 'breaking-bad');
DELETE FROM "Users" WHERE username IN ('admin', 'testuser');
DELETE FROM "UserType" WHERE title IN ('Admin', 'User');
