# locals {
#   alias = "WebAuthn Passwordless"
# }

# import {
#   id = "${local.realm_id}/ab147574-8a30-4aa5-b402-b875cd7d9d94"
#   to = module.webauthn_passwordless.keycloak_authentication_flow.passkey
# }

# import {
#   id = "${local.realm_id}/${local.alias}/ea44fbd3-6146-41a3-a37d-10bed8ac5af9"
#   to = module.webauthn_passwordless.keycloak_authentication_execution.cookie
# }

# import {
#   id = "${local.realm_id}/${local.alias}/825d4c31-ae32-49e8-83fe-05f668958240"
#   to = module.webauthn_passwordless.keycloak_authentication_subflow.passwordless
# }

# import {
#   id = "${local.realm_id}/${local.alias}/bc18a6ea-5ede-401d-bb4d-16dee8d7e5a7"
#   to = module.webauthn_passwordless.keycloak_authentication_execution.username_form
# }

# import {
#   id = "${local.realm_id}/${local.alias}/7f35dc08-71c5-47fa-96b9-3d7cb696c7bf"
#   to = module.webauthn_passwordless.keycloak_authentication_execution.webauthn_authenticator
# }

# import {
#   id = "${local.realm_id}/${local.alias}/33e814b0-a231-4ddd-8d08-a9923485f124"
#   to = module.webauthn_passwordless.keycloak_authentication_subflow.password
# }

# import {
#   id = "${local.realm_id}/${local.alias}/81c06618-4d3b-4903-9d91-e6264cb1fd85"
#   to = module.webauthn_passwordless.keycloak_authentication_execution.username_password_form
# }
