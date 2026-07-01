# terraform/outputs.tf

output "resource_group_name" {
  value = module.networking.resource_group_name
}

output "web_app_url" {
  value       = module.app_service.default_hostname
  description = "The URL of the API Backend App Service."
}

output "static_web_app_url" {
  value       = module.static_web_app.default_host_name
  description = "The URL of the Static Web App."
}

output "key_vault_uri" {
  value = module.key_vault.key_vault_uri
}

output "postgres_fqdn" {
  value = module.postgresql.fqdn
}
