package model

import "github.com/dinever/golf"

// A Statis hold info about the site stats, including things like number of
// comments, posts, pages, etc.
type Statis struct {
	Comments int64
	Posts    int64
	Pages    int64
	Files    int
	Version  int
	Sessions int
}

// NewStatis returns a new Statis, pulling most info from the DB. The
// application argumen is required however to determine the number of active
// sessions.
func NewStatis(app *golf.Application) *Statis {
	s := new(Statis)
	postNum, _ := GetNumberOfPosts(false, false)
	pageNum, _ := GetNumberOfPosts(true, false)
	commentNum, _ := GetNumberOfComments()

	s.Posts = postNum
	s.Pages = pageNum
	s.Sessions = app.SessionManager.Count()
	s.Comments = commentNum
	// s.Pages = len(contentsIndex["page"])
	// s.Files = len(files)
	// s.Version = GetVersion().Version
	// s.Readers = len(GetReaders())
	return s
}
