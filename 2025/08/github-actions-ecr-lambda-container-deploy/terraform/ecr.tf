# ECR Repository for Lambda container images
resource "aws_ecr_repository" "lambda_repo" {
  name                 = "lambda-container-app"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}

# ECR lifecycle policy to manage image retention
resource "aws_ecr_lifecycle_policy" "lambda_repo_policy" {
  repository = aws_ecr_repository.lambda_repo.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 2 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 2
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Output ECR repository URL for use in GitHub Actions
output "ecr_repository_url" {
  value       = aws_ecr_repository.lambda_repo.repository_url
  description = "ECR repository URL for container images"
}

output "ecr_repository_name" {
  value       = aws_ecr_repository.lambda_repo.name
  description = "ECR repository name"
}
