data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = [
      "sts:AssumeRole"
    ]
  }
}

# IAM role for Lambda function
resource "aws_iam_role" "lambda_execution_role" {
  name = "lambda-container-execution-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_execution_role.name
}

# Lambda function using container image
resource "aws_lambda_function" "container_lambda" {
  count = var.create_lambda_function ? 1 : 0

  function_name = "container-lambda-function"
  role          = aws_iam_role.lambda_execution_role.arn

  # Use container image from ECR
  package_type = "Image"
  image_uri    = "${aws_ecr_repository.lambda_repo.repository_url}:${var.lambda_image_tag}"

  # Container configuration
  timeout     = 30
  memory_size = 128

  # Environment variables (optional)
  environment {
    variables = {
      ENV = "dev"
    }
  }

  # Ensure the image exists before creating the function
  depends_on = [
    aws_ecr_repository.lambda_repo,
    aws_cloudwatch_log_group.lambda_logs,
  ]
}

resource "aws_lambda_function_url" "container_lambda" {
  count = var.create_lambda_function ? 1 : 0

  function_name      = aws_lambda_function.container_lambda[0].function_name
  authorization_type = "NONE"
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/container-lambda-function"
  retention_in_days = 14
}
