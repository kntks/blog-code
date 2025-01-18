locals {
  users = {
    user1 = {
      username         = "user1"
      first_name       = "Taro"
      last_name        = "Yamada"
      email            = "user1@example.com"
      initial_password = "user1"
    }

    user2 = {
      username         = "user2"
      first_name       = "Hanako"
      last_name        = "Suzuki"
      email            = "user2@example.com"
      initial_password = "user2"
    }

    user3 = {
      username         = "user3"
      first_name       = "Jiro"
      last_name        = "Tanaka"
      email            = "user3@example.com"
      initial_password = "user3"
    }
  }
}

resource "keycloak_user" "users" {
  for_each = local.users

  realm_id         = keycloak_realm.myrealm.id
  username         = each.value.username
  first_name       = each.value.first_name
  last_name        = each.value.last_name
  attributes       = {}
  email            = each.value.email
  email_verified   = false
  enabled          = true
  required_actions = []

  initial_password {
    value     = each.value.initial_password
    temporary = false
  }
}
