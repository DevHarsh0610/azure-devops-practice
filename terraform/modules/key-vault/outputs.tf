# terraform/modules/key-vault/outputs.tf

output "key_vault_id" {
  value       = azurerm_key_vault.main.id
  description = "The ID of the Key Vault."
}

output "key_vault_name" {
  value       = azurerm_key_vault.main.name
  description = "The name of the Key Vault."
}

output "key_vault_uri" {
  value       = azurerm_key_vault.main.vault_uri
  description = "The URI of the Key Vault."
}
