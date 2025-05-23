variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}

variable "user_service_supabase_url" {
  description = "Supabase URL for User Service"
  type        = string
  sensitive   = true
}

variable "user_service_supabase_key" {
  description = "Supabase Key for User Service"
  type        = string
  sensitive   = true
}

variable "expenses_service_aws_access_key_id" {
  description = "AWS Access Key ID for Expenses Service"
  type        = string
  sensitive   = true
}

variable "expenses_service_aws_secret_access_key" {
  description = "AWS Secret Access Key for Expenses Service"
  type        = string
  sensitive   = true
} 