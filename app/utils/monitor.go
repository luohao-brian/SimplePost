package utils

import (
	"fmt"
	"runtime"
	"time"
)

type monitorStats struct {
	NumGoroutine int
	MemAllocated string
	MemMalloc    string
	MemTotal     string
	MemSys       string
	MemHeap      string
	MemGc        string
	LastGcTime   string
}

// ReadMemStats reads and returns various stats from the runtime. Used for
// displaying runtime info is the admin dashboard.
func ReadMemStats() *monitorStats {
	m := new(runtime.MemStats)
	runtime.ReadMemStats(m)
	ms := new(monitorStats)
	ms.NumGoroutine = runtime.NumGoroutine()
	ms.MemAllocated = FileSize(int64(m.Alloc))
	ms.MemTotal = FileSize(int64(m.TotalAlloc))
	ms.MemSys = FileSize(int64(m.Sys))
	ms.MemHeap = FileSize(int64(m.HeapAlloc))
	ms.MemMalloc = FileSize(int64(m.Mallocs))
	ms.LastGcTime = fmt.Sprintf("%.1fs", float64(time.Now().UnixNano()-int64(m.LastGC))/1000/1000/1000)
	ms.MemGc = FileSize(int64(m.NextGC))
	return ms
}
