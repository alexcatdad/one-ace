# GitHub Secrets Reference

The CI/CD workflows require the following secrets to be configured in the repository or organization
settings. Do **not** commit secret values to the repository.

| Secret | Purpose |
| --- | --- |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Deploy Terraform modules, build/publish containers |
| `AWS_DEFAULT_REGION` | Region override for Terraform/CLI tools (defaults to `us-east-1`) |
| `CONTAINER_REGISTRY_USERNAME` / `CONTAINER_REGISTRY_PASSWORD` | Authenticate Docker builds (GHCR or Docker Hub) |
| `KUBECONFIG_B64` | Base64-encoded kubeconfig used for CD steps |
| `TERRAFORM_CLOUD_TOKEN` | Access Terraform Cloud workspace for state and policy evaluation |

Optional secrets:

- `SLACK_WEBHOOK_URL` – Notifications for CI failures.
- `SENTRY_DSN` – Error tracing during integration tests.

Update this document whenever new workflow steps require additional credentials.

