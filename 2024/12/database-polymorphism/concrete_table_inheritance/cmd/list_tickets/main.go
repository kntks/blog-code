package main

import (
	"context"
	"database-polymorphism/concrete_table_inheritance"
	"encoding/json"
	"fmt"
	"log"
	"os"
)

func main() {

	repo := concrete_table_inheritance.NewTicketRepository(concrete_table_inheritance.DBConfig{
		Host:     "localhost",
		Port:     "3306",
		User:     "example",
		Password: "password",
	})

	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", " ")

	fmt.Println("List of bug tickets")
	{
		bugTickets, err := repo.ListBugTickets(context.Background())
		if err != nil {
			log.Fatalln(err)
		}
		if err := encoder.Encode(bugTickets); err != nil {
			log.Fatalln(err)
		}
	}

	fmt.Println("List of feature request tickets")
	{
		featureRequestTickets, err := repo.ListFeatureRequestTickets(context.Background())
		if err != nil {
			log.Fatalln(err)
		}
		if err := encoder.Encode(featureRequestTickets); err != nil {
			log.Fatalln(err)
		}
	}

}
