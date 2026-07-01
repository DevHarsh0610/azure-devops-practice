# terraform/modules/postgresql/outputs.tf

output "server_id" {
  value       = azurerm_postgresql_flexible_server.main.id
  description = "The ID of the PostgreSQL Flexible Server."
}

output "server_name" {
  value       = azurerm_postgresql_flexible_server.main.name
  description = "The name of the PostgreSQL Flexible Server."
}

output "fqdn" {
  value       = azurerm_postgresql_flexible_server.main.fqdn
  description = "The FQDN of the PostgreSQL Flexible Server."
}

output "db_name" {
  value       = azurerm_postgresql_flexible_server_database.taskdb.name
  description = "The database name."
}

output "connection_string" {
  value       = "postgresql://${var.admin_username}:${var.admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.taskdb.name}?sslmode=require"
  sensitive   = true
  description = "The PostgreSQL connection string."
}
