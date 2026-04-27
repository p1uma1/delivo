variable "resource_group_name" {
  type        = string
  description = "The name of the resource group."
  default     = "delivo-rg"
}

variable "location" {
  type        = string
  description = "The Azure region to deploy resources."
  default     = "southeastasia"
}

variable "acr_name" {
  type        = string
  description = "The name of the Azure Container Registry."
  default     = "delivoregistry123"
}

variable "aks_name" {
  type        = string
  description = "The name of the AKS cluster."
  default     = "delivo-cluster"
}

variable "node_count" {
  type        = number
  description = "The number of worker nodes in the AKS cluster."
  default     = 2
}

variable "node_vm_size" {
  type        = string
  description = "The size of the VMs in the AKS cluster."
  default     = "Standard_B2s_v2"
}
