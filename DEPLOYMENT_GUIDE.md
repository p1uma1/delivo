# Delivo Full Deployment Guide

This guide provides a step-by-step walkthrough to deploy the Delivo microservices architecture onto Azure Kubernetes Service (AKS) using Terraform for infrastructure provisioning.

## Prerequisites

Before starting, ensure you have the following installed on your local machine:
- [Azure CLI (`az`)](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Terraform (`terraform`)](https://developer.hashicorp.com/terraform/downloads)
- [Kubernetes CLI (`kubectl`)](https://kubernetes.io/docs/tasks/tools/)
- [Docker](https://docs.docker.com/get-docker/)
- [Helm (`helm`)](https://helm.sh/docs/intro/install/)

---

## Step 1: Provision Infrastructure with Terraform

We use Terraform to automatically create the Azure Resource Group, Azure Container Registry (ACR), AKS cluster, and install NGINX Ingress and Cert-Manager.

1. **Login to Azure:**
   ```bash
   az login
   az account set --subscription "<your-subscription-id>"
   ```

2. **Initialize and Apply Terraform:**
   ```bash
   cd infra/terraform
   terraform init
   terraform plan
   terraform apply -auto-approve
   ```

3. **Connect `kubectl` to your new cluster:**
   After Terraform finishes, it will output a command to connect to your cluster. Run it:
   ```bash
   # Example:
   az aks get-credentials --resource-group delivo-rg --name delivo-cluster --overwrite-existing
   ```

4. **Verify connection:**
   ```bash
   kubectl get nodes
   ```
   You should see your AKS nodes in the `Ready` status.

---

## Step 2: Build & Push Docker Images

Your AKS cluster needs to pull the microservice images from your Azure Container Registry (ACR). 

1. **Log in to your ACR:**
   ```bash
   # Get the ACR name from Terraform outputs (default: delivoregistry123)
   az acr login --name delivoregistry123
   ```

2. **Build and Tag your images:**
   Assuming you are using Docker Compose to build, or building individually. You need to tag them with your ACR login server.
   ```bash
   # Example for API Gateway
   docker build -t delivoregistry123.azurecr.io/delivo/api-gateway:latest -f backend/api-gateway/Dockerfile .
   
   # Repeat for all other services (user, order, delivery, product, cart, notification, web-app)
   ```

3. **Push to ACR:**
   ```bash
   docker push delivoregistry123.azurecr.io/delivo/api-gateway:latest
   # Push all other services
   ```

---

## Step 3: Configure DNS & Domains

1. **Get the Ingress External IP:**
   Terraform already installed the NGINX Ingress controller. Find its public IP:
   ```bash
   kubectl get svc -n ingress-nginx ingress-nginx-controller
   ```
   Wait until the `EXTERNAL-IP` is assigned (it may take a minute).

2. **Setup DNS A Records:**
   In your Domain provider (e.g., GoDaddy, Cloudflare), create **A records** pointing to the `EXTERNAL-IP`:
   - `delivo.yourdomain.com` -> `<EXTERNAL-IP>`
   - `api.delivo.yourdomain.com` -> `<EXTERNAL-IP>`
   - `ws.delivo.yourdomain.com` -> `<EXTERNAL-IP>`

---

## Step 4: Deploy Kubernetes Manifests

Now deploy the application to your cluster.

1. **Update Placeholders in Manifests:**
   Replace the domain and ACR names in your `k8s/` files.
   ```bash
   # Replace YOUR_DOMAIN
   find k8s/ -name "*.yaml" -exec sed -i 's/YOUR_DOMAIN/delivo.yourdomain.com/g' {} +
   
   # Replace YOUR_ACR_REGISTRY with your ACR login server
   find k8s/ -name "*.yaml" -exec sed -i 's/YOUR_ACR_REGISTRY/delivoregistry123.azurecr.io/g' {} +
   
   # Replace YOUR_EMAIL in k8s/ingress.yaml for Let's Encrypt certificates
   sed -i 's/YOUR_EMAIL/you@example.com/' k8s/ingress.yaml
   ```

2. **Apply Namespaces and Configs:**
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configmap.yaml
   ```

3. **Create the Secrets:**
   Create the Kubernetes secret for sensitive variables (Passwords, DB connections, JWT secrets).
   ```bash
   kubectl create secret generic delivo-secrets \
     --namespace=delivo \
     --from-literal=DATABASE_URL="<your-database-url>" \
     --from-literal=JWT_ACCESS_SECRET="<your-access-secret>" \
     --from-literal=JWT_REFRESH_SECRET="<your-refresh-secret>" \
     --from-literal=GOOGLE_CLIENT_ID="<your-client-id>" \
     --from-literal=RABBITMQ_URL="amqp://guest:guest@rabbitmq:5672"
   ```

4. **Deploy all Services:**
   ```bash
   kubectl apply -f k8s/ --recursive
   ```

---

## Step 5: Verify Deployment

1. **Check Pod Status:**
   ```bash
   kubectl get pods -n delivo
   ```
   All pods should transition to `Running`.

2. **Check Certificate Status (HTTPS):**
   ```bash
   kubectl get certificate -n delivo
   ```
   Wait for the `READY` column to become `True` (it takes a few minutes for Let's Encrypt to verify your domain).

3. **Test the Application:**
   Open your browser and navigate to `https://delivo.yourdomain.com`.

## Cleanup (Optional)

If you need to tear down the environment to stop incurring costs:
```bash
cd infra/terraform
terraform destroy -auto-approve
```
