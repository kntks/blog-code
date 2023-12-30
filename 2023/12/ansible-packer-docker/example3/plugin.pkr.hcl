packer {
  required_version = ">= 1.10.0"

  required_plugins {
    docker = {
      source  = "github.com/hashicorp/docker"
      version = "~> 1"
    }
    ansible = {
      source  = "github.com/hashicorp/ansible"
      version = ">= 1.1.1"
    }
  }
}