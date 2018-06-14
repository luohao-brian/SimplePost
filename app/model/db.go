package model

import (
	"database/sql"
	"encoding/json"
	"fmt"
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
	Driver       string = "mysql"
	DbConfigFile string = "db.json"
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
	path := AppPath(DbConfigFile)
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
	db, err = sql.Open(Driver, fmt.Sprintf("%s:%s@tcp(%s:%d)/?parseTime=true",
		config.Db_user,
		config.Db_pass,
		config.Db_host,
		config.Db_port))
	if err != nil {
		log.Fatal("数据库连接失败")
		return nil, err
	}
	_, err = db.Exec("CREATE DATABASE IF NOT EXISTS " + config.Db_name)
	if err != nil {
		log.Fatal("数据库创建失败")
		return nil, err
	}
	db.Close()

	db, err = sql.Open(Driver, fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true",
		config.Db_user,
		config.Db_pass,
		config.Db_host,
		config.Db_port,
		config.Db_name))
	if err != nil {
		log.Fatal("数据库连接失败")
		return nil, err
	}

	return db, err
}
