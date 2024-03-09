locals {
  realm_id = "myrealm"
}

resource "keycloak_realm" "myrealm" {
  realm                                    = local.realm_id
  access_code_lifespan                     = "1m0s"
  access_code_lifespan_login               = "30m0s"
  access_code_lifespan_user_action         = "5m0s"
  access_token_lifespan                    = "5m0s"
  access_token_lifespan_for_implicit_flow  = "15m0s"
  account_theme                            = null
  action_token_generated_by_admin_lifespan = "12h0m0s"
  action_token_generated_by_user_lifespan  = "5m0s"
  admin_theme                              = null
  attributes                               = {}
  browser_flow                             = "browser"
  client_authentication_flow               = "clients"
  client_session_idle_timeout              = "0s"
  client_session_max_lifespan              = "0s"
  default_default_client_scopes            = []
  default_optional_client_scopes           = []
  default_signature_algorithm              = "RS256"
  direct_grant_flow                        = "direct grant"
  display_name                             = null
  display_name_html                        = null
  docker_authentication_flow               = "docker auth"
  duplicate_emails_allowed                 = false
  edit_username_allowed                    = false
  email_theme                              = null
  enabled                                  = true
  internal_id                              = "9bfe15a2-1b59-46de-a41d-f756e4ddb616"
  login_theme                              = null
  login_with_email_allowed                 = true
  oauth2_device_code_lifespan              = "10m0s"
  oauth2_device_polling_interval           = 5
  offline_session_idle_timeout             = "720h0m0s"
  offline_session_max_lifespan             = "1440h0m0s"
  offline_session_max_lifespan_enabled     = false
  password_policy                          = null
  refresh_token_max_reuse                  = 0
  registration_allowed                     = false
  registration_email_as_username           = false
  registration_flow                        = "registration"
  remember_me                              = false
  reset_credentials_flow                   = "reset credentials"
  reset_password_allowed                   = false
  revoke_refresh_token                     = false
  ssl_required                             = "external"
  sso_session_idle_timeout                 = "30m0s"
  sso_session_idle_timeout_remember_me     = "0s"
  sso_session_max_lifespan                 = "10h0m0s"
  sso_session_max_lifespan_remember_me     = "0s"
  user_managed_access                      = false
  verify_email                             = false
  otp_policy {
    algorithm         = "HmacSHA1"
    digits            = 6
    initial_counter   = 0
    look_ahead_window = 1
    period            = 30
    type              = "totp"
  }
  web_authn_passwordless_policy {
    acceptable_aaguids                = []
    attestation_conveyance_preference = "not specified"
    authenticator_attachment          = "not specified"
    avoid_same_authenticator_register = false
    create_timeout                    = 0
    relying_party_entity_name         = "keycloak"
    relying_party_id                  = null
    require_resident_key              = "not specified"
    signature_algorithms              = ["ES256"]
    user_verification_requirement     = "not specified"
  }
  web_authn_policy {
    acceptable_aaguids                = []
    attestation_conveyance_preference = "not specified"
    authenticator_attachment          = "not specified"
    avoid_same_authenticator_register = false
    create_timeout                    = 0
    relying_party_entity_name         = "keycloak"
    relying_party_id                  = null
    require_resident_key              = "not specified"
    signature_algorithms              = ["ES256"]
    user_verification_requirement     = "not specified"
  }
}


resource "keycloak_user" "myuser" {
  realm_id         = keycloak_realm.myrealm.id
  username         = "myuser"
  first_name       = "foo"
  last_name        = "bar"
  attributes       = {}
  email            = null
  email_verified   = false
  enabled          = true
  required_actions = []
}

import {
  to = keycloak_openid_client.myqpp
  id = "myrealm/42d6d9aa-f232-4bab-8a71-aeaffdc4aff3"
}

resource "keycloak_openid_client" "myqpp" {
  name                                       = "myclient"
  client_id                                  = "myapp"
  realm_id                                   = keycloak_realm.myrealm.id
  client_authenticator_type                  = "client-secret"
  access_token_lifespan                      = null
  access_type                                = "CONFIDENTIAL"
  admin_url                                  = null
  backchannel_logout_revoke_offline_sessions = false
  backchannel_logout_session_required        = true
  backchannel_logout_url                     = null
  base_url                                   = null
  client_offline_session_idle_timeout        = null
  client_offline_session_max_lifespan        = null
  client_secret                              = null # sensitive
  client_session_idle_timeout                = null
  client_session_max_lifespan                = null
  consent_required                           = false
  consent_screen_text                        = null
  description                                = null
  direct_access_grants_enabled               = true
  display_on_consent_screen                  = false
  enabled                                    = true
  exclude_session_state_from_auth_response   = null
  extra_config                               = {}
  frontchannel_logout_enabled                = true
  frontchannel_logout_url                    = null
  full_scope_allowed                         = true
  implicit_flow_enabled                      = false
  import                                     = false
  login_theme                                = null
  oauth2_device_authorization_grant_enabled  = false
  oauth2_device_code_lifespan                = null
  oauth2_device_polling_interval             = null
  pkce_code_challenge_method                 = null
  root_url                                   = null
  service_accounts_enabled                   = false
  standard_flow_enabled                      = true
  use_refresh_tokens                         = true
  use_refresh_tokens_client_credentials      = false
  valid_post_logout_redirect_uris            = []
  valid_redirect_uris                        = ["http://localhost:8081/*"]
  web_origins                                = ["http://localhost:8081"]
}
