package main

import (
	"context"
	"database-polymorphism/concrete_table_inheritance"
	"log"
)

func main() {

	repo := concrete_table_inheritance.NewTicketRepository(concrete_table_inheritance.DBConfig{
		Host:     "localhost",
		Port:     "3306",
		User:     "example",
		Password: "password",
	})

	featureRequestTicket := concrete_table_inheritance.FeatureRequestTicket{
		Title:          "title",
		Description:    "description",
		FeatureRequest: "feture reuqeust",
	}

	if err := repo.CreateFeatureRequestTicket(context.Background(), featureRequestTicket); err != nil {
		log.Fatalln(err)
	}

}
