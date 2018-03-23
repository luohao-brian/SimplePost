package model

import (
	"database/sql"
	"encoding/json"
	"io"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	_ "github.com/go-sql-driver/mysql"
	"github.com/luohao-brian/SimplePosts/app/utils"
)

type DbConfig struct {
	Db_host string `json:db_host`
	Db_port int    `json:db_port`
	Db_user string `json:db_user`
	Db_pass string `json:db_pass`
	Db_name string `json:db_name`
}

var (
	Driver string = "mysql"
	DbName string = "db.json"
	Dbfile string = "db.lock"
)

func AppPath(filename string) string {
	//获取工作目录
	workPath, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	confPath := filepath.Join(workPath, filename)
	return confPath
}

func ConfigSetting() *DbConfig {
	config := DbConfig{}
	path := AppPath(DbName)
	dat, err := ioutil.ReadFile(path)
	if err != nil {
		log.Fatal("Errorf:", err)
	}
	err = json.Unmarshal(dat, &config)
	if err != nil {
		log.Fatal("Errorf:", err)
	}
	return &config
}
func Conn() (db *sql.DB, err error) {
	config := ConfigSetting()
	db, err = sql.Open(Driver, config.Db_user+":"+config.Db_pass+"@/"+config.Db_name+"?parseTime=true")
	if err != nil {
		log.Fatal("数据库连接失败")
		return nil, err
	}
	return db, err
}

func DbExists() bool {
	//返回为nil,文件存在
	_, err := os.Stat(AppPath(Dbfile))
	if err == nil {
		return true
	}
	//如果 err 判断为true,文件不存在
	if os.IsNotExist(err) {
		CreateFile(Dbfile)
		return false
	}
	return false
}

func CreateFile(filename string) {
	writeString := "Dbfile create success"
	f, err := os.Create(filename)
	if err != nil {
		log.Fatal("create error")
	}
	_, err = io.WriteString(f, writeString)
	if err != nil {
		log.Fatal("写入失败")
	}
	f.Close()
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
	p.Title = "Welcome to SimplePosts!"
	p.Slug = "welcome-to-SimplePosts"
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

	c := NewComment()
	c.Author = "SimplePosts"
	c.Email = "dingpeixuan911@gmail.com"
	c.Website = "http://github.com/luohao-brian/SimplePosts"
	c.Content = "Welcome to SimplePosts! This is your first comment."
	c.Avatar = utils.Gravatar(c.Email, "50")
	c.PostId = p.Id
	c.Parent = int64(0)
	c.Ip = "127.0.0.1"
	c.UserAgent = "Mozilla"
	c.UserId = 0
	c.Approved = true
	c.Save()

	return nil
}
