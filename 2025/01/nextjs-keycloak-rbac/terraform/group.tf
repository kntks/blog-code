
locals {
  group = {
    admin       = "admin"
    engineering = "engineering"
    sales       = "sales"
  }
}

resource "keycloak_group" "groups" {
  for_each = { for g in local.group : g => title(g) }

  attributes = {}
  name       = each.value
  parent_id  = null
  realm_id   = keycloak_realm.myrealm.id
}


locals {
  group_role_mappings = {
    "admin_roles" = {
      group_name = local.group.admin
      roles      = [local.role.admin]
    }
    "engineering_roles" = {
      group_name = local.group.engineering
      roles      = [local.role.editor]
    }
    "sales_roles" = {
      group_name = local.group.sales
      roles      = [local.role.read_only]
    }
  }

  group_user_mappings = {
    "admin_users" = {
      group_name = local.group.admin
      users      = [local.users.user1.username]
    }
    "engineering_users" = {
      group_name = local.group.engineering
      users      = [local.users.user2.username]
    }
    "sales_users" = {
      group_name = local.group.sales
      users      = [local.users.user3.username]
    }
  }
}

resource "keycloak_group_roles" "mappings" {
  for_each = local.group_role_mappings

  exhaustive = true
  group_id   = keycloak_group.groups[each.value.group_name].id
  realm_id   = keycloak_realm.myrealm.id
  role_ids   = [for role in each.value.roles : keycloak_role.roles[replace(role, "-", "_")].id]
}

resource "keycloak_group_memberships" "mappings" {
  for_each = local.group_user_mappings

  group_id = keycloak_group.groups[each.value.group_name].id
  realm_id = keycloak_realm.myrealm.id
  members  = each.value.users
}