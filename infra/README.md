# ACE Terraform Infrastructure

This directory contains the infrastructure-as-code foundation for the ACE platform. The structure is
module-oriented to enable composable deployments across environments.

## Layout

```
infra/
├── main.tf              # Environment wiring and module orchestration
├── variables.tf         # Shared variables consumed by modules
├── modules/
│   ├── network/         # VPC, subnets, security groups
│   ├── compute/         # Kubernetes/EKS/GKE cluster definitions
│   ├── database/        # Redis, graph database connectivity
│   └── monitoring/      # Prometheus, Grafana, OpenTelemetry collectors
└── policies/            # Sentinel/OPA policies for deployment gates
```

## Getting Started

1. Install Terraform >= 1.6.0.
2. Configure your AWS credentials (or update providers to match your cloud).
3. Initialize the workspace:
   ```sh
   terraform -chdir=infra init
   ```
4. Plan changes:
   ```sh
   terraform -chdir=infra plan -var="environment=dev"
   ```

Each module exposes outputs designed for composition. For example, the `network` module publishes
VPC and subnet identifiers that feed into the `compute` and `database` modules.

Sentinel or OPA policies can be added to `infra/policies` and enforced via Terraform Cloud or within
your CI pipeline.

