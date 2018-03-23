package utils

import (
	. "github.com/smartystreets/goconvey/convey"
	"testing"
)

func TestPager(t *testing.T) {
	Convey("Test the first page", t, func() {
		pager := NewPager(1, 5, 13)

		Convey("Test Begin", func() {
			So(pager.Begin, ShouldEqual, 0)
		})
		Convey("Test End", func() {
			So(pager.End, ShouldEqual, 5)
		})
		Convey("Test Current", func() {
			So(pager.Current, ShouldEqual, 1)
		})
		Convey("Test Size", func() {
			So(pager.Size, ShouldEqual, 5)
		})
		Convey("Test Total", func() {
			So(pager.Total, ShouldEqual, 13)
		})
		Convey("Test Pages", func() {
			So(pager.Pages, ShouldEqual, 3)
		})
		Convey("Test Prev", func() {
			So(pager.Prev, ShouldEqual, 1)
		})
		Convey("Test Next", func() {
			So(pager.Next, ShouldEqual, 2)
		})
		Convey("Test IsPrev", func() {
			So(pager.IsPrev, ShouldBeFalse)
		})
		Convey("Test IsNext", func() {
			So(pager.IsNext, ShouldBeTrue)
		})
		Convey("Test IsValid", func() {
			So(pager.IsValid, ShouldBeTrue)
		})
	})

	Convey("Test the second page", t, func() {
		pager := NewPager(2, 5, 13)

		Convey("Test Begin", func() {
			So(pager.Begin, ShouldEqual, 5)
		})
		Convey("Test End", func() {
			So(pager.End, ShouldEqual, 10)
		})
		Convey("Test Current", func() {
			So(pager.Current, ShouldEqual, 2)
		})
		Convey("Test Size", func() {
			So(pager.Size, ShouldEqual, 5)
		})
		Convey("Test Total", func() {
			So(pager.Total, ShouldEqual, 13)
		})
		Convey("Test Pages", func() {
			So(pager.Pages, ShouldEqual, 3)
		})
		Convey("Test Prev", func() {
			So(pager.Prev, ShouldEqual, 1)
		})
		Convey("Test Next", func() {
			So(pager.Next, ShouldEqual, 3)
		})
		Convey("Test IsPrev", func() {
			So(pager.IsPrev, ShouldBeTrue)
		})
		Convey("Test IsNext", func() {
			So(pager.IsNext, ShouldBeTrue)
		})
		Convey("Test IsValid", func() {
			So(pager.IsValid, ShouldBeTrue)
		})
	})

	Convey("Test the last page", t, func() {
		pager := NewPager(3, 5, 13)

		Convey("Test Begin", func() {
			So(pager.Begin, ShouldEqual, 10)
		})
		Convey("Test End", func() {
			So(pager.End, ShouldEqual, 13)
		})
		Convey("Test Current", func() {
			So(pager.Current, ShouldEqual, 3)
		})
		Convey("Test Size", func() {
			So(pager.Size, ShouldEqual, 5)
		})
		Convey("Test Total", func() {
			So(pager.Total, ShouldEqual, 13)
		})
		Convey("Test Pages", func() {
			So(pager.Pages, ShouldEqual, 3)
		})
		Convey("Test Prev", func() {
			So(pager.Prev, ShouldEqual, 2)
		})
		Convey("Test Next", func() {
			So(pager.Next, ShouldEqual, 3)
		})
		Convey("Test IsPrev", func() {
			So(pager.IsPrev, ShouldBeTrue)
		})
		Convey("Test IsNext", func() {
			So(pager.IsNext, ShouldBeFalse)
		})
		Convey("Test IsValid", func() {
			So(pager.IsValid, ShouldBeTrue)
		})
	})

	Convey("Test invalid page", t, func() {
		pager := NewPager(4, 5, 13)

		Convey("Test IsValid", func() {
			So(pager.IsValid, ShouldBeFalse)
		})
	})

	Convey("Test invalid page 2", t, func() {
		pager := NewPager(0, 5, 13)

		Convey("Test IsValid", func() {
			So(pager.IsValid, ShouldBeFalse)
		})
	})

	Convey("Test boundary", t, func() {
		pager := NewPager(1, 5, 5)

		So(pager.IsNext, ShouldBeFalse)
		So(pager.IsPrev, ShouldBeFalse)
	})

	Convey("Test pager with 0 entries", t, func() {
		pager := NewPager(1, 5, 0)

		So(pager.Pages, ShouldEqual, 1)
		So(pager.Current, ShouldEqual, 1)

		So(pager.IsNext, ShouldBeFalse)
		So(pager.IsPrev, ShouldBeFalse)
	})
}
