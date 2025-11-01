package main

import (
	"bytes"
	"database/sql"
	"fmt"
	"html/template"
	"log"
	"os"
	"os/exec"
	"strings"

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
			"status": get_site_status(db),
			"visitor": add_visitor(db),
			"sys_statuses": template.HTML(render_sys_statuses(db)),
			"im_intos": template.HTML(render_im_intos(db, 3)),
			"changelog": template.HTML(render_changelog()),
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

/* Site Stats */
type SiteStats struct {
	ID 			uint	`gorm:"primaryKey"`
	Visits  uint  
	Status  string
}

func (SiteStats) TableName() string {
	return "site_stats"
}

/* sys_status */
type SysStatus struct {
	URL			string	`gorm:"primaryKey"`
	Name 		string
	Status 	string 	
}

func (SysStatus) TableName() string {
	return "sys_status"
}

func get_sys_statuses(db *gorm.DB) ([]SysStatus, error) {
	var statuses []SysStatus
	result := db.Find(&statuses)
	if result.Error != nil {
		return nil, result.Error
	}

	return statuses, nil
}

/* im_into */
type ImInto struct {
	ID			uint	`gorm:"primaryKey"`
	Text 		string
}

func (ImInto) TableName() string {
	return "im_into"
}

func get_first_im_into(db *gorm.DB, limit int) ([]ImInto, error) {
	var items []ImInto
	result := db.Order("id DESC").Limit(limit).Find(&items);
	if result.Error != nil {
		return nil, result.Error
	}

	return items, nil
}



func connect_to_db() (*gorm.DB, *sql.DB, error) {
	DB_NAME := os.Getenv("DB_NAME")
	DB_USER := os.Getenv("DB_USER")
	DB_HOST := os.Getenv("DB_HOST")
	DB_PASS := os.Getenv("DB_PASS")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?charset=utf8mb4&parseTime=True&loc=Local", 
											DB_USER, DB_PASS, DB_HOST, DB_NAME)

	log.Default().Println(dsn)

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
	err := db.AutoMigrate(&SiteStats{}, &SysStatus{}, &ImInto{})
	if err != nil {
		return err
	}

	err = db.FirstOrCreate(&SiteStats{}, SiteStats{ID: 1}).Error
	if err != nil {
		return err
	}
	
	return err
}

/* ===== Main functions ===== */

func add_visitor(db *gorm.DB) uint {
	result := db.Model(&SiteStats{}).Where("id = ?", 1).
        UpdateColumn("visits", gorm.Expr("visits + ?", 1))
	if result.Error != nil {
		return 0
	}

	var s SiteStats
	db.First(&s, 1)

	return s.Visits
}

func render_sys_statuses(db *gorm.DB) string {
	var b strings.Builder
	statuses, err := get_sys_statuses(db)
	if err != nil {
		return "Waiting for servers..."
	}
	for _, status := range statuses {
		fmt.Fprintf(&b,
			"<div class='sys-container'>%s: [ <span class='sys-%s'>%s</span> ]</div>", 
			status.Name, status.Status, status.Status)	
	}

	return b.String()
}

func get_site_status(db *gorm.DB) string {	
	var s SiteStats
	db.First(&s, 1)

	return s.Status
}

func render_im_intos(db *gorm.DB, limit int) string {
	var b strings.Builder
	items, err := get_first_im_into(db, limit)
	if err != nil {
		return "Nothing"
	}
	for _, im_into := range items {
		fmt.Fprintf(&b, "<p clss='im-into'>%s</p>", im_into.Text)
	}

	return b.String()
}

type Commit struct {
	Date 		string
	Message	string 
}

func getGitCommits() ([]Commit, error) {
	cmd := exec.Command("git", "log", "--pretty=format:%ad|%s", "--date=format:%d.%m.%y")
	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		return nil, err
	}

	raw := out.String()
	if strings.TrimSpace(raw) == "" {
		return nil, nil
	}

	lines := strings.Split(strings.TrimSpace(raw), "\n")
	var commits []Commit
	for _, line := range lines {
		parts := strings.Split(line, "|")
		if len(parts) == 2 {
			commits = append(commits, Commit{parts[0], parts[1]})
		}
	}


	return commits, nil

}

func render_changelog() string {
	var b strings.Builder
	commits, err := getGitCommits()
	if err != nil {
		return "Nothing here :)"
	}

	for _, commit := range commits {
		fmt.Fprintf(&b, 
				"<div class='commit'><small><strong>%s</strong>: %s</small></div>",
				commit.Date, commit.Message)
	}

	return b.String()
}
