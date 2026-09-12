variable "terraform_client" {
  type = object({
    id     = string
    secret = string
    url    = string
  })
}

variable "myrealm_name" {
  type = string
}

variable "myrealm_client_id" {
  type = string
}

variable "myrealm_client_secret" {
  type = string
}

variable "myrealm_base_url" {
  description = "Base URL used by the Go application for client redirect URIs."
  type        = string
  default     = "http://localhost:8081"
}
