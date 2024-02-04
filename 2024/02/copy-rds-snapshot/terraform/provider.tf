terraform {
  required_version = "~> 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.33"
    }
  }
}

provider "aws" {
  region  = "ap-northeast-1"
  alias   = "sandbox-1"
  profile = "sandbox-1"
}

provider "aws" {
  region  = "ap-northeast-1"
  alias   = "sandbox-2"
  profile = "sandbox-2"
}