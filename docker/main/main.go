package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	r := setup_router()

	/* Connect to DB */
	db, sqlDB, err := connect_to_db()
	if err != nil {
		log.Fatal(err)
	}
	defer sqlDB.Close()
	
	/* init DB */
	if err := init_db(db); err != nil {
		log.Fatal(err)
	}

	/* entry points */
	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", gin.H {
			"title": "something",
			"status": "Rewriting to go",
			"visitor": add_visitor(db),
		})

	})

	r.Run(":8080")
}

func setup_router() *gin.Engine {
	r := gin.Default()

	r.TrustedPlatform = gin.PlatformCloudflare

	r.Static("/static", "./static")
	r.LoadHTMLGlob("templates/*.html")

	return r
}

type site_stats struct {
	ID 			uint	`gorm:"primaryKey"`
	Visits  uint  
	Status  string
}

func connect_to_db() (*gorm.DB, *sql.DB, error) {
	DB_NAME := os.Getenv("DB_NAME")
	DB_USER := os.Getenv("DB_USER")
	DB_HOST := os.Getenv("DB_HOST")
	DB_PASS := os.Getenv("DB_PASS")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?charset=utf8mb4&parseTime=True&loc=Local", 
											DB_USER, DB_PASS, DB_HOST, DB_NAME)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		return nil, nil, err
	}

	sqlDB, err := db.DB()	
	if err != nil {
		return nil, nil, err
	}

	if err := sqlDB.Ping(); err != nil {
		return nil, nil, err
	}

	return db, sqlDB, nil
}

func init_db(db *gorm.DB) error {
	if err := db.AutoMigrate(&site_stats{}); err != nil {
		return err
	}

	return db.FirstOrCreate(&site_stats{}, site_stats{ID: 1}).Error
}

func add_visitor(db *gorm.DB) uint {
	result := db.Model(&site_stats{}).Where("id = ?", 1).
        UpdateColumn("visits", gorm.Expr("visits + ?", 1))
	if result.Error != nil {
		log.Fatal(result.Error)
	}

	var s site_stats
	db.First(&s, 1)

	return s.Visits
}
