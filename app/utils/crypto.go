package utils

import (
	"crypto/sha1"
	"fmt"
	"io"
)

// Sha1 creates a SHA1 checksum of the given string.
func Sha1(raw string) string {
	t := sha1.New()
	io.WriteString(t, raw)
	return fmt.Sprintf("%x", t.Sum(nil))
}
