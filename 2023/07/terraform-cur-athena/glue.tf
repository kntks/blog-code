resource "aws_glue_catalog_database" "cur" {
  name = local.catalog_db_name
  create_table_default_permission {
    permissions = ["SELECT"]

    principal {
      data_lake_principal_identifier = "IAM_ALLOWED_PRINCIPALS"
    }
  }
}

resource "aws_glue_crawler" "cur" {
  database_name = aws_glue_catalog_database.cur.name
  schedule      = local.crawler_schedule
  name          = local.glue_crawler_name
  role          = aws_iam_role.glue_crawler.arn
  tags          = local.tags
  lake_formation_configuration {
    use_lake_formation_credentials = false
  }
  lineage_configuration {
    crawler_lineage_settings = "DISABLE"
  }
  recrawl_policy {
    recrawl_behavior = "CRAWL_EVENT_MODE"
  }

  s3_target {
    path = "s3://${aws_s3_bucket.cur.bucket}/${local.s3_prefix}/${local.cur_report_name}/${local.cur_report_name}"
    exclusions = [
      "**.json",
      "**.yml",
      "**.sql",
      "**.csv",
      "**.gz",
      "**.zip"
    ]
    event_queue_arn     = aws_sqs_queue.s3_event.arn
    dlq_event_queue_arn = aws_sqs_queue.s3_event_deadletter.arn
  }
  schema_change_policy {
    update_behavior = "UPDATE_IN_DATABASE"
    delete_behavior = "DELETE_FROM_DATABASE"
  }

  depends_on = [aws_sqs_queue.s3_event, aws_sqs_queue.s3_event_deadletter]
}

resource "aws_iam_role" "glue_crawler" {
  name                = "exampleCURAthenaCrawler"
  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"]
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "glue.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "cur_crawler" {
  name = "AWSCURCrawlerComponentFunction"
  role = aws_iam_role.glue_crawler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Action = [
          "glue:UpdateDatabase",
          "glue:UpdatePartition",
          "glue:CreateTable",
          "glue:UpdateTable",
          "glue:ImportCatalogToGlue"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:s3:::${aws_s3_bucket.cur.bucket}/${local.s3_prefix}/${local.cur_report_name}/${local.cur_report_name}*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "sqs:DeleteMessage",
          "sqs:GetQueueUrl",
          "sqs:ListDeadLetterSourceQueues",
          "sqs:DeleteMessageBatch",
          "sqs:ReceiveMessage",
          "sqs:GetQueueAttributes",
          "sqs:ListQueueTags",
          "sqs:SetQueueAttributes",
          "sqs:PurgeQueue"
        ],
        "Resource" : "*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "kms_decryption" {
  name = "AWSCURKMSDecryption"
  role = aws_iam_role.glue_crawler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "kms:Decrypt"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}
