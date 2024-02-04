data "aws_caller_identity" "current" {}

locals {
  name_prefix = "example"
  az_1a       = "ap-northeast-1a"
  az_1c       = "ap-northeast-1c"

  cidr = "10.0.0.0/16"
  subnet_cidr = {
    public     = cidrsubnet(local.cidr, 8, 1) # 10.0.1.0/24
    private_1a = cidrsubnet(local.cidr, 8, 2) # 10.0.2.0/24
    private_1c = cidrsubnet(local.cidr, 8, 3) # 10.0.3.0/24
  }
}

# Sandbox-2のアカウントではTerraformからDBを作成しない。
# リストアによってDBを作成するため、その際に指定するSecurity Group
resource "aws_security_group" "sandbox_2" {
  count  = var.create_aurora ? 0 : 1
  name   = "example-db-2"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = [local.subnet_cidr.public]
  }
}

module "cluster" {
  count = var.create_aurora ? 1 : 0

  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "~> 9.0"

  name                = "${local.name_prefix}-db"
  database_name       = "example"
  engine              = "aurora-mysql"
  engine_version      = "8.0.mysql_aurora.3.05.0"
  instance_class      = "db.t3.medium"
  skip_final_snapshot = true
  instances = {
    one = {}
  }
  copy_tags_to_snapshot = true
  vpc_id                = aws_vpc.main.id

  create_db_subnet_group = true
  db_subnet_group_name   = "${local.name_prefix}-subnet"
  subnets                = [aws_subnet.private_1a.id, aws_subnet.private_1c.id]

  security_group_rules = {
    ex1_ingress = {
      cidr_blocks = [
        local.subnet_cidr.public
      ]
    }
  }

  storage_encrypted = true
  apply_immediately = true
  # monitoring_interval = 10

  enabled_cloudwatch_logs_exports = []
  deletion_protection             = false

  manage_master_user_password   = true
  master_password               = false
  master_user_secret_kms_key_id = null
  master_username               = "root"

  autoscaling_enabled        = false
  autoscaling_max_capacity   = 0
  auto_minor_version_upgrade = false

  create_cloudwatch_log_group       = false
  create_db_cluster_activity_stream = false
  create_db_cluster_parameter_group = false
  create_db_parameter_group         = false
  create_monitoring_role            = false
  create_security_group             = true

  performance_insights_enabled          = false
  performance_insights_kms_key_id       = null
  performance_insights_retention_period = null
}
