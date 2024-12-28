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

	featureRequestTicket := single_table_inheritance.FeatureRequestTicket{
		Type:           single_table_inheritance.TicketTypeFeatureRequest,
		Title:          "title",
		Description:    "description",
		FeatureRequest: "feture reuqeust",
	}

	if err := repo.CreateFeatureRequestTicket(context.Background(), featureRequestTicket); err != nil {
		log.Fatalln(err)
	}

}
