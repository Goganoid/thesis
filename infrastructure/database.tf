resource "aws_db_subnet_group" "main" {
  name       = "${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.environment}-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.environment}-rds-sg"
  description = "Security group for RDS instances"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }
}

resource "aws_db_instance" "expenses_db" {
  identifier           = "${var.environment}-expenses-db"
  engine              = "postgres"
  engine_version      = "14.7"
  instance_class      = "db.t3.micro"  
  allocated_storage   = 20
  storage_type        = "gp2"
  
  db_name             = "expenses_db"
  username            = "expenses_user"
  password            = random_password.expenses_db_password.result
  
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  
  skip_final_snapshot    = true
  publicly_accessible    = false
  multi_az               = false 
  
  tags = {
    Name = "${var.environment}-expenses-db"
  }
}

resource "aws_db_instance" "timeoffs_db" {
  identifier           = "${var.environment}-timeoffs-db"
  engine              = "postgres"
  engine_version      = "14.7"
  instance_class      = "db.t3.micro"  
  allocated_storage   = 20
  storage_type        = "gp2"
  
  db_name             = "timeoffs_db"
  username            = "timeoffs_user"
  password            = random_password.timeoffs_db_password.result
  
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  
  skip_final_snapshot    = true
  publicly_accessible    = false
  multi_az               = false 
  
  tags = {
    Name = "${var.environment}-timeoffs-db"
  }
}

resource "random_password" "expenses_db_password" {
  length  = 16
  special = true
}

resource "random_password" "timeoffs_db_password" {
  length  = 16
  special = true
} 