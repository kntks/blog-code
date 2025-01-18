locals {
  role = {
    read_only = "read-only"
    editor    = "editor"
    admin     = "admin"
  }
}

resource "keycloak_role" "roles" {
  for_each = local.role

  attributes      = {}
  client_id       = keycloak_openid_client.myapp.id
  composite_roles = null
  description     = null
  name            = each.value
  realm_id        = "myrealm"
}
