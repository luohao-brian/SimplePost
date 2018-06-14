package model

import (
	"database/sql"
	"github.com/luohao-brian/SimplePosts/app/utils"
)

var db *sql.DB

// A Row contains data that can be Scanned into a variable.
type Row interface {
	Scan(dest ...interface{}) error
}

func Initialize() error {
	if err := initConnection(); err != nil {
		return err
	}
	if err := createTableIfNotExist(); err != nil {
		return err
	}

	if count, _ := GetNumberOfPosts(false, false); count < 1 {
		if err := createWelcomeData(); err != nil {
			return err
		}
	}
	return nil
}

func initConnection() error {
	var err error
	db, err = Conn()
	if err != nil {
		return err
	}
	return nil
}

func createTableIfNotExist() error {
	for i := 0; i < len(TableSchemas); i++ {
		if _, err := db.Exec(TableSchemas[i]); err != nil {
			return err
		}
	}
	checkBlogSettings()
	return nil
}

func checkBlogSettings() {
	SetSettingIfNotExists("theme", "default", "blog")
	SetSettingIfNotExists("title", "My Blog", "blog")
	SetSettingIfNotExists("description", "Awesome blog created by SimplePosts.", "SimplePosts")
}

const samplePostContent = `
欢迎使用SimplePosts!这是你的第一个帖子。您可以在管理面板（/admin/posts/）中找到它.

欢迎使用SimplePosts使用Markdown语法进行后期编辑：

# 1号标题

## 2号标题

### 其他标题

**加粗**, ` + "`" + `字符` + "`" + `.

图片测试:

![Logo](http://ygjs-static-hz.oss-cn-beijing.aliyuncs.com/images/2018-03-22/TIM%E6%88%AA%E5%9B%BE20180322174243.png)

无序列表:

  * apples
  * oranges
  * pears

有序列表:

  1. apples
  2. oranges
  3. pears


引用:

> Sportsman delighted improving dashwoods gay instantly happiness six. Ham now amounted absolute not mistaken way pleasant whatever. At an these still no dried folly stood thing. Rapid it on hours hills it seven years. If polite he active county in spirit an. Mrs ham intention promotion engrossed assurance defective. Confined so graceful building opinions whatever trifling in. Insisted out differed ham man endeavor expenses. At on he total their he songs. Related compact effects is on settled do.

代码片段:

` + "```" + `go
package main

import "fmt"

func main() {
	fmt.Println("hello world")
}
` + "```" + `

超链接:

An [example link](http://example.com).

表格:

|        | Cost to x | Cost to y | Cost to z |
|--------|-----------|-----------|-----------|
| From x | 0         | 3         | 4         |
| From y | 3         | 0         | 6         |
| From z | 4         | 6         | 0         |
`

func createWelcomeData() error {
	var err error
	p := NewPost()
	p.Title = "欢迎使用SimplePosts!"
	p.Slug = "欢迎使用SimplePosts"
	p.Markdown = samplePostContent
	p.Html = utils.Markdown2Html(p.Markdown)
	p.AllowComment = true
	p.Category = ""
	p.CreatedBy = 0
	p.UpdatedBy = 0
	p.IsPublished = true
	p.IsPage = false
	tags := GenerateTagsFromCommaString("Welcome, SimplePosts")
	err = p.Save(tags...)
	if err != nil {
		return err
	}

	return nil
}
