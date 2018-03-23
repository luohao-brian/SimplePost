package utils

import (
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
)

// FileSize returns the file size as a string, formatted in the way people
// usually see filenames, ex: "1MB", "3KB", "60B".
func FileSize(size int64) string {
	s := float64(size)
	if s > 1024*1024 {
		return fmt.Sprintf("%.1f M", s/(1024*1024))
	}
	if s > 1024 {
		return fmt.Sprintf("%.1f K", s/1024)
	}
	return fmt.Sprintf("%f B", s)
}

// IsFile returns whether or not a given path name has a corresponding file
// name.
func IsFile(path string) bool {
	f, e := os.Stat(path)
	if e != nil {
		return false
	}
	if f.IsDir() {
		return false
	}
	return true
}

// IsDir returns whether or not a given path name has a corresponding directory
// name.
func IsDir(path string) bool {
	f, e := os.Stat(path)
	if e != nil {
		return false
	}
	return f.IsDir()
}

// CopyFile copies the source file to the destination file. If the destination
// file does not yet exist, it will create a new file there.
func CopyFile(source string, dest string) (err error) {
	sf, err := os.Open(source)
	if err != nil {
		return err
	}
	defer sf.Close()
	df, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer df.Close()
	_, err = io.Copy(df, sf)
	if err == nil {
		si, err := os.Stat(source)
		if err != nil {
			err = os.Chmod(dest, si.Mode())
		}

	}

	return
}

// CopyDir recursively copies a directory tree, attempting to preserve
// permissions. The source directory must exist, but destination directory must
// *not* exist.
func CopyDir(source string, dest string) (err error) {

	// get properties of source dir
	fi, err := os.Stat(source)
	if err != nil {
		return err
	}

	if !fi.IsDir() {
		return &copyError{"Source is not a directory"}
	}

	// ensure dest dir does not already exist

	_, err = os.Open(dest)
	if !os.IsNotExist(err) {
		return &copyError{"Destination already exists"}
	}

	// create dest dir

	err = os.MkdirAll(dest, fi.Mode())
	if err != nil {
		return err
	}

	entries, err := ioutil.ReadDir(source)

	for _, entry := range entries {

		sfp := source + "/" + entry.Name()
		dfp := dest + "/" + entry.Name()
		if entry.IsDir() {
			err = CopyDir(sfp, dfp)
			if err != nil {
				log.Printf("[Error]: %v", err)
			}
		} else {
			// perform copy
			err = CopyFile(sfp, dfp)
			if err != nil {
				log.Printf("[Error]: %v", err)
			}
		}

	}
	return
}

type copyError struct {
	s string
}

// Error returns the error message defined in the copy error as a string.
func (e *copyError) Error() string {
	return e.s
}
