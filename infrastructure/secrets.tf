# User Service Secrets
resource "aws_secretsmanager_secret" "user_service_supabase" {
  name = "${var.environment}/user-service/supabase"
}

# Expenses Service Secrets
resource "aws_secretsmanager_secret" "expenses_service_aws" {
  name = "${var.environment}/expenses-service/aws"
} 