#!/usr/bin/env bash
# ==============================================================================
# REPÚBLICA DIGITAL DE NOVATLANTIS — DETECÇÃO SELETIVA DE MUDANÇAS (SMART DIFF)
# Repositório: LATAM-PS-CE-Team/novatlantis-app
# Objetivo: Identificar quais microsserviços em apps/* ou se o first-responder-agent
#           foram alterados no Pull Request ou Merge atual (dev ou prod).
# ==============================================================================

set -euo pipefail

WORKSPACE_DIR="${1:-.}"
OUTPUT_SERVICES_FILE="${2:-/workspace/changed_services.txt}"
OUTPUT_AGENT_FILE="${3:-/workspace/changed_agent.txt}"

cd "${WORKSPACE_DIR}"

ALL_SERVICES=(
  "landing-portal"
  "citizen-portal"
  "gov-backstage"
  "identity-nid"
  "services-311"
  "emergency-911"
  "health-telemed"
  "education-learn"
)

mkdir -p "$(dirname "${OUTPUT_SERVICES_FILE}")"
> "${OUTPUT_SERVICES_FILE}"
echo "false" > "${OUTPUT_AGENT_FILE}"

# Determina o range de commits para comparação
if git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
  DIFF_BASE="${_BASE_BRANCH:-HEAD~1}"
  if ! git rev-parse --verify "${DIFF_BASE}" >/dev/null 2>&1; then
    DIFF_BASE="HEAD~1"
  fi
  CHANGED_FILES=$(git diff --name-only "${DIFF_BASE}" HEAD || true)
else
  # Primeiro commit do repositório ou clone raso sem histórico anterior: constrói tudo
  CHANGED_FILES="package.json first-responder-agent/pyproject.toml"
fi

echo "[SMART-DIFF] Arquivos modificados detectados:"
echo "${CHANGED_FILES}" | sed 's/^/  - /'

# Se pacotes compartilhados (packages/*), package.json raiz ou cloudbuild/ mudaram,
# reconstrói todos os 8 microsserviços por segurança.
if echo "${CHANGED_FILES}" | grep -qE '^(packages/|package\.json|cloudbuild/)'; then
  echo "[SMART-DIFF] Alteração detectada em pacotes compartilhados (packages/*) ou configuração global."
  echo "[SMART-DIFF] Marcando todos os ${#ALL_SERVICES[@]} microsserviços para build/deploy."
  for SVC in "${ALL_SERVICES[@]}"; do
    echo "${SVC}" >> "${OUTPUT_SERVICES_FILE}"
  done
else
  for SVC in "${ALL_SERVICES[@]}"; do
    if echo "${CHANGED_FILES}" | grep -qE "^apps/${SVC}/"; then
      echo "[SMART-DIFF] Microsserviço modificado: ${SVC}"
      echo "${SVC}" >> "${OUTPUT_SERVICES_FILE}"
    fi
  done
fi

# Verifica se o agente ADK (first-responder-agent/) sofreu alterações
if echo "${CHANGED_FILES}" | grep -qE '^first-responder-agent/'; then
  echo "[SMART-DIFF] Agente ADK (first-responder-agent) modificado."
  echo "true" > "${OUTPUT_AGENT_FILE}"
fi

echo "[SMART-DIFF] Resumo final:"
echo "  - Microsserviços para processar: $(tr '\n' ' ' < "${OUTPUT_SERVICES_FILE}" || echo 'nenhum')"
echo "  - Agente ADK modificado: $(cat "${OUTPUT_AGENT_FILE}")"
