# Variables for configuration
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "lambda-container-app"
}

variable "github_actions_repo" {
  description = "GitHub repository for Actions"
  type        = string
}

variable "create_lambda_function" {
  description = "Whether to create the Lambda function. Set to false for initial ECR setup."
  type        = bool
  default     = false
}

variable "lambda_image_tag" {
  description = "Docker image tag for Lambda function"
  type        = string
  default     = "latest"
}


# Data source to get current AWS account ID
data "aws_caller_identity" "current" {}

# Data source to get current AWS region
data "aws_region" "current" {}
