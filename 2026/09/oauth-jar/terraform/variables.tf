variable "jwks_url" {
  description = "URL of the client JWKS endpoint, reachable from Keycloak."
  type        = string
  default     = ""
}

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

variable "request_object_base_url" {
  description = "Base URL used by Keycloak to fetch request objects."
  type        = string
  default     = "http://host.docker.internal:8081"
}

locals {
  jar_clients = {
    plain = {
      extra_config = {}
    }
    request-rs256-import = {
      extra_config = {
        "request.object.required"      = "request only"
        "request.object.signature.alg" = "RS256"
        "use.jwks.url"                 = false
        "jwks.url"                     = null
        "jwt.credential.public.key"    = file("../${path.module}/public.pem")
      }
    }
    request-rs256-jwks = {
      extra_config = {
        "request.object.required"      = "request only"
        "request.object.signature.alg" = "RS256"
        "use.jwks.url"                 = true
        "jwks.url"                     = var.jwks_url
      }
    }
    request-hs256 = {
      extra_config = {
        "request.object.required"      = "request only"
        "request.object.signature.alg" = "HS256"
        "use.jwks.url"                 = false
        "jwks.url"                     = null
      }
    }
    request-uri-rs256-import = {
      extra_config = {
        "request.object.required"      = "request_uri only"
        "request.object.signature.alg" = "RS256"
        "use.jwks.url"                 = false
        "jwks.url"                     = null
        "request.uris"                 = "${var.request_object_base_url}/request-objects/*"
        "jwt.credential.public.key"    = file("../${path.module}/public.pem")
      }
    }
    request-uri-rs256-jwks = {
      extra_config = {
        "request.object.required"      = "request_uri only"
        "request.object.signature.alg" = "RS256"
        "use.jwks.url"                 = true
        "jwks.url"                     = var.jwks_url
        "request.uris"                 = "${var.request_object_base_url}/request-objects/*"
      }
    }
    request-uri-hs256 = {
      extra_config = {
        "request.object.required"      = "request_uri only"
        "request.object.signature.alg" = "HS256"
        "use.jwks.url"                 = false
        "jwks.url"                     = null
        "request.uris"                 = "${var.request_object_base_url}/request-objects/*"
      }
    }
    both-rs256-import = {
      extra_config = {
        "request.object.required"      = "request or request_uri"
        "request.object.signature.alg" = "RS256"
        "use.jwks.url"                 = false
        "jwks.url"                     = null
        "request.uris"                 = "${var.request_object_base_url}/request-objects/*"
        "jwt.credential.public.key"    = file("../${path.module}/public.pem")
      }
    }
  }
}
