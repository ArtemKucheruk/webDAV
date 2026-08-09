-- name: GetAllUserFiles :many
select filename from files where user_id = $1;
