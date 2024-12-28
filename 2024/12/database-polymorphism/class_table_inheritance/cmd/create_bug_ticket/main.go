package main

import (
	"context"
	"database-polymorphism/class_table_inheritance"
	"log"
)

func main() {

	repo := class_table_inheritance.NewTicketRepository(class_table_inheritance.DBConfig{
		Host:     "localhost",
		Port:     "3306",
		User:     "example",
		Password: "password",
	})

	bugTicket := class_table_inheritance.BugTicket{
		Title:       "title",
		Description: "description",
		BugReport:   "bug report",
	}

	if err := repo.CreateBugTicket(context.Background(), bugTicket); err != nil {
		log.Fatalln(err)
	}

}
