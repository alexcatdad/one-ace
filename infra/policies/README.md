# Policy-as-Code Guidelines

This directory contains Open Policy Agent (OPA) policies that enforce deployment guardrails for the
ACE infrastructure. Integrate these policies in Terraform Cloud, Atlantis, or a custom CI gate
before applying infrastructure changes.

## Available Policies

- `ensure-tags.rego` – Requires foundational AWS resources (VPC, EKS) to include `Environment` and
  `Name` tags, preventing untracked cloud assets.

## Usage with Terraform Cloud

1. Upload the policies via the Sentinel integration or use the `opa` runner in a pipeline:
   ```sh
   opa eval --format pretty --data infra/policies --input tfplan.json "data.ace.policies.tagging"
   ```
2. Fail the deployment when `deny` results are returned.
3. Extend policies with additional guardrails (e.g., encryption, CIDR allow lists).

Policies should evolve alongside infrastructure. Treat them as code: review changes, add tests, and
version control updates.

