package utils

import "fmt"

// A Pager contains info used to handle pagination.
type Pager struct {
	Current   int64
	Size      int64
	Total     int64
	Pages     int64
	PageSlice []int64
	Begin     int64
	End       int64
	Prev      int64
	Next      int64
	IsPrev    bool
	IsNext    bool
	IsValid   bool
}

// NewPager returns a new Pager, with the given options. It will panic if the
// pager size is less than zero.
func NewPager(page, size, total int64) *Pager {
	if size <= 0 {
		panic(fmt.Errorf("Pager size can not be less than 0"))
	}
	pager := new(Pager)
	pager.Current = page
	pager.Size = size
	pager.Total = total
	pager.Pages = total / size
	pager.IsValid = true
	if total%size > 0 {
		pager.Pages += 1
	} else if total == 0 {
		pager.Pages = 1
	}

	pager.PageSlice = make([]int64, pager.Pages)
	var i int64
	for i = 1; i <= pager.Pages; i++ {
		pager.PageSlice[i-1] = i
	}

	pager.Begin = (page - 1) * size
	if page < 1 || pager.Begin > pager.Total {
		pager.IsValid = false
	}

	pager.End = page * size
	if pager.End > pager.Total {
		pager.End = pager.Total
	}

	pager.Prev = pager.Current - 1
	pager.IsPrev = true
	if pager.Prev < 1 {
		pager.Prev = 1
		pager.IsPrev = false
	}

	pager.Next = pager.Current + 1
	pager.IsNext = true
	if pager.Next > pager.Pages {
		pager.Next = pager.Pages
		pager.IsNext = false
	}
	return pager
}
