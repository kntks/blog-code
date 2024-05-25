resource "keycloak_authentication_bindings" "browser_authentication_binding" {
  realm_id     = var.realm_id
  browser_flow = keycloak_authentication_flow.passkey.alias
}

resource "keycloak_authentication_flow" "passkey" {
  alias       = var.flow_name
  description = null
  provider_id = "basic-flow"
  realm_id    = var.realm_id
}

resource "keycloak_authentication_execution" "cookie" {
  authenticator     = "auth-cookie"
  parent_flow_alias = keycloak_authentication_flow.passkey.alias
  realm_id          = var.realm_id
  requirement       = "ALTERNATIVE"

  depends_on = [keycloak_authentication_flow.passkey]
}

resource "keycloak_authentication_subflow" "passwordless" {
  alias             = join("-", compact(["Passwordless", var.name_suffix]))
  authenticator     = null
  description       = null
  parent_flow_alias = keycloak_authentication_flow.passkey.alias
  provider_id       = "basic-flow"
  realm_id          = var.realm_id
  requirement       = "ALTERNATIVE"

  depends_on = [
    keycloak_authentication_execution.cookie,
    keycloak_authentication_flow.passkey
  ]
}

resource "keycloak_authentication_execution" "username_form" {
  authenticator     = "auth-username-form"
  parent_flow_alias = keycloak_authentication_subflow.passwordless.alias
  realm_id          = var.realm_id
  requirement       = "REQUIRED"

  depends_on = [keycloak_authentication_subflow.passwordless]
}

resource "keycloak_authentication_execution" "webauthn_authenticator" {
  authenticator     = "webauthn-authenticator"
  parent_flow_alias = keycloak_authentication_subflow.passwordless.alias
  realm_id          = var.realm_id
  requirement       = "REQUIRED"

  depends_on = [
    keycloak_authentication_subflow.passwordless,
    keycloak_authentication_execution.username_form
  ]
}

resource "keycloak_authentication_subflow" "password" {
  alias             = join("-", compact(["Password", var.name_suffix]))
  authenticator     = null
  description       = null
  parent_flow_alias = keycloak_authentication_flow.passkey.alias
  provider_id       = "basic-flow"
  realm_id          = var.realm_id
  requirement       = "ALTERNATIVE"

  depends_on = [
    keycloak_authentication_flow.passkey,
    keycloak_authentication_subflow.passwordless
  ]
}

resource "keycloak_authentication_execution" "username_password_form" {
  authenticator     = "auth-username-password-form"
  parent_flow_alias = keycloak_authentication_subflow.password.alias
  realm_id          = var.realm_id
  requirement       = "REQUIRED"

  depends_on = [keycloak_authentication_subflow.password]
}


