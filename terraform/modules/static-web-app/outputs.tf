# terraform/modules/static-web-app/outputs.tf

output "static_web_app_id" {
  value       = azurerm_static_web_app.main.id
  description = "The ID of the Static Web App."
}

output "static_web_app_name" {
  value       = azurerm_static_web_app.main.name
  description = "The name of the Static Web App."
}

output "default_host_name" {
  value       = azurerm_static_web_app.main.default_host_name
  description = "The default host name of the Static Web App."
}

output "api_key" {
  value       = azurerm_static_web_app.main.api_key
  sensitive   = true
  description = "The api key / deployment token for the Static Web App."
}
