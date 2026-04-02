terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "eu-west-3"
}

# 1. Récupération dynamique de l'AMI Ubuntu LTS
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# 2. Génération de la clé SSH à la volée (Contrainte "Zero Touch")
resource "tls_private_key" "ephemeral_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "deployer_key" {
  key_name_prefix   = "zero-touch-deploy-key-"
  public_key        = tls_private_key.ephemeral_key.public_key_openssh
}

# 3. Security Group (Règles strictes adaptées à votre application)
resource "aws_security_group" "app_sg" {
  name_prefix        = "zero-touch-sg-"
  description        = "Allow SSH, Frontend (5173), API (8000) and Adminer (8080)"

  # SSH (Port 22) - Strictement pour Ansible
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Frontend Vue.js (Port 5173)
  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # API Python/Node (Port 8000)
  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Adminer (Port 8080) - Outil de gestion de base de données
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Le trafic sortant (On autorise l'EC2 à communiquer avec l'extérieur)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 4. Création de l'instance
resource "aws_instance" "prod_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.deployer_key.key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  tags = {
    Name = "Zero-Touch-Prod-Server"
  }
}

# 5. Les Outputs (Le pont vers Ansible)
output "server_public_ip" {
  description = "L'adresse IP publique de l'instance"
  value       = aws_instance.prod_server.public_ip
}

output "private_key_pem" {
  description = "La clé privée SSH pour Ansible"
  value       = tls_private_key.ephemeral_key.private_key_pem
  sensitive   = true
}