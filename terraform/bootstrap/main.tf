# terraform/bootstrap/main.tf

terraform {
  required_version = ">= 1.8"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.110"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "state_rg" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_storage_account" "state_sa" {
  name                     = var.storage_account_name
  resource_group_name      = azurerm_resource_group.state_rg.name
  location                 = azurerm_resource_group.state_rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"
  enable_https_traffic_only = true

  blob_properties {
    delete_retention_policy {
      days = 7
    }
    container_delete_retention_policy {
      days = 7
    }
  }

  tags = {
    Environment = "infra-bootstrap"
    ManagedBy   = "Terraform"
  }
}

resource "azurerm_storage_container" "state_container" {
  name                  = var.container_name
  storage_account_name  = azurerm_storage_account.state_sa.name
  container_access_type = "private"
}
