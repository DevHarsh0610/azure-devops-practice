# terraform/variables.tf

variable "location" {
  type        = string
  description = "The Azure region to deploy to."
  default     = "koreacentral"
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group."
  default     = "devops-practice-rg"
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

variable "app_service_sku" {
  type        = string
  description = "The SKU for the App Service Plan."
  default     = "B1"
}

variable "postgresql_sku" {
  type        = string
  description = "The SKU for the PostgreSQL Flexible Server."
  default     = "B_Standard_B1ms"
}

variable "postgresql_storage_mb" {
  type        = number
  description = "The storage for the PostgreSQL server."
  default     = 32768
}

variable "swa_sku" {
  type        = string
  description = "The SKU tier/size of the Static Web App."
  default     = "Free"
}

variable "log_retention_days" {
  type        = number
  description = "Log retention in days."
  default     = 30
}

# Secrets (can be passed via environment variables or secret tfvars)
variable "subscription_id" {
  type        = string
  description = "The Azure subscription ID."
}

variable "jwt_access_secret" {
  type        = string
  description = "JWT Access token secret."
  sensitive   = true
  default     = "default-jwt-access-secret-must-be-changed"
}

variable "jwt_refresh_secret" {
  type        = string
  description = "JWT Refresh token secret."
  sensitive   = true
  default     = "default-jwt-refresh-secret-must-be-changed"
}

variable "db_admin_password" {
  type        = string
  description = "PostgreSQL admin password."
  sensitive   = true
}

variable "allowed_origins" {
  type        = string
  description = "CORS allowed origins."
  default     = "http://localhost:3000,http://localhost:5173"
}
