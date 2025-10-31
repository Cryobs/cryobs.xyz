package main

import (
	"github.com/gin-gonic/gin"
)


func main() {
	r := gin.Default()

	r.Static("/static", "./static")
	r.LoadHTMLGlob("templates/*.html")

	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", gin.H {
			"title": "something",
			"status": "Rewriting to go",
			"visitor": "?",
		})

	})

	r.Run(":8080")
}


