package model

import (
	"log"
	"strings"
	"time"

	"github.com/luohao-brian/SimplePosts/app/utils"
	"github.com/russross/meddler"
)

const stmtGetUnreadMessages = `SELECT * FROM messages WHERE is_read = 0 ORDER BY created_at DESC LIMIT 10 OFFSET 0`

var (
	messageGenerator map[string]func(v interface{}) string
)

func init() {
	messageGenerator = make(map[string]func(v interface{}) string)
	messageGenerator["backup"] = generateBackupMessage
}

// A Message is a simple bit of info, used to alert the admin on the admin
// panel about things like new comments, etc.
type Message struct {
	Id        int        `meddler:"id,pk"`
	Type      string     `meddler:"type"`
	Data      string     `meddler:"data"`
	IsRead    bool       `meddler:"is_read"`
	CreatedAt *time.Time `meddler:"created_at"`
}

// Messages is a slice of "Message"s
type Messages []*Message

// Get returns the message at the given index inside Messages.
func (m Messages) Get(i int) *Message {
	return m[i]
}

// NewMessage creates a new message.
func NewMessage(tp string, data interface{}) *Message {
	mData := messageGenerator[tp](data)
	if mData == "" {
		log.Printf("[Error]: message generator returns empty")
		return nil
	}
	return &Message{
		Type:      tp,
		Data:      mData,
		CreatedAt: utils.Now(),
		IsRead:    false,
	}
}

// Insert saves a message to the DB.
func (m *Message) Insert() error {
	err := meddler.Insert(db, "messages", m)
	return err
}

// SetMessageGenerator maps a message generator's name to a function.
func SetMessageGenerator(name string, fn func(v interface{}) string) {
	messageGenerator[name] = fn
}

// GetUnreadMessages gets all unread messages from the DB.
func (m *Messages) GetUnreadMessages() {
	err := meddler.QueryAll(db, m, stmtGetUnreadMessages)
	if err != nil {
		panic(err)
	}
	return
}

func generateBackupMessage(co interface{}) string {
	str := co.(string)
	if strings.HasPrefix(str, "[0]") {
		return "Failed to back up the site: " + strings.TrimPrefix(str, "[0]") + "."
	}
	return "The site is successfully backed up at: " + strings.TrimPrefix(str, "[1]")
}
