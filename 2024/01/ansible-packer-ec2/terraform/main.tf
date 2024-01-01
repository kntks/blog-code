data "aws_caller_identity" "current" {}

data "aws_iam_policy" "ssm_managed_instance_core" {
  arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}


data "aws_iam_policy_document" "instance_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ssm_instance_core" {
  name                = "AnsibleTestRole"
  assume_role_policy  = data.aws_iam_policy_document.instance_assume_role_policy.json
  managed_policy_arns = [data.aws_iam_policy.ssm_managed_instance_core.arn]
}

resource "aws_iam_instance_profile" "ssm_instance_core" {
  name = "AnsibleTestRole"
  role = aws_iam_role.ssm_instance_core.name
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


resource "aws_key_pair" "ssh" {
  key_name   = "ansible-tmp"
  public_key = var.public_key
}

resource "aws_instance" "this" {
  ami = data.aws_ami.ubuntu.id
  instance_market_options {
    market_type = "spot"
    spot_options {
      max_price = 0.0024
    }
  }
  instance_type = "t3.micro"

  iam_instance_profile        = aws_iam_instance_profile.ssm_instance_core.name
  associate_public_ip_address = true
  subnet_id                   = aws_subnet.ssm_public_subnet.id

  key_name = aws_key_pair.ssh.key_name

  tags = {
    Name = "ansible-spot"
  }
}

#==========
# example 2
#==========

resource "aws_s3_bucket" "ansible" {
  bucket        = "ansible-bucket-fkejsj"
  force_destroy = true
}

data "aws_iam_policy_document" "ansible" {
  statement {
    actions = [
      "s3:List*",
      "s3:Get*",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "ansible" {
  name   = "AnsibleEC2InstancePolicy"
  role   = aws_iam_role.ssm_instance_core.id
  policy = data.aws_iam_policy_document.ansible.json
}