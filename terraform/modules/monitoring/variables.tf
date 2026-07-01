# terraform/modules/monitoring/variables.tf

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

variable "log_retention_days" {
  type        = number
  description = "Number of days to retain logs in Log Analytics."
  default     = 30
}
