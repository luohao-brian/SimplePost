package handler

import (
	"github.com/dinever/golf"
)

func NotFoundHandler(ctx *golf.Context, data ...map[string]interface{}) {
	var renderData map[string]interface{}
	if len(data) == 0 {
		renderData = make(map[string]interface{})
	} else {
		renderData = data[0]
	}
	ctx.Loader("theme").Render("404.html", renderData)
}
