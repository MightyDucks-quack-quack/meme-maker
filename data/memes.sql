DROP TABLE IF EXISTS memes;

CREATE TABLE memes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  url VARCHAR(100),
  width NUMERIC(3, 1),
  height NUMERIC(3, 1),
  box_count NUMERIC(2, 1)
);