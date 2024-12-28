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

	fmt.Println("Get bug ticket")
	{
		ticketID := 1
		bugTicket, err := repo.GetBugTicket(context.Background(), int64(ticketID))
		if err != nil {
			log.Fatalln(err)
		}
		if err := encoder.Encode(bugTicket); err != nil {
			log.Fatalln(err)
		}
	}

	fmt.Println("Get feature request ticket")
	{
		ticketID := 1
		featureRequestTicket, err := repo.GetFeatureRequestTicket(context.Background(), int64(ticketID))
		if err != nil {
			log.Fatalln(err)
		}
		if err := encoder.Encode(featureRequestTicket); err != nil {
			log.Fatalln(err)
		}
	}

}
