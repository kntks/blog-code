resource "aws_vpc" "ssm_vpc" {
  cidr_block = "172.16.0.0/16"

  tags = {
    Name = "aws-ssm-example"
  }
}

resource "aws_subnet" "ssm_public_subnet" {
  vpc_id            = aws_vpc.ssm_vpc.id
  cidr_block        = "172.16.10.0/24"
  availability_zone = "ap-northeast-1a"

  tags = {
    Name = "ssm-public-subnet"
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

resource "aws_internet_gateway" "example_igw" {
  vpc_id = aws_vpc.ssm_vpc.id
  tags = {
    Name = "ssm-example-igw"
  }
}

resource "aws_route_table" "example_rt" {
  vpc_id = aws_vpc.ssm_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.example_igw.id
  }

  tags = {
    Name = "ssm-example-rt"
  }
}

resource "aws_route_table_association" "ssm_association" {
  subnet_id      = aws_subnet.ssm_public_subnet.id
  route_table_id = aws_route_table.example_rt.id
}

resource "aws_security_group" "ssm_public_sg" {
  name        = "ssm-public-sg"
  description = "ssm public security group"
  vpc_id      = aws_vpc.ssm_vpc.id

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "ssm-public-sg"
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
  subnet_id            = aws_subnet.ssm_public_subnet.id
  iam_instance_profile = aws_iam_instance_profile.ssm_instance_core.name
  tags = {
    Name = "aws-ssm-public-example"
  }

  associate_public_ip_address = true
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