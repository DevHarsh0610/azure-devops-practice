# terraform/modules/networking/variables.tf

variable "environment" {
  type        = string
  description = "Environment name (e.g. dev, qa, uat, staging, prod)"
}

variable "location" {
  type        = string
  description = "The Azure region to deploy to."
  default     = "koreacentral"
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group."
}

variable "vnet_address_space" {
  type        = list(string)
  description = "The address space for the VNet."
  default     = ["10.0.0.0/16"]
}

variable "app_subnet_cidr" {
  type        = list(string)
  description = "The CIDR block for the app service subnet."
  default     = ["10.0.1.0/24"]
}

variable "data_subnet_cidr" {
  type        = list(string)
  description = "The CIDR block for the database subnet."
  default     = ["10.0.2.0/24"]
}
