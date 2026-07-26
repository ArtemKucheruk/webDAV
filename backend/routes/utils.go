package routes

import (
	"github.com/labstack/echo/v5"
)

type Router interface {
	Group(prefix string, middleware ...echo.MiddlewareFunc) (group *echo.Group)
}

func Group(r Router, prefix string, fn func(r *echo.Group)) {
	g := r.Group(prefix)
	fn(g)
}
