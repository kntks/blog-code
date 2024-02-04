resource "aws_vpc" "main" {
  cidr_block           = local.cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name = "${local.name_prefix}-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = local.subnet_cidr.public
  availability_zone = local.az_1a
  tags = {
    Name = "${local.name_prefix}-public-subnet-1a"
  }
}

resource "aws_subnet" "private_1a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = local.subnet_cidr.private_1a
  availability_zone = local.az_1a
  tags = {
    Name = "${local.name_prefix}-private-subnet-1a"
  }
}

resource "aws_subnet" "private_1c" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = local.subnet_cidr.private_1c
  availability_zone = local.az_1c
  tags = {
    Name = "${local.name_prefix}-private-subnet-1c"
  }
}

# ---------------------
# Internet Gateway
# ---------------------

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "${local.name_prefix}-igw"
  }
}

# ---------------------
# Routing
# ---------------------

resource "aws_route_table" "to_igw" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "local_1a_to_natgw" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.to_igw.id
}