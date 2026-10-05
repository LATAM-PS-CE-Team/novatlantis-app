# novatlantis-app

Aplicações web, microsserviços e módulos plugáveis do portal **Novatlantis** (`gov.novatlantis.cloud`).

Repositórios relacionados:
- Infraestrutura (Terraform): [`LATAM-PS-CE-Team/novatlantis-iac`](https://github.com/LATAM-PS-CE-Team/novatlantis-iac)
- Plataforma de Dados (BigQuery): [`LATAM-PS-CE-Team/novatlantis-data-platform`](https://github.com/LATAM-PS-CE-Team/novatlantis-data-platform)

## Serviços Principais

| Serviço | Diretório | Produção (`main`) | Desenvolvimento (`dev`) | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **Portal Principal** | [`apps/landing-portal`](./apps/landing-portal) | [`gov.novatlantis.cloud`](https://gov.novatlantis.cloud) | [`dev.gov.novatlantis.cloud`](https://dev.gov.novatlantis.cloud) | Catálogo de serviços, busca e assistente de atendimento. |
| **Portal do Cidadão** | [`apps/citizen-portal`](./apps/citizen-portal) | [`portal.gov.novatlantis.cloud`](https://portal.gov.novatlantis.cloud) | [`portal.dev.gov.novatlantis.cloud`](https://portal.dev.gov.novatlantis.cloud) | Carteira de identidade (NID), saúde, educação, chamados 311/911 e passaporte. |
| **Backstage** | [`apps/gov-backstage`](./apps/gov-backstage) | [`backstage.gov.novatlantis.cloud`](https://backstage.gov.novatlantis.cloud) | [`backstage.dev.gov.novatlantis.cloud`](https://backstage.dev.gov.novatlantis.cloud) | Painel administrativo para servidores públicos e gestão de acessos. |
| **Tribunal de Justiça** | [`apps/justice-court-tj`](./apps/justice-court-tj) | [`tj.gov.novatlantis.cloud`](https://tj.gov.novatlantis.cloud) | [`tj.dev.gov.novatlantis.cloud`](https://tj.dev.gov.novatlantis.cloud) | Consulta processual, emissão de certidões e juizado especial. |

Outros serviços de domínio em `apps/`: [`identity-nid`](./apps/identity-nid), [`services-311`](./apps/services-311), [`emergency-911`](./apps/emergency-911), [`health-telemed`](./apps/health-telemed) e [`education-learn`](./apps/education-learn).

## Demos Integradas (Federadas)

Demos hospedadas nos projetos GCP de cada desenvolvedor e integradas ao catálogo e aos subdomínios de Novatlantis:

| Módulo | Nome | Responsável | Subdomínio (`prod`) | Destino |
| :--- | :--- | :--- | :--- | :--- |
| [`multaexec-mprs`](./apps/multaexec-mprs) | MultaExec.IA (MPRS) | `MPRS` | [`multaexec.gov.novatlantis.cloud`](https://multaexec.gov.novatlantis.cloud) | `https://multaexec-ia-demo-633153854135.southamerica-east1.run.app/#/dashboard` |
| [`vigia-mprs`](./apps/vigia-mprs) | Vigia.ia (MPRS) | `MPRS` | [`vigia.gov.novatlantis.cloud`](https://vigia.gov.novatlantis.cloud) | `https://vigia-ia-demo-633153854135.southamerica-east1.run.app/#/visao-geral` |
| [`geo-engine-car`](./apps/geo-engine-car) | GeoEngine CAR | `SEMA` | [`geo.gov.novatlantis.cloud`](https://geo.gov.novatlantis.cloud) | `https://geo-engine-app-345748407347.us-central1.run.app/` |
| [`detran-blockchain`](./apps/detran-blockchain) | PN44 DETRAN | `@ernani` | [`detran.gov.novatlantis.cloud`](https://detran.gov.novatlantis.cloud) | `https://material.136.81.200.203.nip.io/pn44detran` |

## Contas de Teste

| NID | Nome | Cargo / Papel | E-mail | Senha Inicial | Acesso ao Backstage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NID-000-0000-0001-9` | Joao Thiago Poço (JT) | Primeiro-Ministro (`PRIME_MINISTER_ROOT`) | `jt@novatlantis.gov.cloud` | `Novatlantis@0001-9` | Sim (Total) |
| `NID-000-0000-0002-7` | Dr. Aurelius Valerius | Secretário-Geral (`SECRETARY_GENERAL`) | `secretario.geral@novatlantis.gov.cloud` | `Novatlantis@0002-7` | Sim (Total) |
| `NID-000-0000-0003-5` | Helena Viana | Gestora de Acessos (`IDENTITY_MANAGER_360`) | `gestor.identidade@novatlantis.gov.cloud` | `Novatlantis@0003-5` | Sim (IAM) |
| `NID-000-0000-0004-3` | Dra. Sofia Mendes | Médica (`DOCTOR_AND_HEALTH_MANAGER`) | `sofia.mendes@saude.novatlantis.gov.cloud` | `Novatlantis@0004-3` | Sim (Saúde) |
| `NID-000-0000-0006-0` | Prof. Lucas Albuquerque | Professor (`TEACHER_AND_EDU_MANAGER`) | `lucas.albuquerque@educacao.novatlantis.gov.cloud` | `Novatlantis@0006-0` | Sim (Educação) |
| `NID-000-0000-0008-6` | Comandante Rafael Santos | Operações (`OPERATIONS_311_911_MANAGER`) | `rafael.santos@operacoes.novatlantis.gov.cloud` | `Novatlantis@0008-6` | Sim (311/911) |
| `NID-000-0000-0009-4` | Clara Sterling Davis | Magistrada (`JUSTICE_AND_TREASURY_MANAGER`) | `clara.sterling@justica.novatlantis.gov.cloud` | `Novatlantis@0009-4` | Sim (Justiça) |
| `NID-000-0000-0010-8` | Pedro Albuquerque Viana | Estudante (`CITIZEN_COMMON`) | `pedro.albuquerque@cidadao.novatlantis.gov.cloud` | `Novatlantis@0010-8` | Não (Apenas Portal do Cidadão) |

## Desenvolvimento Local

```bash
npm install
npm run dev --workspace=apps/landing-portal
```

Para conectar uma nova demo ou módulo, veja o guia passo a passo em [`docs/ONBOARDING.md`](./docs/ONBOARDING.md), [`CONTRIBUTING.md`](./CONTRIBUTING.md) e [`docs/DOCUMENTACAO_COMPLETA_NOVATLANTIS.md`](./docs/DOCUMENTACAO_COMPLETA_NOVATLANTIS.md).
