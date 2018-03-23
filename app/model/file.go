package model

import (
	"io/ioutil"
	"os"
	"path"
	"strings"
	"time"
)

// A File is a file, along with a URL and last modified time.
type File struct {
	os.FileInfo
	Url     string
	ModTime *time.Time
}

var (
	Accesskey string
	Secretkey string
	Bucket    string
	Endpoint  string
)

// CheckSafe checks if the directory is a child directory of base, to make sure
// that GetFileList won't read any folder other than the upload folder.
func CheckSafe(directory string, base string) bool {
	directory = path.Clean(directory)
	dirs := strings.Split(directory, "/")
	return dirs[0] == base
}

// GetFileList returns a slice of all Files in the given directory.
func GetFileList(directory string) []*File {
	files := make([]*File, 0)
	fileInfoList, _ := ioutil.ReadDir(directory)
	for i := len(fileInfoList) - 1; i >= 0; i-- {
		if fileInfoList[i].Name() == ".DS_Store" {
			continue
		}
		file := new(File)
		file.FileInfo = fileInfoList[i]
		file.Url = path.Join(directory, fileInfoList[i].Name())
		t := fileInfoList[i].ModTime()
		file.ModTime = &t
		files = append(files, file)
	}
	return files
}

// RemoveFile removes a file with the given path.
func RemoveFile(path string) error {
	return os.RemoveAll(path)
}

// CreateFilePath creates a filepath from the given directory and name,
// returning the name of the newly created filepath.
func CreateFilePath(dir string, name string) string {
	os.MkdirAll(dir, os.ModePerm)
	return path.Join(dir, name)
}
