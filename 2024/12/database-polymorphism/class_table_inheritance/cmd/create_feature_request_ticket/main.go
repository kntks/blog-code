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

	featureRequestTicket := class_table_inheritance.FeatureRequestTicket{
		Title:          "title",
		Description:    "description",
		FeatureRequest: "feture reuqeust",
	}

	if err := repo.CreateFeatureRequestTicket(context.Background(), featureRequestTicket); err != nil {
		log.Fatalln(err)
	}

}
