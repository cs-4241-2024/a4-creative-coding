package main

import (
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

const userkey = "user"

var secret = []byte("secret") // FIXME

// reference https://github.com/Depado/gin-auth-example/blob/main/main.go
// FIXME security?
func AuthRequired(c *gin.Context) {
	session := sessions.Default(c)
	user := session.Get(userkey)
	if user == nil {
		c.Redirect(http.StatusSeeOther, "/login")
		c.Abort()
		return
	}
	c.Next()
}

func GetCurrentUsername(c *gin.Context) (string, error) {
	userID, _ := GetCurrentUserID(c)
	username, _ := GetUsernameDB(userID)
	return username, nil
}

func GetCurrentUserID(c *gin.Context) (uint32, error) {
	session := sessions.Default(c)
	userIDVal := session.Get(userkey)

	if userIDVal == nil {
		return 0, fmt.Errorf("user not found in session")
	}

	var userID uint32

	switch v := userIDVal.(type) {
	case uint32:
		userID = v
	case uint64:
		if v > math.MaxUint32 {
			return 0, fmt.Errorf("user ID %d is too large for uint32", v)
		}
		userID = uint32(v)
	case int:
		if v < 0 || v > math.MaxUint32 {
			return 0, fmt.Errorf("user ID %d is out of range for uint32", v)
		}
		userID = uint32(v)
	case int64:
		if v < 0 || v > math.MaxUint32 {
			return 0, fmt.Errorf("user ID %d is out of range for uint32", v)
		}
		userID = uint32(v)
	case float64:
		if v < 0 || v > math.MaxUint32 || math.Floor(v) != v {
			return 0, fmt.Errorf("user ID %f is invalid for uint32", v)
		}
		userID = uint32(v)
	case string:
		parsedID, err := strconv.ParseUint(v, 10, 32)
		if err != nil {
			return 0, fmt.Errorf("failed to parse user ID string: %v", err)
		}
		userID = uint32(parsedID)
	default:
		return 0, fmt.Errorf("unsupported user ID type: %T", userIDVal)
	}

	return userID, nil
}

func PostLogin(c *gin.Context) {
	session := sessions.Default(c)
	username := c.PostForm("username")
	password := c.PostForm("password")

	// validate
	if strings.Trim(username, " ") == "" || strings.Trim(password, " ") == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parameters can't be empty"})
		return
	}

	success, userID, err := TryLoginDB(username, password)
	if !success || err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication failed"})
		return
	}

	session.Set(userkey, userID)
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}
	// c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Successfully authenticated user %d", userID) })
	c.Redirect(http.StatusSeeOther, "/")
}

func PostSignup(c *gin.Context) {
	session := sessions.Default(c)
	username := c.PostForm("username")
	password := c.PostForm("password")

	// validate
	if strings.Trim(username, " ") == "" || strings.Trim(password, " ") == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parameters can't be empty", "success": false})
		return
	}

	userID, err := MakeUserDB(username, password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to make user", "success": false})
		return
	}

	session.Set(userkey, userID)
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session", "success": false})
		return
	}
	// c.JSON(http.StatusOK, gin.H{"message": "Successfully authenticated user", "success": true })
	c.Redirect(http.StatusSeeOther, "/")
}

func PostLogout(c *gin.Context) {
	session := sessions.Default(c)
	user := session.Get(userkey)
	if user == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session token"})
		return
	}
	session.Delete(userkey)
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}
	c.Redirect(http.StatusSeeOther, "/login")
}
