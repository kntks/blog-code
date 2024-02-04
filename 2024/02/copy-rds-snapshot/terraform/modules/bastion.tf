# ---------------------
# 踏み台EC2インスタンス
# ---------------------

# Amazon Linux 2023
data "aws_ami" "this" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "bastion" {
  ami                         = data.aws_ami.this.id
  iam_instance_profile        = aws_iam_instance_profile.bastion.name
  instance_type               = "t3.micro"
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  associate_public_ip_address = true

  user_data                   = <<EOS
#!/bin/bash
sudo systemctl enable amazon-ssm-agent
sudo systemctl start amazon-ssm-agent
sudo rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2023
dnf -y localinstall  https://dev.mysql.com/get/mysql80-community-release-el9-1.noarch.rpm
dnf -y install mysql mysql-community-client
EOS
  user_data_replace_on_change = true

  tags = {
    Name = "${local.name_prefix}-bastion"
  }
}

# ---------------------
# IAM Role
# ---------------------

data "aws_iam_policy_document" "bastion_assume_role" {
  statement {
    effect = "Allow"
    actions = [
      "sts:AssumeRole",
    ]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_iam_policy" "ssm_core" {
  arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "bastion_ssm_core" {
  name   = "${local.name_prefix}-bastion-policy"
  role   = aws_iam_role.bastion.name
  policy = data.aws_iam_policy.ssm_core.policy
}

resource "aws_iam_role" "bastion" {
  name               = "${local.name_prefix}-bastion"
  path               = "/"
  assume_role_policy = data.aws_iam_policy_document.bastion_assume_role.json
}

resource "aws_iam_instance_profile" "bastion" {
  name = "${local.name_prefix}-bastion"
  role = aws_iam_role.bastion.name
}

# ---------------------
# Security Group
# ---------------------

resource "aws_security_group" "bastion" {
  name        = "${local.name_prefix}-bastion"
  description = "bastion"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}