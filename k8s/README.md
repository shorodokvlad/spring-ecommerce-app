# Kubernetes Deployment

Kubernetes manifests for the Spring Boot backend of this e-commerce app.

## Architecture

```
                 ┌─────────────┐
   Users ──────► │   Vercel    │  React frontend (client/)
                 └──────┬──────┘
                        │ HTTPS (REST API)
                 ┌──────▼──────────────────────────────┐
                 │        Kubernetes cluster           │
                 │  Ingress (nginx)                    │
                 │     └─► Service (ClusterIP)         │
                 │           └─► Deployment (2 pods,   │
                 │               HPA scales 2→5)       │
                 └──────┬──────────────────────────────┘
                        │ JDBC (session pooler)
                 ┌──────▼──────┐        ┌──────────┐
                 │  Supabase   │        │  AWS S3  │  product images
                 │  Postgres   │        └──────────┘
                 └─────────────┘
```

- **Image**: built by GitHub Actions on every push to `main`
  (`.github/workflows/deploy.yml`) and published to
  `ghcr.io/shorodokvlad/spring-ecommerce-app`.
- **Config**: non-secret settings in a `ConfigMap`; credentials
  (Supabase, JWT, S3) in a `Secret` that is never committed.
- **Scaling**: `HorizontalPodAutoscaler` keeps 2–5 replicas at ~70% CPU.
  The app is stateless (state lives in Supabase/S3), so pods can scale
  and restart freely.

## Files

| File | Purpose |
|---|---|
| `deployment.yaml` | Runs the backend (2 replicas, probes, resource limits) |
| `service.yaml` | Stable in-cluster endpoint, port 80 → 2424 |
| `ingress.yaml` | Public HTTPS entry point (nginx ingress) |
| `configmap.yaml` | Non-secret environment config |
| `secret.example.yaml` | Template for credentials (copy → `secret.yaml`, gitignored) |
| `hpa.yaml` | CPU-based autoscaling 2–5 pods |

## Deploy

Prereqs: a cluster (kind/minikube locally, or any managed cluster) and `kubectl`.

```bash
# 1. Create the secret (see secret.example.yaml for the create command)
kubectl create secret generic ecommerce-secrets --from-literal=...

# 2. Apply everything else
kubectl apply -f k8s/

# 3. Watch it come up
kubectl get pods -w
kubectl logs deployment/ecommerce-backend
```

Note: the GHCR image is private by default. Either make the package
public (GitHub → Packages → package settings → Change visibility) or
give the cluster a pull secret:

```bash
kubectl create secret docker-registry ghcr-pull \
  --docker-server=ghcr.io \
  --docker-username=<github-username> \
  --docker-password=<personal-access-token-with-read:packages>
```

and add `imagePullSecrets: [{name: ghcr-pull}]` to the Deployment's pod spec.
