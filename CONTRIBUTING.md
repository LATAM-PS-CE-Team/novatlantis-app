# Guia de Contribuição — `LATAM-PS-CE-Team/novatlantis-app`

Bem-vindo ao repositório oficial de aplicações e agentes da **República Digital de Novatlantis** (`novatlantis.gov.cloud`), mantido pelo time de Customer Engineers (CE) de Setor Público da América Latina ([`LATAM-PS-CE-Team`](https://github.com/LATAM-PS-CE-Team)).

Este repositório opera como **Fonte Única de Verdade (*Single Source of Truth*)**. Nenhum deploy é feito manualmente da máquina local: toda alteração entra via **Pull Request (PR)** e é compilada e implantada automaticamente pelo **Google Cloud Build**.

---

## 1. Regra de Branches e Ambientes (`dev` e `prod`)

Existem apenas **duas branches permanentes** no repositório:

| Branch Alvo do PR | Ambiente no GCP | Regra de Aprovação e Merge |
| :--- | :--- | :--- |
| **`dev`** | **Ambiente `dev`** (`novatlantis-dev-*`) | **Sem entraves (0 aprovações exigidas):** Qualquer colaborador pode abrir o PR da sua branch local (`feat/...`) contra a branch **`dev`** e **fazer o merge imediatamente** sem precisar aguardar aprovação. |
| **`main`** | **Ambiente `prod`** (`novatlantis-prod-*`) | **Aprovação obrigatória de `@pedrocalixto`:** Qualquer colaborador pode abrir um PR promovendo a branch **`dev`** para a branch **`main`**, mas o merge na `main` fica bloqueado até receber a aprovação explícita de **`@pedrocalixto`**. |

---

## 2. Passo a Passo para Contribuir

### Passo 1: Clonar o repositório e mudar para a branch `dev`
```bash
git clone https://github.com/LATAM-PS-CE-Team/novatlantis-app.git
cd novatlantis-app
git checkout dev
git pull origin dev
```

### Passo 2: Criar sua branch local de trabalho a partir da `dev`
Use o padrão `feat/<seu-usuario>-<resumo>` ou `fix/<seu-usuario>-<resumo>`:
```bash
git checkout -b feat/novo-painel-telemedicina
```

### Passo 3: Desenvolver, fazer Commit e Push
```bash
git add .
git commit -m "feat(health-telemed): adiciona triagem inteligente no prontuário HL7"
git push -u origin feat/novo-painel-telemedicina
```

### Passo 4: Abrir Pull Request para a branch `dev` (Deploy Rápido no Ambiente `dev`)
1. Abra o Pull Request da sua branch `feat/novo-painel-telemedicina` contra a branch **`dev`**.
2. Aguarde o gatilho `novatlantis-app-pr-check` do **Google Cloud Build** validar sua alteração.
3. Clique você mesmo em **"Merge pull request"** (não há exigência de aprovação na branch `dev`).
4. O gatilho `novatlantis-app-deploy-dev` será disparado automaticamente, construindo a imagem `dev-$SHORT_SHA` no Artifact Registry e atualizando o serviço correspondente (`novatlantis-dev-*`) no Cloud Run!

### Passo 5: Promover para Produção (`dev` $\rightarrow$ `main`)
1. Após validar sua funcionalidade no ambiente `dev`, abra um Pull Request da branch **`dev`** para a branch **`main`**.
2. O GitHub solicitará automaticamente a revisão de **`@pedrocalixto`** (`CODEOWNERS`).
3. Assim que `@pedrocalixto` aprovar e mesclar o PR na branch `main`, o gatilho `novatlantis-app-deploy-prod` publicará a versão oficial em Produção (`novatlantis-prod-*`).
