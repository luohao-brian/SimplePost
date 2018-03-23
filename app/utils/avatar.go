package utils

import (
	"crypto/md5"
	"fmt"
)

// Gravatar generates a Gravatar link with a given email and size. Images
// are always square, so we only accept a single argument for the size.
func Gravatar(email string, size string) string {
	u := "http://1.gravatar.com/avatar/"
	u += encodeAvatarEmail(email) + "?s=" + size
	return u
}

// encode user password by sha1 with salt string from config.
func encodeAvatarEmail(email string) string {
	h := md5.New()
	h.Write([]byte(email))
	bs := h.Sum(nil)
	return fmt.Sprintf("%x", bs)
}
