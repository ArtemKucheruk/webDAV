-- name: CreateUser :one
insert into users (email, password_hash)
  values ($1, $2)
  returning id;

-- name: GetUserByEmail :one
select * from users where email = $1 and active = true;

-- name: GetActiveUserByEmail :one
select * from users where email = $1 and active = true;

-- name: GetUserById :one 
select * from users where id = $1;

-- name: ChangeUserEmail :exec
update users set email = $1 where id = $2;

-- name: ChangeUserPassword :exec
update users set password_hash = $1 where id = $2;


-- name: DeactivateUser :exec
update users set active = false where id = $1;

