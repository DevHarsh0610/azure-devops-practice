# terraform/main.tf

# Get client configuration for Tenant ID and Object ID
data "azurerm_client_config" "current" {}

# Use workspace name as the environment name (e.g. dev, qa, uat, staging, prod)
locals {
  env = terraform.workspace
  # For prod environment, use the exact resource group name the user requested
  rg_name = local.env == "prod" ? var.resource_group_name : "${local.env}-${var.resource_group_name}"
}

# 1. Networking Module
module "networking" {
  source              = "./modules/networking"
  environment         = local.env
  location            = var.location
  resource_group_name = local.rg_name
  vnet_address_space  = var.vnet_address_space
  app_subnet_cidr     = var.app_subnet_cidr
  data_subnet_cidr    = var.data_subnet_cidr
}

# 2. Key Vault Module
module "key_vault" {
  source              = "./modules/key-vault"
  environment         = local.env
  location            = module.networking.resource_group_location
  resource_group_name = module.networking.resource_group_name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  
  # Pipeline service principal is the Secrets Officer
  object_ids_secrets_officer = [data.azurerm_client_config.current.object_id]
  
  # Web App principal is a Secrets User (resolved later after app-service creation)
  object_ids_secrets_user = concat(
    [module.app_service.principal_id],
    local.env == "prod" ? [module.app_service.staging_slot_principal_id] : []
  )
}

# 3. Monitoring Module
module "monitoring" {
  source              = "./modules/monitoring"
  environment         = local.env
  location            = module.networking.resource_group_location
  resource_group_name = module.networking.resource_group_name
  log_retention_days  = var.log_retention_days
}

# 4. PostgreSQL Database Module
module "postgresql" {
  source              = "./modules/postgresql"
  environment         = local.env
  location            = module.networking.resource_group_location
  resource_group_name = module.networking.resource_group_name
  vnet_id             = module.networking.vnet_id
  subnet_id           = module.networking.data_subnet_id
  admin_username      = "postgres"
  admin_password      = var.db_admin_password
  sku_name            = var.postgresql_sku
  storage_mb          = var.postgresql_storage_mb
  high_availability   = local.env == "prod" ? true : false
}

# 5. Key Vault Secrets
resource "azurerm_key_vault_secret" "database_url" {
  name         = "DATABASE-URL"
  value        = module.postgresql.connection_string
  key_vault_id = module.key_vault.key_vault_id
  
  # Ensure the Key Vault access policy for the pipeline principal is created first
  depends_on = [module.key_vault]
}

resource "azurerm_key_vault_secret" "jwt_access" {
  name         = "JWT-ACCESS-SECRET"
  value        = var.jwt_access_secret
  key_vault_id = module.key_vault.key_vault_id
  
  depends_on = [module.key_vault]
}

resource "azurerm_key_vault_secret" "jwt_refresh" {
  name         = "JWT-REFRESH-SECRET"
  value        = var.jwt_refresh_secret
  key_vault_id = module.key_vault.key_vault_id
  
  depends_on = [module.key_vault]
}

# 6. App Service Module
module "app_service" {
  source                         = "./modules/app-service"
  environment                    = local.env
  location                       = module.networking.resource_group_location
  resource_group_name            = module.networking.resource_group_name
  subnet_id                      = module.networking.app_subnet_id
  sku_name                       = var.app_service_sku
  key_vault_uri                  = module.key_vault.key_vault_uri
  db_url_secret_name             = azurerm_key_vault_secret.database_url.name
  jwt_access_secret_name         = azurerm_key_vault_secret.jwt_access.name
  jwt_refresh_secret_name        = azurerm_key_vault_secret.jwt_refresh.name
  allowed_origins                = var.allowed_origins
  app_insights_connection_string = module.monitoring.application_insights_connection_string
  deploy_staging_slot            = local.env == "prod" ? true : false
}

# 7. Static Web App Module
module "static_web_app" {
  source              = "./modules/static-web-app"
  environment         = local.env
  location            = local.env == "prod" ? "koreacentral" : var.location # SWA is global or specific regions, Korea Central is fine
  resource_group_name = module.networking.resource_group_name
  sku_name            = var.swa_sku
}

# Store Static Web App Deployment Token in Key Vault
resource "azurerm_key_vault_secret" "swa_token" {
  name         = "SWA-DEPLOY-TOKEN"
  value        = module.static_web_app.api_key
  key_vault_id = module.key_vault.key_vault_id
  
  depends_on = [module.key_vault]
}
