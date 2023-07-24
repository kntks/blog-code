resource "aws_sqs_queue" "s3_event" {
  name                      = local.s3_event_queue_name
  delay_seconds             = 90
  max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.s3_event_deadletter.arn
    maxReceiveCount     = 4
  })
  policy = data.aws_iam_policy_document.s3_event.json
}

resource "aws_sqs_queue" "s3_event_deadletter" {
  name = local.s3_event_dlq_name
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns = [
      "arn:aws:sqs:${data.aws_region.current.name}:${local.account_id}:${local.s3_event_queue_name}"
    ]
  })
}


data "aws_iam_policy_document" "s3_event" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["s3.amazonaws.com"]
    }

    actions   = ["sqs:SendMessage"]
    resources = ["arn:aws:sqs:*:*:${local.s3_event_queue_name}"]

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_s3_bucket.cur.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [local.account_id]
    }
  }
}
