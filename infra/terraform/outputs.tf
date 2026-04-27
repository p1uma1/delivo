output "resource_group_name" {
  value       = azurerm_resource_group.rg.name
  description = "The name of the deployed resource group."
}

output "acr_login_server" {
  value       = azurerm_container_registry.acr.login_server
  description = "The URL of the Azure Container Registry."
}

output "aks_cluster_name" {
  value       = azurerm_kubernetes_cluster.aks.name
  description = "The name of the AKS cluster."
}

output "aks_kube_config_command" {
  value       = "az aks get-credentials --resource-group ${azurerm_resource_group.rg.name} --name ${azurerm_kubernetes_cluster.aks.name}"
  description = "The command to fetch kubeconfig for the AKS cluster."
}
