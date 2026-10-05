# Guia de Contribuição — `LATAM-PS-CE-Team/novatlantis-app`

Bem-vindo ao repositório oficial de aplicações, microsserviços, agentes ADK e módulos federados da **República Digital de Novatlantis** (`gov.novatlantis.cloud` e `dev.gov.novatlantis.cloud`), mantido pelo time de Customer Engineers (CE) de Setor Público da América Latina ([`LATAM-PS-CE-Team`](https://github.com/LATAM-PS-CE-Team)).

Este repositório opera como **Fonte Única de Verdade (*Single Source of Truth*)**. Toda alteração é validada e implantada automaticamente via **GitHub Actions (Keyless WIF) + Google Cloud Build** no projeto GCP unificado **`novatlantis` (`1054221034062`)**.

---

## 1. Regra de Branches e Ambientes (`dev` e `prod`)

Existem apenas **duas branches permanentes** no repositório:

| Branch Alvo | Ambiente no Projeto `novatlantis` | Domínio Oficial | Regra de Aprovação e Merge |
| :--- | :--- | :--- | :--- |
| **`dev`** | **Ambiente `dev`** (`novatlantis-dev-*`, repo `novatlantis-dev-gov-repo`) | `*.dev.gov.novatlantis.cloud` | **Sem entraves (0 aprovações exigidas):** Qualquer colaborador pode abrir PR da sua branch local (`feat/...`) contra a branch **`dev`** e fazer o merge após o check verde. |
| **`main`** | **Ambiente `prod`** (`novatlantis-prod-*`, repo `novatlantis-prod-gov-repo`) | `*.gov.novatlantis.cloud` | **Aprovação obrigatória de `@pedrocalixto`:** Qualquer colaborador pode abrir PR promovendo a branch **`dev`** para a branch **`main`**, com aprovação de **`@pedrocalixto`** (`CODEOWNERS`). |

---

## 2. Como Plugar uma Nova Demo de CE (`EXTERNAL_FEDERATED_CE` ou `CLOUD_RUN_NATIVE`)

Para adicionar uma nova aplicação ou demo externa de CE (mantendo os custos de execução na conta Argolis do próprio CE e expondo um subdomínio oficial `<app>.gov.novatlantis.cloud`):

1. Crie o manifesto `apps/<seu-app>/novatlantis.app.json` e o adaptador `apps/<seu-app>/plugin.mjs` (ou use `node scripts/create-novatlantis-app.mjs <seu-app>`).
2. Para demos hospedadas na própria conta Argolis do CE, defina `"mode": "EXTERNAL_FEDERATED_CE"` e `"externalUrl": "https://<seu-cloud-run>.run.app"` em `deployment`.
3. Sincronize a pasta em `apps/landing-portal/pluggable-apps/`, `apps/citizen-portal/pluggable-apps/` e `apps/gov-backstage/pluggable-apps/` e abra o Pull Request para `dev`.
