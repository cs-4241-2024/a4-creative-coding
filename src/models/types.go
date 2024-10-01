package models

import "time"

type User struct {
	ID           uint32
	Username     string
	PasswordHash string
	Salt         string
	Created      time.Time
}

type Recording struct {
	ID            uint32
	UserID        uint32
	Transcription string
	DateTime      time.Time
}
