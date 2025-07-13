variable "region" {
  type    = string
  default = "ap-northeast-1"
}

variable "user_pool_name" {
  description = "Cognito User Pool name"
  type        = string
  default     = "main-user-pool"
}

variable "callback_urls" {
  description = "OAuth callback URLs"
  type        = list(string)
  default = [
    "http://localhost:3000/api/auth/callback/cognito",
  ]
}

variable "logout_urls" {
  description = "OAuth logout URLs"
  type        = list(string)
  default = [
    "http://localhost:3000",
  ]
}
variable "ses_email" {
  description = "Email address for SES domain verification"
  type        = string
}