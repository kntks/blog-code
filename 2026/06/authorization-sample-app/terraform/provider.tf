terraform {
  required_version = "~> 1.14"
  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = ">= 5.8.0"
    }
  }
}

provider "keycloak" {
  client_id     = var.client_id
  client_secret = var.client_secret
  url           = var.url
}
