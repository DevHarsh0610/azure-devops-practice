# terraform/modules/static-web-app/variables.tf

variable "environment" {
  type        = string
  description = "Environment name."
}

variable "location" {
  type        = string
  description = "The Azure region to deploy to."
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group."
}

variable "app_name" {
  type        = string
  description = "The name of the Static Web App."
  default     = "devops-practice-frontend"
}

variable "sku_name" {
  type        = string
  description = "The SKU of the Static Web App (Free or Standard)."
  default     = "Free"
}
