package main

import (
	"context"
	"database-polymorphism/single_table_inheritance"
	"log"
)

func main() {

	repo := single_table_inheritance.NewTicketRepository(single_table_inheritance.DBConfig{
		Host:     "localhost",
		Port:     "3306",
		User:     "example",
		Password: "password",
	})

	bugTicket := single_table_inheritance.BugTicket{
		Type:        single_table_inheritance.TicketTypeBug,
		Title:       "title",
		Description: "description",
		BugReport:   "bug report",
	}

	if err := repo.CreateBugTicket(context.Background(), bugTicket); err != nil {
		log.Fatalln(err)
	}

}
