package utils

import (
	"fmt"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"
)

func ExampleDateFormat() {
	t := time.Date(2009, time.November, 10, 23, 0, 0, 0, time.UTC)
	fmt.Println(DateFormat(&t, "%Y-%m-%d %H:%M"))
	// Output: 2009-11-10 23:00
}

func TestDateFormat(t *testing.T) {
	Convey("Format the date", t, func() {
		t := time.Date(2009, time.November, 10, 23, 0, 0, 0, time.UTC)
		dateFmt := DateFormat(&t, "%Y-%m-%d %H:%M")

		Convey("Test DateFormat", func() {
			So(dateFmt, ShouldEqual, "2009-11-10 23:00")
		})
	})

	Convey("It should not panic when trying to format nil dates", t, func() {
		dateFmt := DateFormat(nil, "%Y-%m-%d %H:%M")
		Convey("Test DateFormat", func() {
			So(dateFmt, ShouldEqual, "")
		})
	})
}
