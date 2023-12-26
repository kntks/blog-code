packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
    ansible = {
      version = ">= 1.1.1"
      source  = "github.com/hashicorp/ansible"
    }
  }
}

source "amazon-ebs" "ubuntu" {
  ami_name = "learn-packer-linux-aws"

  vpc_id        = "vpc-08bc27368c830b6da"
  subnet_id     = "subnet-018bedd2828774def"
  instance_type = "t3.micro"
  region        = "ap-northeast-1"

  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-**"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["099720109477"]
  }

  ssh_username  = "ubuntu"
  ssh_interface = "session_manager"
  ssh_timeout   = "1h" # default: 5m
  communicator  = "ssh"

  # iam_instance_profile = "AmazonSSMManagedInstanceCore"と設定は同じ
  # "PackerAMIBuilderRole"はTerraformで管理する
  iam_instance_profile = "PackerAMIBuilderRole"


  # iam_instance_profileの代わりにtemporary_iam_instance_profile_policy_documentを使用できる
  # temporary_iam_instance_profile_policy_document {
  #   Statement {
  #       Action   = ["logs:*"]
  #       Effect   = "Allow"
  #       Resource = ["*"]
  #   }
  #   Version = "2012-10-17"
  # }

  temporary_key_pair_type = "ed25519"
  pause_before_ssm        = "20s"

  associate_public_ip_address = true # EC2をpublic subnetに配置してpublic ipを設定する

  aws_polling {
    delay_seconds = 60
    max_attempts  = 60
  }

  assume_role {
    role_arn = "arn:aws:iam::<aws account id>:role/AssumePackerAMIBuilderRole"
  }

  max_retries = 2
}

build {
  name = "learn-packer"
  sources = [
    "source.amazon-ebs.ubuntu"
  ]

  provisioner "ansible" {
    # https://developer.hashicorp.com/packer/integrations/hashicorp/ansible/latest/components/provisioner/ansible#default-extra-variables 
    extra_arguments = [
      "-vvvv",
      "--scp-extra-args",
      "'-O'"
    ]
    user          = "ubuntu"
    playbook_file = "./playbook.yml"
  }
}