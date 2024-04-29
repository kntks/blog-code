locals {
  cidr            = "10.0.0.0/16"
  private_subnets = []
  public_subnets = [
    cidrsubnet(local.cidr, 8, 101),
  ]
}

data "aws_availability_zones" "available" {
  state = "available"
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.8"

  name = "my-vpc"
  cidr = local.cidr

  azs             = data.aws_availability_zones.available.names
  private_subnets = local.private_subnets
  public_subnets  = local.public_subnets

  manage_default_network_acl    = false
  manage_default_route_table    = false
  manage_default_security_group = false
  manage_default_vpc            = false

  enable_nat_gateway = false
  enable_vpn_gateway = false
}

module "example_sg" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.1"

  name        = "example-sg"
  description = "example security group"

  # VPC moduleのoutputを参照する
  vpc_id      = module.vpc.vpc_id

  ingress_cidr_blocks      = [local.cidr]
  ingress_rules            = ["https-443-tcp"]
  ingress_with_cidr_blocks = []

  use_name_prefix = false

  # depends_on = [ module.vpc ]
}
