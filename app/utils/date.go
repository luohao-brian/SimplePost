package utils

import (
	"strings"
	"time"
)

var conversion = map[rune]string{
	/*stdLongMonth      */ 'B': "January",
	/*stdMonth          */ 'b': "Jan",
	// stdNumMonth       */ 'm': "1",
	/*stdZeroMonth      */ 'm': "01",
	/*stdLongWeekDay    */ 'A': "Monday",
	/*stdWeekDay        */ 'a': "Mon",
	// stdDay            */ 'd': "2",
	// stdUnderDay       */ 'd': "_2",
	/*stdZeroDay        */ 'd': "02",
	/*stdHour           */ 'H': "15",
	// stdHour12         */ 'I': "3",
	/*stdZeroHour12     */ 'I': "03",
	// stdMinute         */ 'M': "4",
	/*stdZeroMinute     */ 'M': "04",
	// stdSecond         */ 'S': "5",
	/*stdZeroSecond     */ 'S': "05",
	/*stdLongYear       */ 'Y': "2006",
	/*stdYear           */ 'y': "06",
	/*stdPM             */ 'p': "PM",
	// stdpm             */ 'p': "pm",
	/*stdTZ             */ 'Z': "MST",
	// stdISO8601TZ      */ 'z': "Z0700",  // prints Z for UTC
	// stdISO8601ColonTZ */ 'z': "Z07:00", // prints Z for UTC
	/*stdNumTZ          */ 'z': "-0700", // always numeric
	// stdNumShortTZ     */ 'b': "-07",    // always numeric
	// stdNumColonTZ     */ 'b': "-07:00", // always numeric
	/* nonStdMilli		 */ 'L': ".000",
}

// DateFormat implements formatted printing for time.Time values. It is similar
// to fmt's printf utility, although the verbs are different.
//
// The verbs:
//		%B		the full month, ex: "January"
//		%b		an abbreviation of the month, ex: "Jan"
//		%m 		the month as a number, with the leading zero included, ex: "01"
//		%A		the full weekday, ex: "Monday"
//		%a		an abbreviation of the weekday, ex: "Mon"
//		%d		the day, with the leading zero included, ex: "31"
//		%H		the hour, in 24 hour time, with the leading zero included, ex: "15"
//		%I		the hour, in 12 hour time, with the leading zero included, ex: "08"
//		%M		the minute, with the leading zero included, ex: "42"
//		%S		the second, with the leading zero included, ex: "58"
//		%Y		the full year, ex: "2016"
//		%y		the last two digits of the year, ex: "16"
//		%p		the meridiem, or more simply put, AM or PM, ex: "AM"
//		%Z		letters representing the timezone, ex: "MST"
//		%z		numbers representing the timezone, ex: "-0700"
//		%L		milliseconds, ex: ".000"
func DateFormat(t *time.Time, format string) string {
	if t == nil {
		return ""
	}

	retval := make([]byte, 0, len(format))
	for i, ni := 0, 0; i < len(format); i = ni + 2 {
		ni = strings.IndexByte(format[i:], '%')
		if ni < 0 {
			ni = len(format)
		} else {
			ni += i
		}
		retval = append(retval, []byte(format[i:ni])...)
		if ni+1 < len(format) {
			c := format[ni+1]
			if c == '%' {
				retval = append(retval, '%')
			} else {
				if layoutCmd, ok := conversion[rune(c)]; ok {
					retval = append(retval, []byte(t.Format(layoutCmd))...)
				} else {
					retval = append(retval, '%', c)
				}
			}
		} else {
			if ni < len(format) {
				retval = append(retval, '%')
			}
		}
	}
	return string(retval)
}

// Now returns the current time.
func Now() *time.Time {
	t := time.Now()
	return &t
}
