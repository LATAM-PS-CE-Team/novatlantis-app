# Especificação de CI/CD — Novatlantis

## Estrutura de Repositórios

| Repositório | Escopo | Pipelines Cloud Build |
| :--- | :--- | :--- |
| `LATAM-PS-CE-Team/novatlantis-iac` | Terraform (`networking`, `database-alloydb`, `security-iam-secrets`, `cloud-run-services`, `edge-lb-armor`) | `cloudbuild-tf-plan.yaml` (PR) / `cloudbuild-tf-apply.yaml` (deploy) |
| `LATAM-PS-CE-Team/novatlantis-app` | Portais, microsserviços Cloud Run e plugins | `cloudbuild-pr.yaml` (PR) / `cloudbuild-deploy.yaml` (deploy incremental) |
| `LATAM-PS-CE-Team/novatlantis-data-platform` | Datasets BigQuery, DAGs e gerador de dados | `cloudbuild-pr.yaml` (PR) / `cloudbuild-deploy.yaml` (deploy) |

## Isolamento de Ambientes no Projeto `novatlantis`

Ambos os ambientes (`dev` e `prod`) rodam no projeto Google Cloud `novatlantis` (`PROJECT_NUMBER`) com recursos isolados por prefixo e rede:

- **`dev` (branch `dev`)**: VPC `novatlantis-dev-vpc` (`10.10.0.0/20`), Artifact Registry `novatlantis-dev-gov-repo`, serviços `novatlantis-dev-*`, Load Balancer IP `136.81.6.22` (`*.dev.gov.novatlantis.cloud`), state `gs://novatlantis-tfstate/iac/dev`.
- **`prod` (branch `main`)**: VPC `novatlantis-prod-vpc` (`10.20.0.0/20`), Artifact Registry `novatlantis-prod-gov-repo`, serviços `novatlantis-prod-*`, Load Balancer IP `136.81.9.16` (`*.gov.novatlantis.cloud`), state `gs://novatlantis-tfstate/iac/prod`.

## Autenticação GitHub Actions -> GCP

Os workflows `.github/workflows/cicd.yml` autenticam no Google Cloud via Workload Identity Federation (`github-latam-ps-ce-pool` / `github-oidc-provider`) usando a Service Account `novatlantis-cicd-deployer@novatlantis.iam.gserviceaccount.com`, sem chaves JSON estáticas.
