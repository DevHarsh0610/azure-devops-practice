# terraform/modules/app-service/main.tf

locals {
  image_parts = split(":", var.docker_image)
  image_name  = local.image_parts[0]
  image_tag   = length(local.image_parts) > 1 ? local.image_parts[1] : "latest"
}

resource "azurerm_service_plan" "main" {
  name                = "${var.environment}-asp"
  location            = var.location
  resource_group_name = var.resource_group_name
  os_type             = "Linux"
  sku_name            = var.sku_name

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "azurerm_linux_web_app" "main" {
  name                = var.environment == "prod" ? var.app_name : "${var.environment}-${var.app_name}"
  location            = var.location
  resource_group_name = var.resource_group_name
  service_plan_id     = azurerm_service_plan.main.id
  https_only          = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = true
    application_stack {
      docker_image     = local.image_name
      docker_image_tag = local.image_tag
    }
  }

  app_settings = {
    "NODE_ENV"               = var.environment
    "PORT"                   = "3000"
    "API_VERSION"            = "v1"
    "BCRYPT_ROUNDS"          = "12"
    "ALLOWED_ORIGINS"        = var.allowed_origins
    "SWAGGER_ENABLED"        = "true"
    "LOG_LEVEL"              = "info"
    "DATABASE_URL"           = "@Microsoft.KeyVault(SecretUri=${var.key_vault_uri}secrets/${var.db_url_secret_name})"
    "JWT_ACCESS_SECRET"      = "@Microsoft.KeyVault(SecretUri=${var.key_vault_uri}secrets/${var.jwt_access_secret_name})"
    "JWT_REFRESH_SECRET"     = "@Microsoft.KeyVault(SecretUri=${var.key_vault_uri}secrets/${var.jwt_refresh_secret_name})"
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.app_insights_connection_string
  }

  virtual_network_subnet_id = var.subnet_id

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "azurerm_linux_web_app_slot" "staging" {
  count          = var.deploy_staging_slot ? 1 : 0
  name           = "staging"
  app_service_id = azurerm_linux_web_app.main.id

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = true
    application_stack {
      docker_image     = local.image_name
      docker_image_tag = local.image_tag
    }
  }

  app_settings = {
    "NODE_ENV"               = var.environment
    "PORT"                   = "3000"
    "API_VERSION"            = "v1"
    "BCRYPT_ROUNDS"          = "12"
    "ALLOWED_ORIGINS"        = var.allowed_origins
    "SWAGGER_ENABLED"        = "true"
    "LOG_LEVEL"              = "info"
    "DATABASE_URL"           = "@Microsoft.KeyVault(SecretUri=${var.key_vault_uri}secrets/${var.db_url_secret_name})"
    "JWT_ACCESS_SECRET"      = "@Microsoft.KeyVault(SecretUri=${var.key_vault_uri}secrets/${var.jwt_access_secret_name})"
    "JWT_REFRESH_SECRET"     = "@Microsoft.KeyVault(SecretUri=${var.key_vault_uri}secrets/${var.jwt_refresh_secret_name})"
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.app_insights_connection_string
  }

  virtual_network_subnet_id = var.subnet_id

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
