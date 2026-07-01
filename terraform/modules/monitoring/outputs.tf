# terraform/modules/monitoring/outputs.tf

output "log_analytics_workspace_id" {
  value       = azurerm_log_analytics_workspace.main.id
  description = "The ID of the Log Analytics workspace."
}

output "application_insights_instrumentation_key" {
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
  description = "The instrumentation key of the Application Insights instance."
}

output "application_insights_connection_string" {
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
  description = "The connection string of the Application Insights instance."
}
