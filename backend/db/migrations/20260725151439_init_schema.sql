-- +goose Up
CREATE TABLE users (
  id SERIAL PRIMARY KEY
);




-- +goose Down
DROP TABLE users;
