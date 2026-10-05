# República Digital de Novatlantis — Aplicações, Microsserviços, Agentes IA & Demos Federadas (`LATAM-PS-CE-Team/novatlantis-app`)

> **Idiomas da Documentação / Documentation Languages:**
> - 🇧🇷 **Português (Oficial):** [README.md](./README.md) • **Documentação Completa (PT):** [docs/DOCUMENTACAO_COMPLETA_NOVATLANTIS.md](./docs/DOCUMENTACAO_COMPLETA_NOVATLANTIS.md)
> - 🇪🇸 **Español:** [README.es.md](./README.es.md) • **Documentación Completa (ES):** [docs/DOCUMENTACAO_COMPLETA_NOVATLANTIS.es.md](./docs/DOCUMENTACAO_COMPLETA_NOVATLANTIS.es.md)
> - 🇺🇸 **English:** [README.en.md](./README.en.md) • **Full Documentation (EN):** [docs/DOCUMENTACAO_COMPLETA_NOVATLANTIS.en.md](./docs/DOCUMENTACAO_COMPLETA_NOVATLANTIS.en.md)
> - 🏗️ **Infraestrutura como Código (Terraform):** [`LATAM-PS-CE-Team/novatlantis-iac`](https://github.com/LATAM-PS-CE-Team/novatlantis-iac)
> - 🏛️ **Government Data Platform (GDP / EDP):** [`LATAM-PS-CE-Team/novatlantis-data-platform`](https://github.com/LATAM-PS-CE-Team/novatlantis-data-platform)

---

## 1. Visão Geral da Nação AI-First (`gov.novatlantis.cloud` & `dev.gov.novatlantis.cloud`)

A **República Digital de Novatlantis** (`gov.novatlantis.cloud`) é uma nação soberana nativa da era agêntica, projetada com inspiração na estética editorial de **[america.gov](https://america.gov/)** combinada com **Google Material Design (`@mui/material` v6)**, **AlloyDB / SQLite Hybrid Engine**, **Government Data Platform (BigQuery Medallion)** e **Federação Descentralizada de Demos de CEs (`EXTERNAL_FEDERATED_CE`)**, operando no **Google Cloud (Projeto Unificado: `novatlantis` / `1054221034062`)**.

---

## 2. Portais Principais e Microsserviços Nativos (Produção HTTPS `gov.novatlantis.cloud`)

| Aplicação / Microsserviço | Diretório | Domínio Oficial PROD | Domínio Oficial DEV | Papel Institucional & Funcionalidades |
| :--- | :--- | :--- | :--- | :--- |
| **1. Portal Principal + Concierge IA Nacional** | [`apps/landing-portal`](./apps/landing-portal) | [`https://gov.novatlantis.cloud`](https://gov.novatlantis.cloud) | [`https://dev.gov.novatlantis.cloud`](https://dev.gov.novatlantis.cloud) | **Home Page Estilo `america.gov` + Concierge IA**: Catálogo nacional de serviços públicos, vitrine de módulos plugáveis e demos federadas dos CEs, seletor global de idiomas (`PT | ES | EN`) e roteador de subdomínios federados. |
| **2. Portal do Cidadão (Autoatendimento 360°)** | [`apps/citizen-portal`](./apps/citizen-portal) | [`https://portal.gov.novatlantis.cloud`](https://portal.gov.novatlantis.cloud) | [`https://portal.dev.gov.novatlantis.cloud`](https://portal.dev.gov.novatlantis.cloud) | **Aplicação Exclusiva do Cidadão**: Carteira Soberana NID, Grafo Familiar, Saúde HL7 & Telemedicina IA, Educação, Zeladoria 311, Emergência 911, Passaporte ICAO e integração com os 5 módulos plugáveis/federados. |
| **3. Government Backstage & Identidade 360** | [`apps/gov-backstage`](./apps/gov-backstage) | [`https://backstage.gov.novatlantis.cloud`](https://backstage.gov.novatlantis.cloud) | [`https://backstage.dev.gov.novatlantis.cloud`](https://backstage.dev.gov.novatlantis.cloud) | **Console Executivo de Gestores Públicos**: Gabinete do Primeiro-Ministro (**Joao Thiago Poço - JT**), Gestão IAM 360, Saúde, Educação, Comando 311, Despacho 911, Justiça e Governança das Demos Federadas. |
| **4. Tribunal de Justiça Soberano (TJ-NOV)** | [`apps/justice-court-tj`](./apps/justice-court-tj) | [`https://tj.gov.novatlantis.cloud`](https://tj.gov.novatlantis.cloud) | [`https://tj.dev.gov.novatlantis.cloud`](https://tj.dev.gov.novatlantis.cloud) | **Módulo Nativo Plugável (`@novatlantis/portal-sdk`)**: Consulta processual, emissão de certidões judiciais e triagem de petições assistida por IA. |

*(Além dos microsserviços especializados de domínio: [`apps/identity-nid`](./apps/identity-nid), [`apps/services-311`](./apps/services-311), [`apps/emergency-911`](./apps/emergency-911), [`apps/health-telemed`](./apps/health-telemed) e [`apps/education-learn`](./apps/education-learn)).*

---

## 3. Demos Externas Federadas dos CEs (`EXTERNAL_FEDERATED_CE`) — Custos Descentralizados

Para manter os custos de computação e IA (Vertex AI / Cloud Run / GKE) descentralizados na conta Argolis de cada Customer Engineer (CE) enquanto unificamos a experiência na vitrine, no Concierge IA e nos subdomínios oficiais `*.gov.novatlantis.cloud`:

| ID do Módulo | Nome no Portal Novatlantis | CE Responsável | Subdomínio Oficial PROD | Subdomínio Oficial DEV | URL de Origem (Cloud Run / Cluster do CE) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [`multaexec-mprs`](./apps/multaexec-mprs) | **MultaExec.IA — Execução de Pena de Multa (MPRS)** | `@jopoco` (`mprs-cpsi`) | [`https://multaexec.gov.novatlantis.cloud`](https://multaexec.gov.novatlantis.cloud) | [`https://multaexec.dev.gov.novatlantis.cloud`](https://multaexec.dev.gov.novatlantis.cloud) | `https://multaexec-ia-demo-633153854135.southamerica-east1.run.app/#/dashboard` |
| [`vigia-mprs`](./apps/vigia-mprs) | **Vigia.ia — Inteligência de Tutela Coletiva & Jurimetria (MPRS)** | `@jopoco` (`mprs-cpsi`) | [`https://vigia.gov.novatlantis.cloud`](https://vigia.gov.novatlantis.cloud) | [`https://vigia.dev.gov.novatlantis.cloud`](https://vigia.dev.gov.novatlantis.cloud) | `https://vigia-ia-demo-633153854135.southamerica-east1.run.app/#/visao-geral` |
| [`geo-engine-car`](./apps/geo-engine-car) | **GeoEngine CAR — Inteligência Geoespacial & Cadastro Ambiental Rural** | `@vidotto` (`345748407347`) | [`https://geo.gov.novatlantis.cloud`](https://geo.gov.novatlantis.cloud) | [`https://geo.dev.gov.novatlantis.cloud`](https://geo.dev.gov.novatlantis.cloud) | `https://geo-engine-app-345748407347.us-central1.run.app/` |
| [`detran-blockchain`](./apps/detran-blockchain) | **Normas.gov & PN44 DETRAN — Legislação Validada em Blockchain** | `@ernani` | [`https://detran.gov.novatlantis.cloud`](https://detran.gov.novatlantis.cloud) | [`https://detran.dev.gov.novatlantis.cloud`](https://detran.dev.gov.novatlantis.cloud) | `https://material.136.81.200.203.nip.io/pn44detran` |

---

## 4. Credenciais Oficiais para Testes (SSO & Identidade 360)

| NID | Nome / Cargo | E-mail de Login | Senha Inicial | Papel Identidade 360 (`iam_role`) | Acesso ao Backstage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NID-000-0000-0001-9` | **Joao Thiago Poço (JT) — Primeiro-Ministro / Root** | `jt@novatlantis.gov.cloud` | `Novatlantis@0001-9` | `PRIME_MINISTER_ROOT` | **TOTAL (Root L10)** |
| `NID-000-0000-0002-7` | **Dr. Aurelius Valerius (Secretário-Geral)** | `secretario.geral@novatlantis.gov.cloud` | `Novatlantis@0002-7` | `SECRETARY_GENERAL` | **TOTAL (Executivo L9)** |
| `NID-000-0000-0003-5` | **Helena Viana (Gestora Identidade 360)** | `gestor.identidade@novatlantis.gov.cloud` | `Novatlantis@0003-5` | `IDENTITY_MANAGER_360` | **Gestão IAM 360 (L8)** |
| `NID-000-0000-0004-3` | **Dra. Sofia Mendes (Gestora Saúde & Médica)** | `sofia.mendes@saude.novatlantis.gov.cloud` | `Novatlantis@0004-3` | `DOCTOR_AND_HEALTH_MANAGER` | **Saúde & Telemedicina (L6)** |
| `NID-000-0000-0006-0` | **Prof. Lucas Albuquerque (Gestor Educação)** | `lucas.albuquerque@educacao.novatlantis.gov.cloud` | `Novatlantis@0006-0` | `TEACHER_AND_EDU_MANAGER` | **Educação, Provas & Notas (L6)** |
| `NID-000-0000-0008-6` | **Comandante Rafael Santos** | `rafael.santos@operacoes.novatlantis.gov.cloud` | `Novatlantis@0008-6` | `OPERATIONS_311_911_MANAGER` | **Comando 311 & 911 (L6)** |
| `NID-000-0000-0009-4` | **Magistrada Clara Sterling Davis** | `clara.sterling@justica.novatlantis.gov.cloud` | `Novatlantis@0009-4` | `JUSTICE_AND_TREASURY_MANAGER` | **Justiça & Tesouro (L7)** |
| `NID-000-0000-0010-8` | **Pedro Albuquerque Viana (Estudante 11a)** | `pedro.albuquerque@cidadao.novatlantis.gov.cloud` | `Novatlantis@0010-8` | `CITIZEN_COMMON` | **Negado (Apenas Portal Cidadão)** |
