# terraform/modules/networking/outputs.tf

output "resource_group_name" {
  value       = azurerm_resource_group.main.name
  description = "The name of the resource group."
}

output "resource_group_location" {
  value       = azurerm_resource_group.main.location
  description = "The location of the resource group."
}

output "vnet_id" {
  value       = azurerm_virtual_network.main.id
  description = "The ID of the virtual network."
}

output "app_subnet_id" {
  value       = azurerm_subnet.app.id
  description = "The ID of the App Service subnet."
}

output "data_subnet_id" {
  value       = azurerm_subnet.data.id
  description = "The ID of the database subnet."
}
