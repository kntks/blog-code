variable "client_id" {
  type = string
}

variable "client_secret" {
  type = string
}

variable "url" {
  type = string
}

variable "jwks_url" {
  description = "URL of the client JWKS endpoint (GET /jwks), reachable from Keycloak, used to fetch the client's public key for encrypted ID tokens."
  type        = string

  validation {
    condition     = can(regex("^https?://[a-zA-Z0-9._-]+(:[0-9]+)?(/[a-zA-Z0-9._~:/?#\\[\\]@!$&'()*+,;=%-]*)?$", var.jwks_url))
    error_message = "jwks_url must be a valid URL starting with http:// or https://."
  }
}
