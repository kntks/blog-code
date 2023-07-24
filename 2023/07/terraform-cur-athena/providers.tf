terraform {
  required_version = "~> 1.5.2"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.7.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"

  default_tags {
    tags = local.tags
  }
}

provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}
