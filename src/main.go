package main

import (
	"fmt"
	"os"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"github.com/liamsnow/cs4241-assignment4/views"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// database
	ConnectDB()

	// templ render
	ginHtmlRender := r.HTMLRender
	r.HTMLRender = &HTMLTemplRenderer{FallbackHtmlRenderer: ginHtmlRender}

	// cookies
	store := cookie.NewStore([]byte(secret))
	store.Options(sessions.Options{Path: "/", MaxAge: 86400 * 7, HttpOnly: false})
	r.Use(sessions.Sessions("vd_session", store))

	// statics
	r.Static("/assets", "../assets")

	// public
	r.GET("/login", func(c *gin.Context) {
		x := NewRenderer(c.Request.Context(), http.StatusOK, views.Base(views.Auth(false), false, ""))
		c.Render(http.StatusOK, x)
	})
	r.GET("/signup", func(c *gin.Context) {
		x := NewRenderer(c.Request.Context(), http.StatusOK, views.Base(views.Auth(true), false, ""))
		c.Render(http.StatusOK, x)
	})
	r.POST("/login", PostLogin)
	r.POST("/signup", PostSignup)
	r.POST("/logout", PostLogout)

	// private
	authorized := r.Group("/")
	authorized.Use(AuthRequired)
	{
		authorized.GET("/", func(c *gin.Context) {
			currentYear := time.Now().Year()
			currentMonth := time.Now().Month()
			c.Redirect(http.StatusSeeOther, fmt.Sprintf("/month/%d/%d", currentYear, currentMonth))
		})
		authorized.GET("/month/:year/:month", GetMonth)
		authorized.GET("/day/:day", GetDay)
		authorized.GET("/recording/:id", GetRecording)
		authorized.POST("/delete/:id", DeleteRecording)
		authorized.POST("/save", SaveRecording)
	}

	r.Run(":8080")
}

func SaveRecording(c *gin.Context) {
	userID, err := GetCurrentUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	datetime, err := time.Parse(time.RFC3339, c.PostForm("datetime"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid datetime format"})
		return
	}

	recordingID, err := SaveRecordingDB(userID, datetime)
	if err != nil || recordingID == -1 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save recording to database"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get file from form"})
		return
	}

	uploadPath := filepath.Join("..", "recordings", fmt.Sprintf("%d", userID), fmt.Sprintf("%d.wav", recordingID))
	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save uploaded file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recording saved successfully", "recordingID": recordingID})
}

func DeleteRecording(c *gin.Context) {
	userID, _ := GetCurrentUserID(c)
	recordingID, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	err := DeleteRecordingDB(userID, uint32(recordingID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Recording deleted successfully",
	})
}

func GetRecording(c *gin.Context) {
	userID, _ := GetCurrentUserID(c)
	recordingID, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	owns, err := DoesOwnRecordingDB(userID, uint32(recordingID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err,
		})
		return
	}
	if owns {
		filePath := filepath.Join("..", "recordings", fmt.Sprintf("%d", userID), fmt.Sprintf("%d.wav", recordingID))

		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Recording file not found",
			})
			return
		}

		c.File(filePath)
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User does not own that recording!",
		})
	}
}

func GetMonth(c *gin.Context) {
	username, _ := GetCurrentUsername(c)
	userID, _ := GetCurrentUserID(c)

	year, err1 := strconv.ParseUint(c.Param("year"), 10, 32)
	month, err1 := strconv.ParseUint(c.Param("month"), 10, 32)
	if err1 != nil {
		c.Redirect(http.StatusSeeOther, "/")
		return
	}

	summary, err2 := GetMonthSummaryDB(userID, uint32(year), uint32(month))
	if err2 != nil {
		c.Redirect(http.StatusSeeOther, "/")
		return
	}

	x := NewRenderer(c.Request.Context(), http.StatusOK, views.Base(views.Month(summary, GetCalendar(uint32(year), uint32(month)), uint32(year), uint32(month)), true, username))
	c.Render(http.StatusOK, x)
}

func GetCalendar(year, month uint32) [5][7]time.Time {
	firstOfMonth := time.Date(int(year), time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	start := firstOfMonth.AddDate(0, 0, -int(firstOfMonth.Weekday()))
	var calendar [5][7]time.Time
	for week := 0; week < 5; week++ {
		for day := 0; day < 7; day++ {
			calendar[week][day] = start.AddDate(0, 0, week*7+day)
		}
	}
	return calendar
}

func GetDay(c *gin.Context) {
	username, _ := GetCurrentUsername(c)
	userID, _ := GetCurrentUserID(c)

	date, err1 := time.Parse("2006-01-02", c.Param("day"))
	if err1 != nil {
		c.Redirect(http.StatusSeeOther, "/")
		return
	}

	summary, err2 := GetDaySummaryDB(userID, date)
	if err2 != nil {
		c.Redirect(http.StatusSeeOther, "/")
		return
	}

	x := NewRenderer(c.Request.Context(), http.StatusOK, views.Base(views.Day(summary, date), true, username))
	c.Render(http.StatusOK, x)
}
