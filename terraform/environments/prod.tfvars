# terraform/environments/prod.tfvars

location              = "koreacentral"
resource_group_name   = "devops-practice-rg"
vnet_address_space    = ["10.4.0.0/16"]
app_subnet_cidr       = ["10.4.1.0/24"]
data_subnet_cidr      = ["10.4.2.0/24"]
app_service_sku       = "P1v3"
postgresql_sku        = "GP_Standard_D2s_v3"
postgresql_storage_mb = 131072
swa_sku               = "Standard"
log_retention_days    = 90
allowed_origins       = "https://my-unique-devops-app-123.azurewebsites.net"
