locals {
  name             = "ubuntu-ec2"
  vpc_cidr         = "10.0.0.0/16"
  private_vpc_cidr = "10.1.0.0/16"


  azs            = ["ap-northeast-1a"]
  public_subnets = ["10.0.2.0/24"]
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.2.0"

  name = local.name
  cidr = local.vpc_cidr

  azs            = local.azs
  public_subnets = local.public_subnets

  enable_dns_hostnames = true
  enable_dns_support   = true
  enable_nat_gateway   = false

  manage_default_security_group  = true
  default_security_group_ingress = []
  default_security_group_egress = [
    {
      from_port   = 0
      to_port     = 0
      protocol    = -1
      cidr_blocks = "0.0.0.0/0"
    }
  ]
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-**"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

module "ec2_instance" {
  source  = "terraform-aws-modules/ec2-instance/aws"
  version = "~> 5.5"

  name          = local.name
  subnet_id     = element(module.vpc.public_subnets, 0)
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.medium"
  monitoring    = false

  # Spot request specific attributes
  create_spot_instance                = true
  spot_price                          = "0.1"
  spot_wait_for_fulfillment           = true
  spot_type                           = "persistent"
  spot_instance_interruption_behavior = "terminate"


  vpc_security_group_ids = [module.vpc.default_security_group_id]

  associate_public_ip_address = true

  create_iam_instance_profile = true
  iam_role_description        = "IAM role for EC2 instance"
  iam_role_policies = {
    AmazonSSMManagedInstanceCore = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  }

}
