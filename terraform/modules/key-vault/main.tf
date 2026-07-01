# terraform/modules/key-vault/main.tf

# Generate a unique name suffix
resource "random_id" "kv_suffix" {
  byte_length = 3
}

resource "azurerm_key_vault" "main" {
  name                        = "${var.environment}-kv-${random_id.kv_suffix.hex}"
  location                    = var.location
  resource_group_name         = var.resource_group_name
  enabled_for_disk_encryption = true
  tenant_id                   = var.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false

  sku_name = "standard"

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Access policy for pipeline SPN (secrets administrator)
resource "azurerm_key_vault_access_policy" "secrets_officer" {
  count        = length(var.object_ids_secrets_officer)
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = var.tenant_id
  object_id    = var.object_ids_secrets_officer[count.index]

  secret_permissions = [
    "Get",
    "List",
    "Set",
    "Delete",
    "Recover",
    "Backup",
    "Restore",
    "Purge"
  ]
}

# Access policy for Web App / runtime identities (read-only)
resource "azurerm_key_vault_access_policy" "secrets_user" {
  count        = length(var.object_ids_secrets_user)
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = var.tenant_id
  object_id    = var.object_ids_secrets_user[count.index]

  secret_permissions = [
    "Get",
    "List"
  ]
}
