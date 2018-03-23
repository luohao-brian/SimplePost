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
	//	AppPath, err := filepath.Abs(filepath.Dir(os.Args[0]))
	//	if err != nil {
	//		panic(err)
	//	}
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
