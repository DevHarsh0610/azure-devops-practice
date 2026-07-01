# terraform/backend.tf

terraform {
  backend "azurerm" {
    # These will be passed dynamically during `terraform init` via backend-config
    # resource_group_name  = "tf-state-rg"
    # storage_account_name = "tfstatedevops<suffix>"
    # container_name       = "tfstate"
    # key                  = "default.tfstate"
  }
}
