package model

import (
	"database/sql"
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
	if !DbExists() {
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
	for i := 0; i < len(SqlDatas); i++ {
		if _, err := db.Exec(SqlDatas[i]); err != nil {
			return err
		}
	}
	checkBlogSettings()
	return nil
}

func checkBlogSettings() {
	SetSettingIfNotExists("theme", "hux-theme", "blog")
	SetSettingIfNotExists("title", "My Blog", "blog")
	SetSettingIfNotExists("description", "Awesome blog created by Dingo.", "blog")
}
