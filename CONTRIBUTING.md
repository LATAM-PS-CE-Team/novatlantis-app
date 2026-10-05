# Guia de Contribuição — `novatlantis-app`

## Branches e Deploy

O repositório utiliza duas branches permanentes conectadas ao Google Cloud Build via Workload Identity Federation (projeto `novatlantis`):

| Branch | Ambiente | Domínio | Regra de Merge |
| :--- | :--- | :--- | :--- |
| `dev` | Desenvolvimento (`novatlantis-dev-*`) | `*.dev.gov.novatlantis.cloud` | Merge liberado após validação do pipeline de PR (`cloudbuild-pr.yaml`). |
| `main` | Produção (`novatlantis-prod-*`) | `*.gov.novatlantis.cloud` | Requer aprovação de `@pedrocalixto` (`CODEOWNERS`). |

O script [`cloudbuild/scripts/detect-changed-services.sh`](./cloudbuild/scripts/detect-changed-services.sh) identifica quais diretórios foram alterados no commit e reconstrói apenas os serviços afetados.

## Adicionando um Novo Módulo ou Demo

1. Gere a estrutura base:
   ```bash
   node scripts/create-novatlantis-app.mjs <nome-do-modulo>
   ```
2. Edite `apps/<nome-do-modulo>/novatlantis.app.json` e `apps/<nome-do-modulo>/plugin.mjs`:
   - Para **demos externas** hospedadas em outra conta GCP, use `"deploymentMode": "EXTERNAL_FEDERATED_CE"`, `"federatedSubdomain": "<subdominio>"` e `"externalTargetUrl": "https://..."`.
   - Para **serviços locais** em Cloud Run, inclua o `Dockerfile` na pasta do serviço.
3. Copie o manifesto e o plugin para a pasta `pluggable-apps/` dos três portais (`landing-portal`, `citizen-portal` e `gov-backstage`) e abra um Pull Request para `dev`.
