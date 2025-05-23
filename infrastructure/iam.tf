# IAM Role for ECS Tasks
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.environment}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Secrets Access
resource "aws_iam_policy" "secrets_access" {
  name = "${var.environment}-secrets-access-policy"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.user_service_supabase.arn,
          aws_secretsmanager_secret.expenses_service_aws.arn
        ]
      }
    ]
  })
}

# IAM Policy for S3 Access
resource "aws_iam_policy" "s3_access" {
  name = "${var.environment}-s3-access-policy"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:*"
        ]
        Resource = [
          "${aws_s3_bucket.expenses.arn}",
          "${aws_s3_bucket.expenses.arn}/*"
        ]
      }
    ]
  })
}

# Attach the policies to the role
resource "aws_iam_role_policy_attachment" "secrets_access" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.secrets_access.arn
}

resource "aws_iam_role_policy_attachment" "s3_access" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.s3_access.arn
} 