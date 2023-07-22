resource "aws_s3_bucket" "cur" {
  bucket        = local.s3_bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_policy" "cur" {
  bucket = aws_s3_bucket.cur.id
  policy = data.aws_iam_policy_document.s3_cur.json
}

data "aws_iam_policy_document" "s3_cur" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["billingreports.amazonaws.com"]
    }
    actions = [
      "s3:GetBucketAcl",
      "s3:GetBucketPolicy",
    ]
    resources = [aws_s3_bucket.cur.arn]
    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = ["arn:aws:cur:us-east-1:${local.account_id}:definition/*"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = ["${local.account_id}"]
    }
  }

  statement {
    principals {
      type        = "Service"
      identifiers = ["billingreports.amazonaws.com"]
    }
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.cur.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = ["arn:aws:cur:us-east-1:${local.account_id}:definition/*"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = ["${local.account_id}"]
    }
  }
}


resource "aws_s3_bucket_notification" "cur" {
  bucket = aws_s3_bucket.cur.id

  queue {
    queue_arn     = aws_sqs_queue.s3_event.arn
    events        = ["s3:ObjectCreated:*"]
    filter_suffix = ".parquet"
  }
}
