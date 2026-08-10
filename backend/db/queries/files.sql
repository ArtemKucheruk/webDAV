-- name: GetAllUserFiles :many
select filename from files where user_id = $1;


-- name: DeleteFile :one
delete from files where id = $1 and user_id = $2
returning filename;

-- name: GetFileName :one
select filename from files where id = $1;
