# terraform/modules/app-service/variables.tf

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
  description = "The base name of the App Service."
  default     = "my-unique-devops-app-123"
}

variable "subnet_id" {
  type        = string
  description = "Subnet ID for outbound VNet Integration."
}

variable "sku_name" {
  type        = string
  description = "The SKU name for the App Service Plan."
  default     = "B1"
}

variable "docker_image" {
  type        = string
  description = "The Docker image name and tag."
  default     = "dockerharsh10/devops-practice-backend:latest"
}

variable "key_vault_uri" {
  type        = string
  description = "The URI of the Key Vault for App Setting references."
}

variable "db_url_secret_name" {
  type        = string
  description = "The secret name of the database URL in Key Vault."
}

variable "jwt_access_secret_name" {
  type        = string
  description = "The secret name of the JWT access secret in Key Vault."
}

variable "jwt_refresh_secret_name" {
  type        = string
  description = "The secret name of the JWT refresh secret in Key Vault."
}

variable "allowed_origins" {
  type        = string
  description = "CORS allowed origins comma separated."
  default     = "http://localhost:3000,http://localhost:5173"
}

variable "app_insights_connection_string" {
  type        = string
  description = "Connection string for Application Insights."
  default     = ""
}

variable "deploy_staging_slot" {
  type        = bool
  description = "Whether to deploy a staging slot for blue-green deployment."
  default     = false
}
