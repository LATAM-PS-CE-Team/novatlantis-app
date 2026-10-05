# Especificação de Implementação — Arquitetura Colaborativa, GitOps e CI/CD (`LATAM-PS-CE-Team`)

**Sistema:** República Digital de Novatlantis (`gov.novatlantis.cloud` e `dev.gov.novatlantis.cloud`)  
**Organização GitHub:** [`https://github.com/LATAM-PS-CE-Team`](https://github.com/LATAM-PS-CE-Team)  
**Projeto GCP Unificado:** `novatlantis` (`1054221034062`)  
**Administrador & Code Owner de Produção (`main`):** Pedro Calixto (`@pedrocalixto`)  
**Ambientes Oficiais:** `dev` (branch `dev` $\rightarrow$ `*.dev.gov.novatlantis.cloud`) e `prod` (branch `main` $\rightarrow$ `*.gov.novatlantis.cloud`)

---

## 1. Resumo Executivo

Para permitir que todos os Customer Engineers (CEs) do time de Setor Público colaborem simultaneamente usando o Git como **Fonte Única de Verdade (*Single Source of Truth — SSOT*)**, o ecossistema Novatlantis é composto por **3 repositórios especializados** dentro da organização [`LATAM-PS-CE-Team`](https://github.com/LATAM-PS-CE-Team):

1. **[`LATAM-PS-CE-Team/novatlantis-app`](https://github.com/LATAM-PS-CE-Team/novatlantis-app)**: Código-fonte dos 9 microsserviços Cloud Run (`apps/*`), das 4 demos externas federadas dos CEs (`EXTERNAL_FEDERATED_CE`), pacotes compartilhados (`packages/*`) e o agente ADK (`first-responder-agent/*`).
2. **[`LATAM-PS-CE-Team/novatlantis-iac`](https://github.com/LATAM-PS-CE-Team/novatlantis-iac)**: Infraestrutura como Código (*IaC*) em Terraform declarativo para VPCs isoladas (`dev` e `prod`), AlloyDB, Cloud Armor WAF, Global Load Balancers (`136.81.9.16` e `136.81.6.22`), Certificados SSL Gerenciados, Artifact Registry e Secret Manager.
3. **[`LATAM-PS-CE-Team/novatlantis-data-platform`](https://github.com/LATAM-PS-CE-Team/novatlantis-data-platform)**: Plataforma de Dados Governamental (GDP/EDP), arquitetura Medallion no BigQuery e gerador sintético de 100.000 cidadãos.

---

## 2. Governança de Branches, Isolamento no Projeto `novatlantis` e Keyless WIF

Todos os 3 repositórios autenticam sem chaves estáticas (*Keyless OIDC*) no projeto `novatlantis` (`1054221034062`) via:
- **Workload Identity Provider:** `projects/1054221034062/locations/global/workloadIdentityPools/github-latam-ps-ce-pool/providers/github-oidc-provider`
- **Service Account de CI/CD:** `novatlantis-cicd-deployer@novatlantis.iam.gserviceaccount.com`

| Branch no GitHub | Ambiente no Projeto `novatlantis` | Domínio & Load Balancer | Regra de Merge e Aprovação |
| :--- | :--- | :--- | :--- |
| **`dev`** | **Ambiente `dev`** (`novatlantis-dev-*`, `gs://novatlantis-tfstate/iac/dev`) | `dev.gov.novatlantis.cloud` (`136.81.6.22`) | **Merge Livre (0 aprovações exigidas):** Qualquer colaborador abre PR da sua branch local contra `dev` e faz o merge após o check verde. |
| **`main`** | **Ambiente `prod`** (`novatlantis-prod-*`, `gs://novatlantis-tfstate/iac/prod`) | `gov.novatlantis.cloud` (`136.81.9.16`) | **Aprovação Obrigatória de `@pedrocalixto`:** Promoção `dev` $\rightarrow$ `main` revisada por `@pedrocalixto` (`CODEOWNERS`). |
