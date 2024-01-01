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

resource "aws_internet_gateway" "example_igw" {
  vpc_id = aws_vpc.ssm_vpc.id
  tags = {
    Name = "ssm-example-igw"
  }
}


#################
#  Route Table  #
################# 
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
