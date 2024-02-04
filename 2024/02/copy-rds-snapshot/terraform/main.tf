module "sandbox_1" {
  source = "./modules"
  providers = {
    aws = aws.sandbox-1
  }

  create_aurora               = true
  create_customer_managed_key = true
}

module "sandbox_2" {
  source = "./modules"
  providers = {
    aws = aws.sandbox-2
  }

  create_aurora               = false
  create_customer_managed_key = false
}