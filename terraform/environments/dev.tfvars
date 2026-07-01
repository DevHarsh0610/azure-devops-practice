# terraform/environments/dev.tfvars

location              = "koreacentral"
resource_group_name   = "devops-practice-rg"
vnet_address_space    = ["10.0.0.0/16"]
app_subnet_cidr       = ["10.0.1.0/24"]
data_subnet_cidr      = ["10.0.2.0/24"]
app_service_sku       = "B1"
postgresql_sku        = "B_Standard_B1ms"
postgresql_storage_mb = 32768
swa_sku               = "Free"
log_retention_days    = 30
allowed_origins       = "http://localhost:3000,http://localhost:5173"
