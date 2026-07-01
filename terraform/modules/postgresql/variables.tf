# terraform/modules/postgresql/variables.tf

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

variable "vnet_id" {
  type        = string
  description = "The ID of the virtual network."
}

variable "subnet_id" {
  type        = string
  description = "The ID of the delegated subnet for PostgreSQL."
}

variable "admin_username" {
  type        = string
  description = "The database administrator username."
  default     = "postgres"
}

variable "admin_password" {
  type        = string
  description = "The database administrator password."
  sensitive   = true
}

variable "sku_name" {
  type        = string
  description = "The SKU name for the PostgreSQL server."
  default     = "B_Standard_B1ms"
}

variable "db_version" {
  type        = string
  description = "PostgreSQL engine version."
  default     = "16"
}

variable "storage_mb" {
  type        = number
  description = "Max storage allowed for database server."
  default     = 32768
}

variable "high_availability" {
  type        = bool
  description = "Enable High Availability (for production environments)."
  default     = false
}
