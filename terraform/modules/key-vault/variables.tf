# terraform/modules/key-vault/variables.tf

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

variable "tenant_id" {
  type        = string
  description = "The Azure Active Directory tenant ID."
}

variable "object_ids_secrets_officer" {
  type        = list(string)
  description = "Object IDs of users or service principals that should have Key Vault Secrets Officer/Administrator access."
  default     = []
}

variable "object_ids_secrets_user" {
  type        = list(string)
  description = "Object IDs of web app identities or other services that should have Secrets User/Reader access."
  default     = []
}
