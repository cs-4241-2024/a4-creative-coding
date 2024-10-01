package main

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/liamsnow/cs4241-assignment4/models"
)

var db *sql.DB

func ConnectDB() {
	var err error
	db, err = sql.Open("sqlite3", "./db.db")
	if err != nil {
		log.Fatal(err)
	}

	makeTables()
}

func makeTables() {
	// make users table
	_, err := db.Exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)
	if err != nil {
		log.Fatal(err)
	}

	// make exercises table
	_, err = db.Exec(`
      CREATE TABLE IF NOT EXISTS recordings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        transcription TEXT DEFAULT '',
        datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `)
	if err != nil {
		log.Fatal(err)
	}
}

func MakeUserDB(username, password string) (uint32, error) {
	salt := generateSalt()
	passwordHash := hashPassword(password, salt)

	result, err := db.Exec(`
        INSERT INTO users (username, password_hash, salt)
        VALUES (?, ?, ?)
    `, username, passwordHash, salt)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return uint32(id), nil
}

func GetUsernameDB(userID uint32) (string, error) {
	var username string
	err := db.QueryRow("SELECT username FROM users WHERE id = ?", userID).Scan(&username)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("no user found with ID %d", userID)
		}
		return "", fmt.Errorf("error querying database: %v", err)
	}
	return username, nil
}

func TryLoginDB(username, password string) (bool, uint64, error) {
	var storedHash string
	var salt string
	var userID uint64

	err := db.QueryRow("SELECT id, password_hash, salt FROM users WHERE username = ?", username).Scan(&userID, &storedHash, &salt)
	if err != nil {
		if err == sql.ErrNoRows {
			// not found
			return false, 0, nil
		}
		// database error
		return false, 0, err
	}

	providedHash := hashPassword(password, salt)

	if storedHash == providedHash {
		return true, userID, nil
	}
	return false, 0, nil
}

func generateSalt() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		log.Fatal(err)
	}
	return hex.EncodeToString(b)
}

func hashPassword(password, salt string) string {
	hash := sha256.New()
	hash.Write([]byte(password + salt))
	return hex.EncodeToString(hash.Sum(nil))
}

func SaveRecordingDB(userID uint32, datetime time.Time) (int32, error) {
	result, err := db.Exec(`
      INSERT INTO recordings (user_id, datetime)
      VALUES (?, ?)
  `, userID, datetime)
	if err != nil {
		return -1, err
	}

	recordingID, err := result.LastInsertId()
	if err != nil {
		return -1, err
	}

	return int32(recordingID), nil
}

func DeleteRecordingDB(userID, recordingID uint32) error {
  owns, err := DoesOwnRecordingDB(userID, recordingID)
  if err != nil {
    return err
  }
  if !owns {
    return fmt.Errorf("user does not own recording!")
  }

	_, err = db.Exec("DELETE FROM recordings WHERE id = ?", recordingID)
	if err != nil {
		return err
	}

	filePath := filepath.Join("recordings", fmt.Sprintf("%d", userID), fmt.Sprintf("%d.mp3", recordingID))
	return os.Remove(filePath)
}

func DoesOwnRecordingDB(userID, recordingID uint32) (bool, error) {
	var dbUserID uint32
	err := db.QueryRow("SELECT user_id FROM recordings WHERE id = ?", recordingID).Scan(&dbUserID)
	if err != nil {
		return false, err
	}

	return dbUserID == userID, nil
}

func GetMonthSummaryDB(userID, year, month uint32) (map[time.Time]int, error) {
	rows, err := db.Query(`
        SELECT date(datetime) as date, COUNT(*) as count
        FROM recordings
        WHERE user_id = ? AND strftime('%Y', datetime) = ? AND strftime('%m', datetime) = ?
        GROUP BY date(datetime)
    `, userID, fmt.Sprintf("%04d", year), fmt.Sprintf("%02d", month))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	summary := make(map[time.Time]int)
	for rows.Next() {
		var date string
		var count int
		if err := rows.Scan(&date, &count); err != nil {
			return nil, err
		}

		parsedDate, err := time.Parse("2006-01-02", date)
		if err != nil {
			return nil, fmt.Errorf("failed to parse date: %v", err)
		}

		summary[parsedDate] = count
	}

	return summary, rows.Err()
}

func GetDaySummaryDB(userID uint32, date time.Time) ([]models.Recording, error) {
	rows, err := db.Query(`
        SELECT id, transcription, datetime
        FROM recordings
        WHERE user_id = ? AND DATE(datetime) = ?
    `, userID, date.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var recordings []models.Recording
	for rows.Next() {
		var r models.Recording
		if err := rows.Scan(&r.ID, &r.Transcription, &r.DateTime); err != nil {
			return nil, err
		}
		r.UserID = userID
		recordings = append(recordings, r)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return recordings, nil
}
