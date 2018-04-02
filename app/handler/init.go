package handler

import (
	"os"
	"path/filepath"

	"github.com/dinever/golf"
	"github.com/luohao-brian/SimplePosts/app/model"
	"github.com/luohao-brian/SimplePosts/app/utils"
)

func Initialize(app *golf.Application) *golf.Application {
	app.Config.Set("app/static_dir", "static")
	app.Config.Set("app.log_dir", "tmp/log")
	app.Config.Set("app/upload_dir", "upload")
	upload_dir, _ := app.Config.GetString("app/upload_dir", "upload")
	registerMiddlewares(app)
	registerFuncMap(app)
	RegisterFunctions(app)
	theme := model.GetSettingValue("theme")
	app.View.SetTemplateLoader("base", "view")
	app.View.SetTemplateLoader("admin", filepath.Join("view", "admin"))
	app.View.SetTemplateLoader("theme", filepath.Join("view", theme))
	app.Static("/upload/", upload_dir)
	app.Static("/admin/", filepath.Join("view", "admin", "assets", "dist"))
	app.Static("/", filepath.Join("view", theme, "assets", "dist"))
	app.SessionManager = golf.NewMemorySessionManager()
	app.Error(404, NotFoundHandler)
	registerAdminURLHandlers(app)
	registerHomeHandler(app)
	registerAPIHandler(app)

	return app
}

func registerFuncMap(app *golf.Application) {
	app.View.FuncMap["DateFormat"] = utils.DateFormat
	app.View.FuncMap["Now"] = utils.Now
	app.View.FuncMap["Html2Str"] = utils.Html2Str
	app.View.FuncMap["FileSize"] = utils.FileSize
	app.View.FuncMap["Setting"] = model.GetSettingValue
	app.View.FuncMap["Navigator"] = model.GetNavigators
	app.View.FuncMap["Md2html"] = utils.Markdown2HtmlTemplate
}

func registerMiddlewares(app *golf.Application) {
	app.Use(
		golf.LoggingMiddleware(os.Stdout),
		golf.RecoverMiddleware,
		golf.SessionMiddleware,
	)
}

func registerAdminURLHandlers(app *golf.Application) {
	authChain := golf.NewChain(AuthMiddleware)
	app.Get("/login/", AuthLoginPageHandler)
	app.Post("/login/", AuthLoginHandler)
	app.Get("/signup/", AuthSignUpPageHandler)
	app.Post("/signup/", AuthSignUpHandler)
	app.Get("/logout/", AuthLogoutHandler)
	app.Get("/admin/", authChain.Final(AdminHandler))
	app.Get("/admin/profile/", authChain.Final(ProfileHandler))
	app.Post("/admin/profile/", authChain.Final(ProfileChangeHandler))
	app.Get("/admin/editor/post/", authChain.Final(PostCreateHandler))
	app.Post("/admin/editor/post/", authChain.Final(PostSaveHandler))
	app.Get("/admin/posts/", authChain.Final(AdminPostHandler))
	app.Get("/admin/editor/:id/", authChain.Final(ContentEditHandler))
	app.Post("/admin/editor/:id/", authChain.Final(ContentSaveHandler))
	app.Delete("/admin/editor/:id/", authChain.Final(ContentRemoveHandler))
	app.Get("/admin/password/", authChain.Final(AdminPasswordPage))
	app.Post("/admin/password/", authChain.Final(AdminPasswordChange))
}

func registerHomeHandler(app *golf.Application) {
	statsChain := golf.NewChain()
	app.Get("/", statsChain.Final(HomeHandler))
	app.Get("/page/:page/", HomeHandler)
	//TAGS
	app.Get("/tags/", TagsHandler)
	app.Get("/tag/:tag/", TagHandler)
	app.Get("/tag/:tag/page/:page/", TagHandler)
	app.Get("/feed/", RssHandler)
	app.Get("/sitemap.xml", SiteMapHandler)
	app.Get("/:slug/", statsChain.Final(ContentHandler))
}

func registerAPIHandler(app *golf.Application) {
	routes := map[string]map[string]interface{}{}
	routes["GET"] = map[string]interface{}{}
	routes["POST"] = map[string]interface{}{}
	routes["PUT"] = map[string]interface{}{}
	routes["DELETE"] = map[string]interface{}{}
	registerJWTHandlers(app, routes)
	registerPostHandlers(app, routes)
	registerTagHandlers(app, routes)
	registerUserHandlers(app, routes)
	registerCommentsHandlers(app, routes)
	app.Get("/api", APIDocumentationHandler(routes))
}
