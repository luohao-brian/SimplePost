package handler

import (
	"strconv"

	"github.com/dinever/golf"
	"github.com/luohao-brian/SimplePosts/app/model"
	"github.com/luohao-brian/SimplePosts/app/utils"
)

func AdminHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	m := new(model.Messages)
	m.GetUnreadMessages()
	ctx.Loader("admin").Render("home.html", map[string]interface{}{
		"Title":    "仪表盘",
		"Statis":   model.NewStatis(ctx.App),
		"User":     u,
		"Messages": m,
	})
}

func ProfileHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	ctx.Loader("admin").Render("profile.html", map[string]interface{}{
		"Title": "用户详情",
		"User":  u,
	})
}

func ProfileChangeHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	if u.Email != ctx.Request.FormValue("email") && u.UserEmailExist() {
		ctx.JSON(map[string]interface{}{"status": "error", "msg": "A user with that email address already exists."})
		return
	}
	u.Name = ctx.Request.FormValue("name")
	u.Slug = ctx.Request.FormValue("slug")
	u.Email = ctx.Request.FormValue("email")
	u.Website = ctx.Request.FormValue("url")
	u.Bio = ctx.Request.FormValue("bio")
	err := u.Update()
	if err != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    err.Error(),
		})
	}
	ctx.JSON(map[string]interface{}{"status": "success"})
}

func PostCreateHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	p := model.NewPost()
	ctx.Loader("admin").Render("edit_post.html", map[string]interface{}{
		"Title": "编辑文章",
		"Post":  p,
		"User":  u,
	})
}

func PostSaveHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	p := model.NewPost()
	id := ctx.Param("id")
	idInt, _ := strconv.Atoi(id)
	p.Id = int64(idInt)
	p.UpdateFromRequest(ctx.Request)
	p.CreatedBy = u.Id
	p.UpdatedBy = u.Id
	p.IsPage = false
	p.Hits = 1
	p.AllowComment = true
	p.IsPublished = true
	tags := model.GenerateTagsFromCommaString(ctx.Request.FormValue("tag"))
	var e error
	e = p.Save(tags...)
	if e != nil {
		ctx.SendStatus(400)

		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    e.Error(),
		})
		return
	}
	ctx.JSON(map[string]interface{}{
		"status":  "success",
		"content": p,
	})
}

func ContentSaveHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	id := ctx.Param("id")
	p := new(model.Post)
	idInt, _ := strconv.Atoi(id)
	p.Id = int64(idInt)
	p.GetPostById()
	p.UpdateFromRequest(ctx.Request)
	p.Html = utils.Markdown2Html(p.Markdown)
	p.UpdatedBy = u.Id
	p.Hits = 1
	p.AllowComment = true
	p.IsPublished = true
	tags := model.GenerateTagsFromCommaString(ctx.Request.FormValue("tag"))
	var e error
	e = p.Save(tags...)
	if e != nil {
		ctx.SendStatus(400)
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    e.Error(),
		})
		return
	}
	ctx.JSON(map[string]interface{}{
		"status":  "success",
		"content": p,
	})
}

func AdminPostHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	p := ctx.Request.FormValue("page")
	var page int
	if p == "" {
		page = 1
	} else {
		page, _ = strconv.Atoi(p)
	}
	posts := new(model.Posts)
	pager, err := posts.GetPostList(int64(page), 10, false, false, "created_at DESC")
	if err != nil {
		panic(err)
	}
	ctx.Loader("admin").Render("posts.html", map[string]interface{}{
		"Title": "文章列表",
		"Posts": posts,
		"User":  u,
		"Pager": pager,
	})
}

func ContentEditHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	id := ctx.Param("id")
	postId, _ := strconv.Atoi(id)
	p := &model.Post{Id: int64(postId)}
	err := p.GetPostById()
	if p == nil || err != nil {
		ctx.Redirect("/admin/posts/")
		return
	}
	ctx.Loader("admin").Render("edit_post.html", map[string]interface{}{
		"Title": "编辑文章",
		"Post":  p,
		"User":  u,
	})
}

func ContentRemoveHandler(ctx *golf.Context) {
	id := ctx.Param("id")
	postId, _ := strconv.Atoi(id)
	err := model.DeletePostById(int64(postId))
	if err != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
		})
	} else {
		ctx.JSON(map[string]interface{}{
			"status": "success",
		})
	}
}

func PageCreateHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	p := model.NewPost()
	ctx.Loader("admin").Render("edit_post.html", map[string]interface{}{
		"Title": "编辑文章",
		"Post":  p,
		"User":  u,
	})
}

func AdminPageHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	p := ctx.Request.FormValue("page")
	var page int
	if p == "" {
		page = 1
	} else {
		page, _ = strconv.Atoi(p)
	}
	posts := new(model.Posts)
	pager, err := posts.GetPostList(int64(page), 10, true, false, `created_at`)
	if err != nil {
		panic(err)
	}
	ctx.Loader("admin").Render("pages.html", map[string]interface{}{
		"Title": "单页列表",
		"Pages": posts,
		"User":  u,
		"Pager": pager,
	})
}

func PageSaveHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	p := model.NewPost()
	p.Id = 0
	if !model.PostChangeSlug(ctx.Request.FormValue("slug")) {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    "The slug of this post has conflicts with another post."})
		return
	}
	p.UpdateFromRequest(ctx.Request)
	p.Html = utils.Markdown2Html(p.Markdown)
	p.CreatedBy = u.Id
	p.UpdatedBy = u.Id
	p.IsPage = true
	p.Hits = 1
	p.AllowComment = true
	p.IsPublished = true
	tags := model.GenerateTagsFromCommaString(ctx.Request.FormValue("tag"))
	var e error
	e = p.Save(tags...)
	if e != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    e.Error(),
		})
		return
	}
	ctx.JSON(map[string]interface{}{
		"status":  "success",
		"content": p,
	})
}

func SettingViewHandler(ctx *golf.Context) {
	user, _ := ctx.Session.Get("user")
	ctx.Loader("admin").Render("setting.html", map[string]interface{}{
		"Title":      "系统设置",
		"User":       user,
		"Custom":     model.GetCustomSettings(),
		"Navigators": model.GetNavigators(),
		"Oss":        model.GetOssSetting(),
	})
}

func SettingUpdateHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	var err error
	ctx.Request.ParseForm()
	for key, value := range ctx.Request.Form {
		s := model.NewSetting(key, value[0], "")
		s.CreatedBy = u.Id
		if err = s.Save(); err != nil {
			panic(err)
			ctx.JSON(map[string]interface{}{
				"status": "error",
				"msg":    err.Error(),
			})
		}
	}
	ctx.JSON(map[string]interface{}{
		"status": "success",
	})
}

func SettingCustomHandler(ctx *golf.Context) {
	ctx.Request.ParseForm()
	keys := ctx.Request.Form["key"]
	values := ctx.Request.Form["value"]
	for i, k := range keys {
		if len(k) < 1 {
			continue
		}
		model.NewSetting(k, values[i], "custom").Save()
	}
	ctx.JSON(map[string]interface{}{
		"status": "success",
	})
}

func SettingNavHandler(ctx *golf.Context) {
	ctx.Request.ParseForm()
	labels := ctx.Request.Form["label"]
	urls := ctx.Request.Form["url"]
	model.SetNavigators(labels, urls)
	ctx.JSON(map[string]interface{}{
		"status": "success",
	})
}

//OSS
func SettingOssHandler(ctx *golf.Context) {
	ctx.Request.ParseForm()
	accesskey := ctx.Request.FormValue("accesskey")
	secretkey := ctx.Request.FormValue("secretkey")
	endpoint := ctx.Request.FormValue("endpoint")
	bucket := ctx.Request.FormValue("bucket")
	model.SetOssSetting(accesskey, secretkey, endpoint, bucket)
	ctx.JSON(map[string]interface{}{
		"status": "success",
	})
}

func AdminPasswordPage(ctx *golf.Context) {
	user, _ := ctx.Session.Get("user")
	ctx.Loader("admin").Render("password.html", map[string]interface{}{
		"Title": "修改密码",
		"User":  user,
	})
}

func AdminPasswordChange(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	oldPassword := ctx.Request.FormValue("old")
	if !u.CheckPassword(oldPassword) {
		ctx.SendStatus(400)
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    "Old password incorrect.",
		})
		return
	}
	newPassword := ctx.Request.FormValue("new")
	confirm := ctx.Request.FormValue("confirm")
	if newPassword != confirm {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    "Old password incorrect.",
		})
		return
	}
	u.ChangePassword(newPassword)
	ctx.JSON(map[string]interface{}{
		"status": "success",
	})
}
