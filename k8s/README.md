# Kubernetes Deployment — Delivo on AKS

## Prerequisites (one-time cluster setup)

Run these commands once against your AKS cluster before the first deploy.

### 1. Install nginx-ingress controller
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.replicaCount=2
```

### 2. Install cert-manager
```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true
```

### 3. Get the ingress external IP and set DNS
```bash
kubectl get svc -n ingress-nginx ingress-nginx-controller
# Wait until EXTERNAL-IP is assigned (not <pending>)
```

Create **A records** in your DNS provider pointing all three subdomains to that IP:
```
delivo.yourdomain.com     →  <EXTERNAL-IP>
api.delivo.yourdomain.com →  <EXTERNAL-IP>
ws.delivo.yourdomain.com  →  <EXTERNAL-IP>
```

### 4. Replace placeholders in k8s/ manifests
```bash
# Replace YOUR_DOMAIN throughout all manifests
find k8s/ -name "*.yaml" -exec sed -i 's/YOUR_DOMAIN/delivo.yourdomain.com/g' {} +

# Replace YOUR_ACR_REGISTRY
find k8s/ -name "*.yaml" -exec sed -i 's/YOUR_ACR_REGISTRY/delivoregistry.azurecr.io/g' {} +

# Replace YOUR_EMAIL in ingress.yaml
sed -i 's/YOUR_EMAIL/you@example.com/' k8s/ingress.yaml
```

### 5. Apply manifests manually (first time)
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml

# Create the app secret manually on first deploy
kubectl create secret generic delivo-secrets \
  --namespace=delivo \
  --from-literal=DATABASE_URL="<your-db-url>" \
  --from-literal=JWT_ACCESS_SECRET="<your-secret>" \
  --from-literal=JWT_REFRESH_SECRET="<your-secret>" \
  --from-literal=GOOGLE_CLIENT_ID="<your-client-id>" \
  --from-literal=RABBITMQ_URL="amqp://guest:guest@rabbitmq:5672"

kubectl apply -f k8s/ --recursive
```

---

## CI/CD Flow (after first-time setup)

```
git push origin main
       ↓
GitHub Actions (.github/workflows/deploy.yml)
       ↓
Build 8 Docker images → Push to ACR (tagged with git SHA)
       ↓
kubectl set image → AKS rolling update
       ↓
Readiness probes gate traffic → broken pods never receive requests
       ↓
kubectl rollout status waits for all deployments ✓
```

---

## Required GitHub Secrets

| Secret | Description |
|---|---|
| `AZURE_CREDENTIALS` | `az ad sp create-for-rbac --sdk-auth` JSON output |
| `ACR_REGISTRY` | e.g. `delivoregistry.azurecr.io` |
| `ACR_USERNAME` | ACR admin username |
| `ACR_PASSWORD` | ACR admin password |
| `AKS_CLUSTER_NAME` | Your AKS cluster name |
| `AKS_RESOURCE_GROUP` | Azure resource group name |
| `APP_DOMAIN` | e.g. `delivo.yourdomain.com` |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Random secret string |
| `JWT_REFRESH_SECRET` | Random secret string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `LETSENCRYPT_EMAIL` | Email for cert expiry notifications |

---

## Domain Layout

| URL | Routes to |
|---|---|
| `https://delivo.yourdomain.com` | web-app (nginx, port 80) |
| `https://api.delivo.yourdomain.com` | api-gateway (port 3000) |
| `wss://ws.delivo.yourdomain.com` | notification-service / Socket.io (port 3006) |

All routes enforce HTTPS redirect. TLS certificates are issued and auto-renewed by cert-manager via Let's Encrypt.

---

## Useful Commands

```bash
# Check all pods
kubectl get pods -n delivo

# Check ingress and cert status
kubectl get ingress,certificate -n delivo

# View logs for a service
kubectl logs -n delivo -l app=api-gateway --tail=100 -f

# Force a rollout (e.g. to pick up a config change)
kubectl rollout restart deployment/user-service -n delivo

# Check rollout status
kubectl rollout status deployment/api-gateway -n delivo
```
