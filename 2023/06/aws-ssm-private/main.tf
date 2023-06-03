resource "aws_vpc" "ssm_vpc" {
  cidr_block = "172.16.0.0/16"

  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name = "aws-ssm-example"
  }
}

resource "aws_subnet" "ssm_private_subnet" {
  vpc_id            = aws_vpc.ssm_vpc.id
  cidr_block        = "172.16.11.0/24"
  availability_zone = "ap-northeast-1c"

  tags = {
    Name = "ssm-private-subnet"
  }
}

resource "aws_security_group" "ssm_private_sg" {
  name        = "ssm-private-sg"
  description = "ssm private security group"
  vpc_id      = aws_vpc.ssm_vpc.id

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "ssm-private-sg"
  }
}

data "aws_ami" "amzn-linux-2023-ami" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_instance" "ssm" {
  ami                  = data.aws_ami.amzn-linux-2023-ami.id
  instance_type        = "t2.micro"
  subnet_id            = aws_subnet.ssm_private_subnet.id
  iam_instance_profile = aws_iam_instance_profile.ssm_instance_core.name
  tags = {
    Name = "aws-ssm-private-example"
  }
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

data "aws_iam_policy" "ssm_managed_instance_core" {
  arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role" "ssm_instance_core" {
  name                = "SSMInstanceCoreRole"
  assume_role_policy  = data.aws_iam_policy_document.instance_assume_role_policy.json
  managed_policy_arns = [data.aws_iam_policy.ssm_managed_instance_core.arn]
}

resource "aws_iam_instance_profile" "ssm_instance_core" {
  name = "ssm"
  role = aws_iam_role.ssm_instance_core.name
}

resource "aws_security_group" "ssm" {
  name        = "ssm-endpoint-sg"
  description = "ssm-endpoint-sg"
  vpc_id      = aws_vpc.ssm_vpc.id
  ingress {
    from_port = 443
    to_port   = 443
    protocol  = "tcp"
    cidr_blocks = [
      "172.16.0.0/16"
    ]
  }

  tags = {
    Name = "ssm-endpoint-sg"
  }
}

resource "aws_vpc_endpoint" "ec2_messages" {
  vpc_id              = aws_vpc.ssm_vpc.id
  service_name        = "com.amazonaws.ap-northeast-1.ec2messages"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true

  security_group_ids = [aws_security_group.ssm.id]
  subnet_ids         = [aws_subnet.ssm_private_subnet.id]
}

resource "aws_vpc_endpoint" "ssm" {
  vpc_id              = aws_vpc.ssm_vpc.id
  service_name        = "com.amazonaws.ap-northeast-1.ssm"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = [aws_security_group.ssm.id]
  subnet_ids          = [aws_subnet.ssm_private_subnet.id]
}

resource "aws_vpc_endpoint" "ssm_messages" {
  vpc_id              = aws_vpc.ssm_vpc.id
  service_name        = "com.amazonaws.ap-northeast-1.ssmmessages"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = [aws_security_group.ssm.id]
  subnet_ids          = [aws_subnet.ssm_private_subnet.id]
}