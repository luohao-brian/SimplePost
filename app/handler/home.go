package handler

import (
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/dinever/golf"
	"github.com/luohao-brian/SimplePosts/app/model"
	"github.com/luohao-brian/SimplePosts/app/utils"
)

func RegisterFunctions(app *golf.Application) {
	app.View.FuncMap["Tags"] = getAllTags
	app.View.FuncMap["RecentPosts"] = getRecentPosts
}

func HomeHandler(ctx *golf.Context) {
	p := ctx.Param("page")

	var page int
	if p == "" {
		page = 1
	} else {
		page, _ = strconv.Atoi(p)
	}
	posts := new(model.Posts)
	pager, err := posts.GetPostList(int64(page), 10, false, true, "published_at DESC")
	if err != nil {
		ctx.Abort(404)
		return
	}
	// theme := model.GetSetting("site_theme")
	data := map[string]interface{}{
		"Title": "Home",
		"Posts": posts,
		"Pager": pager,
	}
	//	updateSidebarData(data)
	ctx.Loader("theme").Render("index.html", data)
}

func ContentHandler(ctx *golf.Context) {
	slug := ctx.Param("slug")
	post := new(model.Post)
	err := post.GetPostBySlug(slug)
	if err != nil || !post.IsPublished {
		ctx.Abort(404)
		return
	}
	post.Hits++
	data := map[string]interface{}{
		"Title":   post.Title,
		"Post":    post,
		"Content": post,
	}
	if post.IsPage {
		ctx.Loader("theme").Render("page.html", data)
	} else {
		ctx.Loader("theme").Render("article.html", data)
	}
}
func TagsHandler(ctx *golf.Context) {
	tags := new(model.Tags)
	posts := new(model.Posts)
	err := tags.GetAllTags()
	if err != nil {
		ctx.Abort(404)
		return
	}
	err = posts.GetAllPosts()
	if err != nil {
		ctx.Abort(404)
		return
	}
	data := map[string]interface{}{
		"Tags":  tags,
		"Posts": posts,
	}
	ctx.Loader("theme").Render("tags.html", data)
}

func SiteMapHandler(ctx *golf.Context) {
	baseUrl := model.GetSettingValue("site_url")
	posts := new(model.Posts)
	_, _ = posts.GetPostList(1, 50, false, true, "published_at DESC")
	navigators := model.GetNavigators()
	now := utils.Now().Format(time.RFC3339)

	articleMap := make([]map[string]string, posts.Len())
	for i := 0; i < posts.Len(); i++ {
		m := make(map[string]string)
		m["Link"] = strings.Replace(baseUrl+posts.Get(i).Url(), baseUrl+"/", baseUrl, -1)
		m["Created"] = posts.Get(i).PublishedAt.Format(time.RFC3339)
		articleMap[i] = m
	}

	navMap := make([]map[string]string, 0)
	for _, n := range navigators {
		m := make(map[string]string)
		if n.Url == "/" {
			continue
		}
		if strings.HasPrefix(n.Url, "/") {
			m["Link"] = strings.Replace(baseUrl+n.Url, baseUrl+"/", baseUrl, -1)
		} else {
			m["Link"] = n.Url
		}
		m["Created"] = now
		navMap = append(navMap, m)
	}

	ctx.SetHeader("Content-Type", "application/rss+xml;charset=UTF-8")
	ctx.Loader("base").Render("sitemap.xml", map[string]interface{}{
		"Title":      model.GetSettingValue("site_title"),
		"Link":       baseUrl,
		"Created":    now,
		"Posts":      articleMap,
		"Navigators": navMap,
	})
}

func TagHandler(ctx *golf.Context) {
	p := ctx.Param("page")

	var page int
	if p == "" {
		page = 1
	} else {
		page, _ = strconv.Atoi(p)
	}

	t := ctx.Param("tag")
	tagSlug, _ := url.QueryUnescape(t)
	tag := &model.Tag{Slug: tagSlug}
	err := tag.GetTagBySlug()
	if err != nil {
		NotFoundHandler(ctx)
		return
	}
	posts := new(model.Posts)
	pager, err := posts.GetPostsByTag(tag.Id, int64(page), 5, true)
	data := map[string]interface{}{
		"Posts": posts,
		"Pager": pager,
		"Tag":   tag,
		"Title": tag.Name,
	}
	ctx.Loader("theme").Render("tag.html", data)
}

func RssHandler(ctx *golf.Context) {
	baseUrl := model.GetSettingValue("site_url")
	posts := new(model.Posts)
	_, _ = posts.GetPostList(1, 20, false, true, "published_at DESC")
	articleMap := make([]map[string]string, posts.Len())
	for i := 0; i < posts.Len(); i++ {
		m := make(map[string]string)
		m["Title"] = posts.Get(i).Title
		m["Link"] = posts.Get(i).Url()
		m["Author"] = posts.Get(i).Author().Name
		m["Desc"] = posts.Get(i).Excerpt()
		m["Created"] = posts.Get(i).CreatedAt.Format(time.RFC822)
		articleMap[i] = m
	}
	ctx.SetHeader("Content-Type", "text/xml; charset=utf-8")

	ctx.Loader("base").Loader("base").Render("rss.xml", map[string]interface{}{
		"Title":   model.GetSettingValue("site_title"),
		"Link":    baseUrl,
		"Desc":    model.GetSettingValue("site_description"),
		"Created": utils.Now().Format(time.RFC822),
		"Posts":   articleMap,
	})
}
