# SESメールアイデンティティ
resource "aws_ses_email_identity" "main" {
  email = var.ses_email
}
