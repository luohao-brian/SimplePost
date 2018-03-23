package utils

import (
	"regexp"
	"strings"
)

var (
	regexEmail   *regexp.Regexp
	regexASCII   *regexp.Regexp
	regexEnglish *regexp.Regexp
	regexURL     *regexp.Regexp
)

func init() {
	regexEmail, _ = regexp.Compile(`(?i)[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,6}`)
	regexASCII, _ = regexp.Compile(`^[a-zA-Z0-9-]+$`)
	regexEnglish, _ = regexp.Compile(`^[a-zA-Z]+$`)
	regexURL, _ = regexp.Compile(`(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?`)
}

// IsEmptyString returns whether or not a string is empty.
func IsEmptyString(str string) bool {
	return len(str) == 0
}

// IsEmail returns whether or not a string resembles an email.
func IsEmail(str string) bool {
	return regexEmail.MatchString(str)
}

// IsURL returns whether or not a string is a URL.
func IsURL(str string) bool {
	return regexURL.MatchString(str)
}

// IsLonger returns whether or not the string is longer than the given length.
func IsLonger(str string, length int) bool {
	return len(str) > length
}

// IsShorter returns whether or not the string is shorter than the given
// length.
func IsShorter(str string, length int) bool {
	return len(str) < length
}

// IsASCII returns whether or not the string contains only ASCII characters.
func IsASCII(str string) bool {
	return regexASCII.MatchString(str)
}

// IsEnglish returns whether or not the string is in English by looking at the
// character set.
func IsEnglish(str string) bool {
	return regexEnglish.MatchString(str)
}

// IsContain returns whether or not the second string exists within the first
// string.
func IsContain(str string, contain string) bool {
	return strings.Contains(str, contain)
}
