# terraform/bootstrap/variables.tf

variable "location" {
  type        = string
  description = "The Azure region to deploy to."
  default     = "koreacentral"
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group for Terraform state."
  default     = "tf-state-rg"
}

variable "storage_account_name" {
  type        = string
  description = "The name of the storage account for Terraform state (globally unique)."
}

variable "container_name" {
  type        = string
  description = "The name of the storage container for Terraform state."
  default     = "tfstate"
}
