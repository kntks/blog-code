// CURはバージニア北部しかエンドポイントがないためリージョンをus-east-1にしないと使えない
// https://docs.aws.amazon.com/ja_jp/general/latest/gr/billing.html
resource "aws_cur_report_definition" "cur_report" {
  provider = aws.virginia # CURはバージニア北部しかない

  report_name                = local.cur_report_name
  time_unit                  = "HOURLY"
  format                     = "Parquet" # "Parquetに設定するなら"compression"も必ず"Perquet"
  compression                = "Parquet"
  additional_schema_elements = ["RESOURCES"]
  s3_bucket                  = local.s3_bucket_name
  s3_prefix                  = local.s3_prefix
  s3_region                  = aws_s3_bucket.cur.region
  additional_artifacts       = ["ATHENA"]         # ここがATHENAである場合、他のartifactsは設定できない
  report_versioning          = "OVERWRITE_REPORT" # additional_artifacts = "ATHENA"である場合、ここは必ず"OVERWRITE_REPORT"

  depends_on = [
    aws_s3_bucket_policy.cur,
  ]
}
