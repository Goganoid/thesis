resource "aws_ecs_cluster" "main" {
  name = "${var.environment}-cluster"
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 100
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  tags = {
    Name = "${var.environment}-alb"
  }
}

resource "aws_lb_target_group" "user_service" {
  name        = "${var.environment}-user-service-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path = "/health"
  }
}

resource "aws_lb_target_group" "expenses_service" {
  name        = "${var.environment}-expenses-service-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path = "/health"
  }
}

resource "aws_lb_target_group" "timeoffs_service" {
  name        = "${var.environment}-timeoffs-service-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path = "/health"
  }
}

resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}

resource "aws_lb_listener_rule" "user_service" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.user_service.arn
  }

  condition {
    path_pattern {
      values = ["/user/*"]
    }
  }
}

resource "aws_lb_listener_rule" "expenses_service" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.expenses_service.arn
  }

  condition {
    path_pattern {
      values = ["/expenses/*"]
    }
  }
}

resource "aws_lb_listener_rule" "timeoffs_service" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 300

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.timeoffs_service.arn
  }

  condition {
    path_pattern {
      values = ["/timeoffs/*"]
    }
  }
}

resource "aws_ecs_task_definition" "user_service" {
  family                   = "${var.environment}-user-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "user-service"
      image     = "${aws_ecr_repository.user_service.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        },
        {
          containerPort = 50051
          hostPort      = 50051
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "USER_SERVICE_PORT"
          value = "80"
        },
        {
          name  = "USER_SERVICE_GRPC_URL"
          value = "localhost:50051"
        },
        {
          name  = "USER_SERVICE_GRPC_PACKAGE"
          value = "users"
        },
        {
          name  = "USER_SERVICE_GRPC_NAME"
          value = "UserService"
        },
      ]
      secrets = [
        {
          name      = "USER_SERVICE_SUPABASE_URL"
          valueFrom = "${aws_secretsmanager_secret.user_service_supabase.arn}:USER_SERVICE_SUPABASE_URL::"
        },
        {
          name      = "USER_SERVICE_SUPABASE_KEY"
          valueFrom = "${aws_secretsmanager_secret.user_service_supabase.arn}:USER_SERVICE_SUPABASE_KEY::"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.environment}-user-service"
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "expenses_service" {
  family                   = "${var.environment}-expenses-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "expenses-service"
      image     = "${aws_ecr_repository.expenses_service.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "EXPENSES_SERVICE_PORT"
          value = "80"
        },
        {
          name  = "EXPENSES_SERVICE_POSTGRES_HOST"
          value = aws_db_instance.expenses_db.address
        },
        {
          name  = "EXPENSES_SERVICE_POSTGRES_PORT"
          value = "5432"
        },
        {
          name  = "EXPENSES_SERVICE_POSTGRES_DATABASE"
          value = "expenses_db"
        },
        {
          name  = "EXPENSES_SERVICE_POSTGRES_USER"
          value = "expenses_user"
        },
        {
          name  = "EXPENSES_SERVICE_POSTGRES_PASSWORD"
          value = random_password.expenses_db_password.result
        },
        {
          name  = "AWS_REGION"
          value = var.region
        },
        {
          name  = "AWS_S3_BUCKET_NAME"
          value = aws_s3_bucket.expenses.bucket
        },
        {
          name  = "USER_SERVICE_GRPC_URL"
          value = "${aws_ecs_task_definition.user_service.family}:50051"
        },
        {
          name  = "USER_SERVICE_GRPC_PACKAGE"
          value = "users"
        },
        {
          name  = "USER_SERVICE_GRPC_NAME"
          value = "UserService"
        },
      ]
      secrets = [
        {
          name      = "AWS_ACCESS_KEY_ID"
          valueFrom = "${aws_secretsmanager_secret.expenses_service_aws.arn}:AWS_ACCESS_KEY_ID::"
        },
        {
          name      = "AWS_SECRET_ACCESS_KEY"
          valueFrom = "${aws_secretsmanager_secret.expenses_service_aws.arn}:AWS_SECRET_ACCESS_KEY::"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.environment}-expenses-service"
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "timeoffs_service" {
  family                   = "${var.environment}-timeoffs-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "timeoffs-service"
      image     = "${aws_ecr_repository.timeoffs_service.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "TIMEOFFS_SERVICE_PORT"
          value = "80"
        },
        {
          name  = "TIMEOFFS_SERVICE_POSTGRES_HOST"
          value = aws_db_instance.timeoffs_db.address
        },
        {
          name  = "TIMEOFFS_SERVICE_POSTGRES_PORT"
          value = "5432"
        },
        {
          name  = "TIMEOFFS_SERVICE_POSTGRES_DATABASE"
          value = "timeoffs_db"
        },
        {
          name  = "TIMEOFFS_SERVICE_POSTGRES_USER"
          value = "timeoffs_user"
        },
        {
          name  = "TIMEOFFS_SERVICE_POSTGRES_PASSWORD"
          value = random_password.timeoffs_db_password.result
        },
        {
          name  = "USER_SERVICE_GRPC_URL"
          value = "${aws_ecs_task_definition.user_service.family}:50051"
        },
        {
          name  = "USER_SERVICE_GRPC_PACKAGE"
          value = "users"
        },
        {
          name  = "USER_SERVICE_GRPC_NAME"
          value = "UserService"
        },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.environment}-timeoffs-service"
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "user_service" {
  name            = "${var.environment}-user-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.user_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.user_service.arn
    container_name   = "user-service"
    container_port   = 80
  }
}

resource "aws_ecs_service" "expenses_service" {
  name            = "${var.environment}-expenses-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.expenses_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.expenses_service.arn
    container_name   = "expenses-service"
    container_port   = 80
  }
}

resource "aws_ecs_service" "timeoffs_service" {
  name            = "${var.environment}-timeoffs-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.timeoffs_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.timeoffs_service.arn
    container_name   = "timeoffs-service"
    container_port   = 80
  }
} 