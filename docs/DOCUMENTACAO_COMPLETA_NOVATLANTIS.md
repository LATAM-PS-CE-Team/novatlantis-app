# Arquitetura da Aplicação — Novatlantis

## 1. Visão Geral

A plataforma Novatlantis é composta por três portais principais em React + Node.js (`landing-portal`, `citizen-portal` e `gov-backstage`), microsserviços de domínio executados no Cloud Run e um mecanismo de plugins (`@novatlantis/portal-sdk`) que integra módulos locais e demos externas.

## 2. Componentes

- **`apps/landing-portal`**: Página inicial com catálogo de serviços, busca e assistente de atendimento (`/api/orchestrator/chat`).
- **`apps/citizen-portal`**: Área autenticada do cidadão (identidade digital NID, vínculos familiares, prontuário de saúde, boletim escolar, chamados 311/911 e abertura de empresas).
- **`apps/gov-backstage`**: Painel operacional para servidores públicos com controle de acesso baseado em papéis (`iam_identity_360_roles`).
- **`packages/portal-sdk`**: Descoberta automática de módulos declarados via `novatlantis.app.json` e roteamento de chamadas `/api/v1/apps/:appId/*`.
- **`first-responder-agent`**: Agente construído com Google ADK (Agent Development Kit) para triagem de ocorrências.

## 3. Persistência de Dados

Os portais utilizam AlloyDB for PostgreSQL (`novatlantis-sovereign-cluster`) como banco relacional primário e mantêm fallback local em SQLite (`gdf_sovereign.db`) para execução isolada em containers e desenvolvimento local. Os dados analíticos são sincronizados com os datasets do BigQuery mantidos no repositório `novatlantis-data-platform`.

## 4. Autenticação e SSO

O módulo `authModule.mjs` gerencia sessões via cookie HTTP-only e tokens SSO (`sso_token`) compartilhados entre `gov.novatlantis.cloud`, `portal.gov.novatlantis.cloud` e `backstage.gov.novatlantis.cloud`. Consultas públicas no catálogo e no assistente não exigem login; a autenticação é solicitada apenas ao iniciar um serviço nominal.
