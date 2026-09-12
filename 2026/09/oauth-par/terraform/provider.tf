terraform {
  required_version = "~> 1.14"
  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = ">= 5.6.0"
    }
  }
}

provider "keycloak" {
  client_id     = var.terraform_client.id
  client_secret = var.terraform_client.secret
  url           = var.terraform_client.url
}