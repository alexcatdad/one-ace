# Container Registry Setup

ACE container images are published to a registry after successful CI builds. Configure one of the
following options before enabling the docker push workflow.

## GitHub Container Registry (GHCR)

1. Enable GHCR for your organization (`https://github.com/orgs/<org>/packages`).
2. Create a fine-grained PAT with `write:packages` scope.
3. Store the credentials as:
   - `CONTAINER_REGISTRY_USERNAME` – GitHub username.
   - `CONTAINER_REGISTRY_PASSWORD` – Personal Access Token.
4. Update the docker push workflow to use `ghcr.io/<org>/<image>:<tag>`.

## Docker Hub

1. Create a repository for each service (e.g., `one-ace/api-gateway`).
2. Store Docker Hub credentials in:
   - `CONTAINER_REGISTRY_USERNAME`
   - `CONTAINER_REGISTRY_PASSWORD`
3. Update the docker push workflow to authenticate with Docker Hub and push tagged images.

## Tagging Strategy

- Images are tagged with the Git SHA (`ci-${GITHUB_SHA}`) in CI builds.
- For release branches, push an additional semantic version tag (e.g., `v1.0.0`).
- Retain at least the latest 10 tags per service to facilitate rollbacks.

