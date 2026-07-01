# terraform/modules/static-web-app/main.tf

resource "azurerm_static_web_app" "main" {
  name                = "${var.environment}-${var.app_name}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku_tier            = var.sku_name
  sku_size            = var.sku_name

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
