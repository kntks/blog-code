resource "aws_athena_workgroup" "cur" {
  name          = local.athena_workgroup_name
  force_destroy = true

  configuration {
    publish_cloudwatch_metrics_enabled = false
    result_configuration {
      output_location = "s3://${aws_s3_bucket.cur.id}/query_log"
    }
  }
}
