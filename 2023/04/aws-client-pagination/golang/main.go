package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/iam"
)

type Role struct {
	Arn                      string
	Path                     string
	RoleId                   string
	RoleName                 string
	AssumeRolePolicyDocument string
}

func generator() <-chan Role {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("ap-northeast-1"))
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}

	client := iam.NewFromConfig(cfg)
	paginator := iam.NewListRolesPaginator(client, nil)

	ch := make(chan Role)
	go func() {
		defer close(ch)

		for paginator.HasMorePages() {

			output, err := paginator.NextPage(context.TODO())
			if err != nil {
				log.Print(err)
				return
			}

			for _, role := range output.Roles {
				ch <- Role{
					Arn:                      *role.Arn,
					Path:                     *role.Path,
					RoleId:                   *role.RoleId,
					RoleName:                 *role.RoleName,
					AssumeRolePolicyDocument: *role.AssumeRolePolicyDocument,
				}
			}
		}
	}()

	return ch
}

func main() {

	for role := range generator() {
		bytes, err := json.MarshalIndent(role, "", " ")
		if err != nil {
			log.Println(err)
		}
		fmt.Printf("%s\n", string(bytes))
	}
}
