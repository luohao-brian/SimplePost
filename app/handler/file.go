package handler

import (
	"io"
	"io/ioutil"
	"log"
	"os"
	"path"
	"strings"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"
	"github.com/dinever/golf"
	"github.com/luohao-brian/SimplePosts/app/model"
	"github.com/luohao-brian/SimplePosts/app/utils"
)

func OssSetting() *oss.Bucket {
	client, err := oss.New(model.Endpoint, model.Accesskey, model.Secretkey)
	if err != nil {
		log.Fatal("OSS设置错误", err)
	}
	bucket, err := client.Bucket(model.Bucket)
	if err != nil {
		log.Fatal("空间打开失败", err)
	}
	return bucket
}
func FileViewHandler(ctx *golf.Context) {
	user, _ := ctx.Session.Get("user")
	uploadDir, _ := ctx.App.Config.GetString("upload_dir", "upload")
	uploadDir = path.Clean(uploadDir)
	ctx.Request.ParseForm()
	dir, err := ctx.Query("dir")
	dir = path.Clean(dir)
	var (
		ParentDir  string
		IsChildDir bool
	)
	if err == nil && dir != uploadDir {
		IsChildDir = true
		ParentDir = path.Join(dir, "..")
	} else {
		IsChildDir = false
		dir = uploadDir
	}
	var files []*model.File
	if model.CheckSafe(dir, uploadDir) {
		files = model.GetFileList(dir)
	} else {
		ctx.Abort(403)
		return
	}
	ctx.Loader("admin").Render("files.html", map[string]interface{}{
		"Title":      "Files",
		"Files":      files,
		"User":       user,
		"CurrentDir": dir,
		"IsChildDir": IsChildDir,
		"ParentDir":  ParentDir,
	})
}

//从aliyun删除文件
func delete_aliyun(filename string) {
	bucket := OssSetting()
	err := bucket.DeleteObject(filename)
	if err != nil {
		log.Fatal("删除失败", err)
	}
}
func FileRemoveHandler(ctx *golf.Context) {
	p := ctx.Request.FormValue("path")
	filename := strings.Split(p, "/")[1]
	uploadDir, _ := ctx.App.Config.GetString("upload_dir", "upload")
	if model.CheckSafe(p, uploadDir) {
		delete_aliyun(filename)
		err := model.RemoveFile(p)
		if err != nil {
			panic(err)
		}
	} else {
		ctx.Abort(403)
		return
	}
	ctx.JSON(map[string]interface{}{
		"status": "success",
	})
}

//上传aliyun
func upload_aliyun(filename string, body io.Reader) {
	bucket := OssSetting()
	err := bucket.PutObject(filename, body)
	if err != nil {
		log.Fatal("文件上传失败", err)
	}
}

func FileUploadHandler(ctx *golf.Context) {
	req := ctx.Request
	req.ParseMultipartForm(32 << 20)
	f, h, e := req.FormFile("file")
	if e != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    e.Error(),
		})
		return
	}
	data, _ := ioutil.ReadAll(f)
	maxSize, _ := ctx.App.Config.GetInt("app.upload_size", 1024*1024*10)
	defer func() {
		f.Close()
		data = nil
		h = nil
	}()
	upload_aliyun(h.Filename, f)
	if len(data) >= maxSize {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    "File size should be smaller than 10MB.",
		})
		return
	}
	fileExt, _ := ctx.App.Config.GetString("app.upload_files", ".jpg,.png,.gif,.zip,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx")
	if !strings.Contains(fileExt, path.Ext(h.Filename)) {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    "Only supports documents, images and zip files.",
		})
		return
	}
	uploadDir, _ := ctx.App.Config.GetString("upload_dir", "upload")
	Url := model.CreateFilePath(uploadDir, h.Filename)
	e = ioutil.WriteFile(Url, data, os.ModePerm)
	if e != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    e.Error(),
		})
		return
	}
	fi, err := os.Stat(Url)
	if err != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    e.Error(),
		})
		return
	}

	fSize := utils.FileSize(fi.Size())
	fileModTime := fi.ModTime()
	fModTime := utils.DateFormat(&fileModTime, "%Y-%m-%d %H:%M")
	ctx.JSON(map[string]interface{}{
		"status": "success",
		"file": map[string]interface{}{
			"url":  Url,
			"name": h.Filename,
			"size": fSize,
			"type": "File",
			"time": fModTime,
		},
	})
}
