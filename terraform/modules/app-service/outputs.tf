# terraform/modules/app-service/outputs.tf

output "app_service_id" {
  value       = azurerm_linux_web_app.main.id
  description = "The ID of the App Service."
}

output "app_service_name" {
  value       = azurerm_linux_web_app.main.name
  description = "The name of the App Service."
}

output "default_hostname" {
  value       = azurerm_linux_web_app.main.default_hostname
  description = "The default hostname of the App Service."
}

output "principal_id" {
  value       = azurerm_linux_web_app.main.identity[0].principal_id
  description = "The Principal ID of the system-assigned identity of the Web App."
}

output "staging_slot_principal_id" {
  value       = var.deploy_staging_slot ? azurerm_linux_web_app_slot.staging[0].identity[0].principal_id : null
  description = "The Principal ID of the system-assigned identity of the staging slot."
}
