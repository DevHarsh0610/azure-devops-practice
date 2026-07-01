# terraform/import.tf
# ─────────────────────────────────────────────────────────────────────────────
# Manually Created Resources Import Documentation
#
# Because we are using separate workspaces per environment, declaring native
# Terraform 1.5+ `import {}` blocks globally would cause Terraform to attempt
# importing the Production resource group and App Service into non-prod
# workspace states (e.g. dev, qa, uat) during their runs.
#
# To prevent state cross-contamination, imports are executed conditionally
# via CLI commands inside the pipeline (`pipelines/templates/jobs/tf-import.yml`)
# only when the active workspace is "prod".
#
# Commands run dynamically by the pipeline:
#
#   terraform import module.networking.azurerm_resource_group.main \
#     /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/devops-practice-rg
#
#   terraform import module.app_service.azurerm_linux_web_app.main \
#     /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/devops-practice-rg/providers/Microsoft.Web/sites/my-unique-devops-app-123
# ─────────────────────────────────────────────────────────────────────────────
