terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = ">= 2.12"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "kubernetes" {
  host                   = module.compute.cluster_endpoint
  cluster_ca_certificate = module.compute.cluster_ca
  token                  = module.compute.cluster_auth_token
}

provider "helm" {
  kubernetes {
    host                   = module.compute.cluster_endpoint
    cluster_ca_certificate = module.compute.cluster_ca
    token                  = module.compute.cluster_auth_token
  }
}

module "network" {
  source = "./modules/network"

  environment = var.environment
  cidr_block  = var.network_cidr
}

module "compute" {
  source = "./modules/compute"

  environment     = var.environment
  vpc_id          = module.network.vpc_id
  private_subnets = module.network.private_subnets
}

module "database" {
  source = "./modules/database"

  environment     = var.environment
  vpc_id          = module.network.vpc_id
  private_subnets = module.network.private_subnets
}

module "monitoring" {
  source = "./modules/monitoring"

  environment     = var.environment
  cluster_name    = module.compute.cluster_name
  cluster_endpoint = module.compute.cluster_endpoint
}

output "network" {
  value = module.network
}

output "compute" {
  value = {
    cluster_name    = module.compute.cluster_name
    cluster_endpoint = module.compute.cluster_endpoint
  }
}

output "database" {
  value = module.database
}

