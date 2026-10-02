## Resumo da Alteração (República Digital de Novatlantis — `LATAM-PS-CE-Team`)

Descreva de forma clara e objetiva o que este Pull Request adiciona, corrige ou melhora:
- 

## Branch e Ambiente Alvo deste Pull Request

- [ ] **Branch `dev` (Ambiente `dev`)** — Merge livre após validação do Cloud Build (sem necessidade de aprovação humana).
- [ ] **Branch `main` (Ambiente `prod`)** — Promoção para Produção (exige aprovação obrigatória de `@pedrocalixto`).

## Componentes Afetados (Marque com `[x]`)

- [ ] `apps/landing-portal` (Portal Principal & Concierge IA)
- [ ] `apps/citizen-portal` (Portal do Cidadão 360°)
- [ ] `apps/gov-backstage` (Backstage Governamental & Identidade 360)
- [ ] `apps/identity-nid` / `packages/auth-client` (Autenticação & Identidade NID)
- [ ] `apps/services-311` / `apps/emergency-911` (Zeladoria 311 / Emergência 911)
- [ ] `apps/health-telemed` / `apps/education-learn` (Saúde HL7 / Educação)
- [ ] `first-responder-agent` (Agente ADK no Vertex AI Agent Engine)
- [ ] `packages/shared-ui` (Design System & Ativos Compartilhados)

## Checklist de Qualidade e Segurança Soberana

- [ ] Testei a compilação localmente (`npm run build` ou `uv run pytest`).
- [ ] Mantive suporte trilíngue (`pt-BR`, `es-419`, `en-US`) nas telas alteradas.
- [ ] Não incluí chaves privadas, senhas ou credenciais estáticas no código.
- [ ] Verifiquei se a esteira automática do **Google Cloud Build** passou com sucesso.
