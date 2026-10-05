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

ALL_SERVICES=()
for d in apps/*/; do
  svc_name="$(basename "$d")"
  if [ -f "apps/${svc_name}/Dockerfile" ]; then
    ALL_SERVICES+=("${svc_name}")
  fi
done

# Sincroniza automaticamente o @novatlantis/portal-sdk e todos os manifests/plugins (novatlantis.app.json + plugin.mjs)
# para dentro dos 3 portais principais antes do build Docker
if [ -f "packages/portal-sdk/src/index.mjs" ]; then
  for PORTAL_SVC in landing-portal citizen-portal gov-backstage; do
    if [ -d "apps/${PORTAL_SVC}" ]; then
      cp -f packages/portal-sdk/src/index.mjs "apps/${PORTAL_SVC}/portalSdk.mjs"
      mkdir -p "apps/${PORTAL_SVC}/pluggable-apps"
      for APP_DIR in apps/*/; do
        APP_ID="$(basename "${APP_DIR}")"
        if [ -f "apps/${APP_ID}/novatlantis.app.json" ]; then
          mkdir -p "apps/${PORTAL_SVC}/pluggable-apps/${APP_ID}"
          cp -f "apps/${APP_ID}/novatlantis.app.json" "apps/${PORTAL_SVC}/pluggable-apps/${APP_ID}/"
          if [ -f "apps/${APP_ID}/plugin.mjs" ]; then
            cp -f "apps/${APP_ID}/plugin.mjs" "apps/${PORTAL_SVC}/pluggable-apps/${APP_ID}/"
          fi
        fi
      done
    fi
  done
fi

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
  CHANGED_FILES="package.json"
fi

echo "[SMART-DIFF] Arquivos modificados detectados:"
echo "${CHANGED_FILES}" | sed 's/^/  - /'

# Se pacotes compartilhados (packages/*), package.json raiz ou cloudbuild/ mudaram,
# reconstrói todos os microsserviços por segurança.
if echo "${CHANGED_FILES}" | grep -qE '^(packages/|package\.json|cloudbuild/)'; then
  echo "[SMART-DIFF] Alteração detectada em pacotes compartilhados (packages/*) ou configuração global."
  echo "[SMART-DIFF] Marcando todos os ${#ALL_SERVICES[@]} microsserviços para build/deploy."
  for SVC in "${ALL_SERVICES[@]}"; do
    echo "${SVC}" >> "${OUTPUT_SERVICES_FILE}"
  done
else
  PLUGGABLE_CHANGED=false
  for SVC in "${ALL_SERVICES[@]}"; do
    if echo "${CHANGED_FILES}" | grep -qE "^apps/${SVC}/"; then
      echo "[SMART-DIFF] Microsserviço modificado: ${SVC}"
      echo "${SVC}" >> "${OUTPUT_SERVICES_FILE}"
      if [ -f "apps/${SVC}/novatlantis.app.json" ]; then
        PLUGGABLE_CHANGED=true
      fi
    fi
  done
  if [ "${PLUGGABLE_CHANGED}" = "true" ]; then
    echo "[SMART-DIFF] Módulo plugável alterado; incluindo portais hospedeiros (landing-portal, citizen-portal, gov-backstage) para sincronizar o catálogo."
    for PORTAL_SVC in landing-portal citizen-portal gov-backstage; do
      if ! grep -qx "${PORTAL_SVC}" "${OUTPUT_SERVICES_FILE}"; then
        echo "${PORTAL_SVC}" >> "${OUTPUT_SERVICES_FILE}"
      fi
    done
  fi
fi

# Verifica se o agente ADK (first-responder-agent/) sofreu alterações
if echo "${CHANGED_FILES}" | grep -qE '^first-responder-agent/'; then
  echo "[SMART-DIFF] Agente ADK (first-responder-agent) modificado."
  echo "true" > "${OUTPUT_AGENT_FILE}"
fi

echo "[SMART-DIFF] Resumo final:"
echo "  - Microsserviços para processar: $(tr '\n' ' ' < "${OUTPUT_SERVICES_FILE}" || echo 'nenhum')"
echo "  - Agente ADK modificado: $(cat "${OUTPUT_AGENT_FILE}")"
