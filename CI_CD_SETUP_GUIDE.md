# CI/CD Setup Guide for Delivo

Your CI/CD pipeline using GitHub Actions (`.github/workflows/deploy.yml`) is nearly complete! I have fixed the branch mismatch and added dynamic manifest replacement so your pipeline will correctly inject your domain and Azure configurations directly into Kubernetes.

To get your automated deployments running, you just need to configure your GitHub repository settings. Follow this step-by-step guide.

---

## Step 1: Generate Azure Credentials

GitHub needs permission to log in to Azure, manage your ACR, and connect to AKS.

1. Open your terminal and log in to Azure:
   ```bash
   az login
   ```
2. Get your Subscription ID:
   ```bash
   az account show --query id -o tsv
   ```
3. Create a Service Principal for GitHub Actions (replace `<SUBSCRIPTION_ID>` with the ID from above):
   ```bash
   az ad sp create-for-rbac --name "github-actions-delivo" --role contributor --scopes /subscriptions/<SUBSCRIPTION_ID> --sdk-auth
   ```
4. **Copy the entire JSON output**. This is your `AZURE_CREDENTIALS` secret.

---

## Step 2: Add Secrets to GitHub

Go to your repository on GitHub.
Navigate to **Settings** -> **Secrets and variables** -> **Actions**.
Click **New repository secret** and add each of the following:

### Infrastructure Secrets
| Name | Value |
|---|---|
| `AZURE_CREDENTIALS` | Paste the JSON output from Step 1 |
| `AKS_CLUSTER_NAME` | `delivo-cluster` (or the name you used in Terraform) |
| `AKS_RESOURCE_GROUP` | `delivo-rg` |

### Docker / Azure Container Registry (ACR)
You can get your ACR credentials by running `az acr credential show --name delivoregistry123`.

| Name | Value |
|---|---|
| `ACR_REGISTRY` | e.g., `delivoregistry123.azurecr.io` |
| `ACR_USERNAME` | Your ACR username |
| `ACR_PASSWORD` | Your ACR password |

### Application Environment Secrets
These are the variables your app needs to run in production.

| Name | Value |
|---|---|
| `APP_DOMAIN` | e.g., `delivo.yourdomain.com` (Omit the `https://`) |
| `DATABASE_URL` | Your production PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `JWT_ACCESS_SECRET` | A long, random string (e.g., generate via `openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | A different long, random string |
| `LETSENCRYPT_EMAIL` | The email address Let's Encrypt will use for TLS cert expiration warnings |

---

## Step 3: Setup GitHub Environment (Optional but highly recommended)

Your workflow targets an environment called `production`.

1. In GitHub, go to **Settings** -> **Environments**.
2. Click **New environment** and name it `production`.
3. Check the box for **Required reviewers**.
4. Add yourself as a reviewer.

*Why do this?* Whenever code is merged to the `main` branch, GitHub Actions will build your Docker images. But before it deploys them to your AKS cluster, it will pause and ask for your approval. This prevents accidental deployments to live servers.

---

## Step 4: Test the Pipeline

1. Make a small code change (or an empty commit).
2. Commit and push it to the `main` branch.
   ```bash
   git commit --allow-empty -m "Trigger CI/CD pipeline"
   git push origin main
   ```
3. Go to the **Actions** tab in your GitHub repository and watch the magic happen! 🚀
