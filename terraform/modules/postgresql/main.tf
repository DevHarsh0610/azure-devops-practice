# terraform/modules/postgresql/main.tf

resource "random_id" "pg_suffix" {
  byte_length = 3
}

resource "azurerm_private_dns_zone" "postgres" {
  name                = "${var.environment}.postgres.database.azure.com"
  resource_group_name = var.resource_group_name
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name                  = "${var.environment}-pg-link"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  virtual_network_id    = var.vnet_id
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${var.environment}-pgserver-${random_id.pg_suffix.hex}"
  resource_group_name    = var.resource_group_name
  location               = var.location
  version                = var.db_version
  delegated_subnet_id    = var.subnet_id
  private_dns_zone_id    = azurerm_private_dns_zone.postgres.id
  administrator_login    = var.admin_username
  administrator_password = var.admin_password
  sku_name               = var.sku_name
  storage_mb             = var.storage_mb
  backup_retention_days  = 7

  dynamic "high_availability" {
    for_each = var.high_availability ? [1] : []
    content {
      mode = "ZoneRedundant"
    }
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres]
}

resource "azurerm_postgresql_flexible_server_database" "taskdb" {
  name      = "taskdb"
  server_id = azurerm_postgresql_flexible_server.main.id
  colormap  = "en_US.utf8"
}

# Firewall rule to allow access from within Azure (needed in dev/qa if direct connection is used)
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}
