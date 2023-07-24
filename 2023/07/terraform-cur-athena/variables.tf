locals {
  account_id = data.aws_caller_identity.current.account_id

  # =========
  # S3 
  # =========
  s3_bucket_name = "example-cur-report"

  # =========
  # CUR 
  # =========
  cur_report_name = "example-cur-report"
  s3_prefix       = "billing"

  # =========
  # SQS 
  # =========
  s3_event_queue_name = "s3-notification-event-queue"
  s3_event_dlq_name   = "s3-event-deadletter-queue"

  # =========
  # Glue 
  # =========
  catalog_db_name   = "example_report"
  glue_crawler_name = "example-cur-crawler"
  crawler_schedule  = "cron(0 0/3 * * ? *)"

  # =========
  # Athena 
  # =========
  athena_workgroup_name = "example"

  tags = {
    Service   = "example"
    Env       = "dev"
    ManagedBy = "git-url"
  }
}