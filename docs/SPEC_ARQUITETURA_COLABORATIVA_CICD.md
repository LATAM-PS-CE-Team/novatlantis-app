# Especificação de Implementação — Arquitetura Colaborativa, GitOps e CI/CD (`LATAM-PS-CE-Team`)

**Sistema:** República Digital de Novatlantis (`novatlantis.gov.cloud`)  
**Organização GitHub:** [`https://github.com/LATAM-PS-CE-Team`](https://github.com/LATAM-PS-CE-Team)  
**Administrador & Code Owner de Produção (`main`):** Pedro Calixto (`@pedrocalixto`)  
**Ambientes Oficiais:** `dev` (branch `dev`) e `prod` (branch `main`)

---

## 1. Resumo Executivo

Para permitir que todos os Customer Engineers (CEs) do time de Setor Público colaborem simultaneamente usando o Git como **Fonte Única de Verdade (*Single Source of Truth — SSOT*)**, o projeto Novatlantis foi dividido em **3 repositórios especializados** dentro da organização [`LATAM-PS-CE-Team`](https://github.com/LATAM-PS-CE-Team):

1. **[`LATAM-PS-CE-Team/novatlantis-app`](https://github.com/LATAM-PS-CE-Team/novatlantis-app)**: Código-fonte dos 8 microsserviços Cloud Run (`apps/*`), pacotes compartilhados (`packages/*`) e o agente ADK (`first-responder-agent/*`).
2. **[`LATAM-PS-CE-Team/novatlantis-iac`](https://github.com/LATAM-PS-CE-Team/novatlantis-iac)**: Infraestrutura como Código (*IaC*) em Terraform declarativo para VPC, AlloyDB, Cloud Armor WAF, Load Balancer, Artifact Registry, IAM e Cloud Build Triggers.
3. **[`LATAM-PS-CE-Team/novatlantis-data-platform`](https://github.com/LATAM-PS-CE-Team/novatlantis-data-platform)**: Plataforma de Dados Governamental (GDP/EDP), gerador de 100.000 cidadãos e *schemas* SQL/BigQuery.

---

## 2. Governança de Branches e Ambientes (`dev` e `prod`)

Cada repositório possui apenas **duas branches permanentes** (`dev` e `main`):

| Branch no GitHub | Ambiente no GCP | Regra de Merge e Aprovação |
| :--- | :--- | :--- |
| **`dev`** | **Ambiente `dev`** (`novatlantis-dev-*`, `environments/dev`) | **Merge Livre (0 aprovações exigidas):** Qualquer pessoa abre PR da sua branch local (`feat/...`) contra a branch `dev` e faz o merge sem precisar de aprovação humana. |
| **`main`** | **Ambiente `prod`** (`novatlantis-prod-*`, `environments/prod`) | **Aprovação Obrigatória de `@pedrocalixto`:** Qualquer pessoa pode abrir PR promovendo de `dev` $\rightarrow$ `main`, mas o merge na `main` exige aprovação explícita de `@pedrocalixto` (`CODEOWNERS`). |

---

## 3. Como Executar a Atualização / Provisionamento

### Passo 1: Separar e Inicializar os 3 Repositórios Localmente
```bash
bash cicd-architecture/scripts/split-repositories.sh /tmp/novatlantis-split
```

### Passo 2: Atualizar os 3 Repositórios na Org `LATAM-PS-CE-Team` e Aplicar Proteção nas Branches `dev` e `main`
```bash
bash cicd-architecture/scripts/setup-github-org-and-repos.sh /tmp/novatlantis-split
```

### Passo 3: Inicializar o Bucket de Estado Terraform e a Service Account no GCP (Day-0 Bootstrap)
```bash
bash cicd-architecture/novatlantis-iac/bootstrap/bootstrap-cicd-foundation.sh
```
