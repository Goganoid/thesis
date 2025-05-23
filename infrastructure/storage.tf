# S3 Bucket
resource "aws_s3_bucket" "expenses" {
  bucket = "${var.environment}-expenses-bucket"

  tags = {
    Name = "${var.environment}-expenses-bucket"
  }
}

resource "aws_s3_bucket_public_access_block" "expenses" {
  bucket = aws_s3_bucket.expenses.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ECR Repositories
resource "aws_ecr_repository" "user_service" {
  name = "${var.environment}-user-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "expenses_service" {
  name = "${var.environment}-expenses-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "timeoffs_service" {
  name = "${var.environment}-timeoffs-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
} 