/**
 * @novatlantis/portal-sdk
 * Motor de Auto-Discovery, Service Registry, Seed Resiliente GDF e API Gateway Federado
 * da República Digital de Novatlantis.
 *
 * Permite que qualquer Customer Engineer (CE) crie um novo módulo em `apps/<app-id>/`
 * contendo `novatlantis.app.json` + `plugin.mjs` e acople automaticamente o caso de uso nas 4 frentes:
 *   1. Vitrine da Home Page (`landing-portal`)
 *   2. Concierge IA Nacional (`POST /api/orchestrator/chat`)
 *   3. Aba de Autoatendimento no Portal do Cidadão (`citizen-portal`)
 *   4. Painel Operacional no Government Backstage (`gov-backstage`)
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const runtimeRegisteredApps = new Map();
const loadedPluginsCache = new Map();

/**
 * Garante que todas as tabelas base do GDF (`dim_citizens`, `rel_family_graph`, `edu_enrollments`,
 * `sec_passports`, `health_records`, `justice_records`, `citizen_profiles`, `user_credentials`)
 * existam e estejam populadas mesmo quando o container sobe sem o arquivo `gdf_sovereign.db` pré-gerado.
 */
export function ensureBaseGdfTablesAndSeed(db) {
  if (!db) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS dim_citizens (
      nid TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      civil_status TEXT NOT NULL,
      native_language TEXT NOT NULL,
      citizenship_status TEXT NOT NULL,
      profession TEXT NOT NULL,
      specialty TEXT NOT NULL,
      iam_role TEXT NOT NULL,
      address_id TEXT NOT NULL,
      district TEXT NOT NULL,
      tax_status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rel_family_graph (
      relation_id TEXT PRIMARY KEY,
      source_nid TEXT NOT NULL,
      target_nid TEXT NOT NULL,
      relation_type TEXT NOT NULL,
      has_legal_custody INTEGER DEFAULT 1,
      is_emergency_contact INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS health_records (
      patient_nid TEXT PRIMARY KEY,
      blood_type TEXT NOT NULL,
      allergies TEXT NOT NULL,
      chronic_conditions TEXT NOT NULL,
      assigned_primary_care_physician_nid TEXT NOT NULL,
      vaccination_status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS edu_enrollments (
      enrollment_id TEXT PRIMARY KEY,
      student_nid TEXT NOT NULL,
      school_id TEXT NOT NULL,
      grade_level TEXT NOT NULL,
      teacher_nid TEXT NOT NULL,
      score_mathematics REAL NOT NULL,
      score_sciences REAL NOT NULL,
      score_ai_robotics REAL NOT NULL,
      score_languages REAL NOT NULL,
      attendance_rate REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sec_passports (
      passport_number TEXT PRIMARY KEY,
      nid TEXT NOT NULL UNIQUE,
      issue_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      icao_mrz_line1 TEXT NOT NULL,
      icao_mrz_line2 TEXT NOT NULL,
      passport_status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS justice_records (
      record_id TEXT PRIMARY KEY,
      citizen_nid TEXT NOT NULL,
      clearance_status TEXT NOT NULL,
      active_warrants INTEGER DEFAULT 0,
      electoral_status TEXT NOT NULL,
      last_verified_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS citizen_profiles (
      nid TEXT PRIMARY KEY,
      avatar_url TEXT,
      phone_number TEXT,
      social_name TEXT,
      bio TEXT,
      updated_at TEXT
    );
  `);

  const count = db.prepare('SELECT COUNT(*) AS cnt FROM dim_citizens').get().cnt;
  if (count === 0) {
    const insCitizen = db.prepare(`
      INSERT OR IGNORE INTO dim_citizens VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const coreCitizens = [
      [
        'NID-000-0000-0001-9',
        'Joao Thiago Poço (JT)',
        'jt@novatlantis.gov.cloud',
        '1984-05-14',
        42,
        'M',
        'MARRIED',
        'pt-BR',
        'NATIVE_SOVEREIGN',
        'GOV-EXEC-PM-001',
        'Primeiro-Ministro da República & Arquiteto-Chefe de Estado',
        'PRIME_MINISTER_ROOT',
        'ADDR-NV-0001',
        'Colina da Justiça',
        'REGULAR_EXEMPT_SOVEREIGN'
      ],
      [
        'NID-000-0000-0002-7',
        'Pedro Calixto (Chanceler & Secretário-Geral)',
        'pedrocalixto@novatlantis.gov.cloud',
        '1988-08-20',
        38,
        'M',
        'MARRIED',
        'pt-BR',
        'NATIVE_SOVEREIGN',
        'GOV-SEC-GEN-002',
        'Secretário-Geral de Estado & Governança Cloud',
        'SECRETARY_GENERAL',
        'ADDR-NV-0002',
        'Distrito Tecnológico',
        'REGULAR_ACTIVE'
      ],
      [
        'NID-000-0000-0003-5',
        'Helena Albuquerque',
        'helena.albuquerque@novatlantis.gov.cloud',
        '1990-02-11',
        36,
        'F',
        'SINGLE',
        'pt-BR',
        'NATIVE_SOVEREIGN',
        'IAM-360-GOV-003',
        'Gestora Nacional de Identidades 360',
        'IDENTITY_MANAGER_360',
        'ADDR-NV-0003',
        'Distrito Tecnológico',
        'REGULAR_ACTIVE'
      ],
      [
        'NID-000-0000-0004-3',
        'Dra. Sofia Mendes Costa',
        'dra.sofia.mendes@novatlantis.gov.cloud',
        '1982-11-03',
        43,
        'F',
        'MARRIED',
        'pt-BR',
        'NATIVE_SOVEREIGN',
        'CRM-NV-10442',
        'Diretora Clínica & Pediatria / Imunologia HL7',
        'DOCTOR_AND_HEALTH_MANAGER',
        'ADDR-NV-0004',
        'Distrito Tecnológico',
        'REGULAR_ACTIVE'
      ],
      [
        'NID-000-0000-0006-0',
        'Prof. Lucas Albuquerque Silva',
        'prof.lucas.silva@novatlantis.gov.cloud',
        '1985-07-19',
        41,
        'M',
        'MARRIED',
        'pt-BR',
        'NATIVE_SOVEREIGN',
        'EDU-LIC-9981',
        'Reitor Pedagógico de IA & Robótica Educacional',
        'TEACHER_AND_EDU_MANAGER',
        'ADDR-NV-0006',
        'Colina da Justiça',
        'REGULAR_ACTIVE'
      ],
      [
        'NID-000-0000-0008-6',
        'Comandante Rafael Torres',
        'comandante.rafael@novatlantis.gov.cloud',
        '1980-03-25',
        46,
        'M',
        'MARRIED',
        'pt-BR',
        'NATIVE_SOVEREIGN',
        'OPS-CMD-311911',
        'Comandante Integrado de Operações Urbanas 311 & SOS 911',
        'OPERATIONS_311_911_MANAGER',
        'ADDR-NV-0008',
        'Porto Solar',
        'REGULAR_ACTIVE'
      ],
      [
        'NID-000-0000-0009-4',
        'Juíza Dra. Clara Sterling',
        'juiza.clara.sterling@novatlantis.gov.cloud',
        '1979-09-12',
        47,
        'F',
        'MARRIED',
        'pt-BR',
        'NATIVE_SOVEREIGN',
        'MAG-SUP-0009',
        'Magistrada Titular do Tribunal de Justiça Digital & Juizado IA',
        'JUSTICE_AND_TREASURY_MANAGER',
        'ADDR-NV-0009',
        'Colina da Justiça',
        'REGULAR_ACTIVE'
      ],
      [
        'NID-000-0000-0010-8',
        'Pedro Albuquerque Viana',
        'pedro.viana@cidadao.novatlantis.gov.cloud',
        '2015-04-10',
        11,
        'M',
        'SINGLE',
        'pt-BR',
        'NATIVE_SOVEREIGN',
        'ESTUDANTE-FUND-6',
        'Estudante do 6º Ano — Liceu Politécnico de IA',
        'CITIZEN_COMMON',
        'ADDR-NV-0010',
        'Distrito Tecnológico',
        'DEPENDENT_MINOR'
      ],
      [
        'NID-000-0000-0011-6',
        'Alice Albuquerque Viana',
        'alice.viana@cidadao.novatlantis.gov.cloud',
        '1989-12-01',
        36,
        'F',
        'MARRIED',
        'pt-BR',
        'NATIVE_SOVEREIGN',
        'ENG-OCEANO-412',
        'Engenheira de Energia Marinha & Cidadã Soberana',
        'CITIZEN_COMMON',
        'ADDR-NV-0010',
        'Distrito Tecnológico',
        'REGULAR_ACTIVE'
      ]
    ];
    for (const c of coreCitizens) {
      insCitizen.run(...c);
    }

    db.prepare('INSERT OR IGNORE INTO rel_family_graph VALUES (?, ?, ?, ?, 1, 1)').run(
      'REL-FAM-001',
      'NID-000-0000-0011-6',
      'NID-000-0000-0010-8',
      'BIOLOGICAL_PARENT'
    );

    db.prepare('INSERT OR IGNORE INTO health_records VALUES (?, ?, ?, ?, ?, ?)').run(
      'NID-000-0000-0001-9',
      'O+',
      'NONE',
      'NONE',
      'NID-000-0000-0004-3',
      'UP_TO_DATE_2026'
    );
    db.prepare('INSERT OR IGNORE INTO health_records VALUES (?, ?, ?, ?, ?, ?)').run(
      'NID-000-0000-0010-8',
      'A+',
      'Penicilina',
      'NONE',
      'NID-000-0000-0004-3',
      'UP_TO_DATE_2026'
    );

    db.prepare('INSERT OR IGNORE INTO edu_enrollments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'ENR-2026-0010',
      'NID-000-0000-0010-8',
      'SCH-NV-002',
      '6º Ano Fundamental',
      'NID-000-0000-0006-0',
      9.6,
      9.4,
      9.9,
      9.2,
      98.5
    );

    db.prepare('INSERT OR IGNORE INTO sec_passports VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      'NV-PASS-2026-0001',
      'NID-000-0000-0001-9',
      '2026-01-01',
      '2036-01-01',
      'P<NOVPOCO<<JOAO<THIAGO<<<<<<<<<<<<<<<<<<<<<<',
      'NV00019<<8NOV8405144M3601018<<<<<<<<<<<<<<04',
      'VALID'
    );

    db.prepare('INSERT OR IGNORE INTO justice_records VALUES (?, ?, ?, ?, ?, ?)').run(
      'JUS-REC-0001',
      'NID-000-0000-0001-9',
      'CLEAN_RECORD_VERIFIED',
      0,
      'ACTIVE_SOVEREIGN_VOTER',
      '2026-10-01T00:00:00Z'
    );
  }
}

// Resolve automaticamente os diretórios onde podem existir módulos novatlantis.app.json:
// 1. appsRootDir passado explicitamente (ex.: ../../apps no monorepo)
// 2. ./pluggable-apps dentro do próprio container Docker em produção/dev no Cloud Run
function resolveCandidateAppsDirs(appsRootDir) {
  const dirs = [];
  if (typeof appsRootDir === 'string' && fs.existsSync(appsRootDir)) {
    dirs.push(appsRootDir);
  }
  const localBundled = path.resolve(process.cwd(), 'pluggable-apps');
  if (fs.existsSync(localBundled) && !dirs.includes(localBundled)) {
    dirs.push(localBundled);
  }
  return dirs;
}

// Descobre automaticamente todos os diretórios de apps que possuem novatlantis.app.json e carrega plugin.mjs
export async function discoverNovatlantisApps(appsRootDir) {
  const discoveredMap = new Map();
  const candidateDirs = resolveCandidateAppsDirs(appsRootDir);

  for (const baseDir of candidateDirs) {
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const appDir = path.join(baseDir, entry.name);
      const manifestPath = path.join(appDir, 'novatlantis.app.json');
      if (!fs.existsSync(manifestPath)) continue;

      try {
        const raw = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(raw);
        if (discoveredMap.has(manifest.appId)) continue;

        const pluginPath = path.join(appDir, 'plugin.mjs');
        let pluginModule = loadedPluginsCache.get(manifest.appId) || null;

        if (!pluginModule && fs.existsSync(pluginPath)) {
          pluginModule = await import(pathToFileURL(pluginPath).href);
          loadedPluginsCache.set(manifest.appId, pluginModule);
        }

        const serviceUrl =
          (manifest.serviceUrlEnvVar && process.env[manifest.serviceUrlEnvVar]) ||
          manifest.serviceUrl ||
          null;

        const normalizedSurfaces = {
          landingCatalog: manifest.landingCatalog,
          citizenPortalTab: manifest.citizenPortalTab,
          backstageQueue: manifest.backstageModule
            ? {
                ...manifest.backstageModule,
                tabId: manifest.backstageModule.moduleId || manifest.backstageModule.tabId,
                title: {
                  pt: manifest.backstageModule.title?.['pt-BR'] || manifest.backstageModule.title?.pt,
                  es: manifest.backstageModule.title?.['es-419'] || manifest.backstageModule.title?.es,
                  en: manifest.backstageModule.title?.['en-US'] || manifest.backstageModule.title?.en,
                  ...manifest.backstageModule.title
                },
                subtitle: {
                  pt: manifest.backstageModule.subtitle?.['pt-BR'] || manifest.backstageModule.subtitle?.pt,
                  es: manifest.backstageModule.subtitle?.['es-419'] || manifest.backstageModule.subtitle?.es,
                  en: manifest.backstageModule.subtitle?.['en-US'] || manifest.backstageModule.subtitle?.en,
                  ...manifest.backstageModule.subtitle
                }
              }
            : undefined
        };

        discoveredMap.set(manifest.appId, {
          ...manifest,
          surfaces: normalizedSurfaces,
          source: 'FILESYSTEM_MONOREPO',
          appDir,
          hasLocalPlugin: Boolean(pluginModule),
          serviceUrl,
          plugin: pluginModule
        });
      } catch (err) {
        console.warn(`[Novatlantis Portal SDK] Falha ao carregar manifesto em ${manifestPath}:`, err.message);
      }
    }
  }

  for (const [appId, dynamicApp] of runtimeRegisteredApps.entries()) {
    const existing = discoveredMap.get(appId);
    if (existing) {
      discoveredMap.set(appId, { ...existing, ...dynamicApp, source: 'RUNTIME_OVERRIDE' });
    } else {
      discoveredMap.set(appId, { ...dynamicApp, source: 'RUNTIME_DYNAMIC_API' });
    }
  }

  return Array.from(discoveredMap.values());
}

// Inicializa tabelas SQLite/AlloyDB declaradas pelos plugins dos apps acoplados.
// Suporta tanto initializePluggableAppsDatabase(appsRootDir, db) quanto initializePluggableAppsDatabase(db, appsRootDir).
export async function initializePluggableAppsDatabase(arg1, arg2) {
  const isArg1String = typeof arg1 === 'string';
  const appsRootDir = isArg1String ? arg1 : arg2;
  const db = isArg1String ? arg2 : arg1;

  ensureBaseGdfTablesAndSeed(db);
  const apps = await discoverNovatlantisApps(appsRootDir);
  for (const app of apps) {
    if (app.plugin && typeof app.plugin.initDatabase === 'function') {
      try {
        await app.plugin.initDatabase(db);
      } catch (err) {
        console.warn(`[Novatlantis Portal SDK] Erro em initDatabase do app ${app.appId}:`, err.message);
      }
    }
  }
  return apps;
}

// Roteador de APIs do Service Registry e Gateway de Apps (/api/v1/registry/apps e /api/v1/apps/:appId/*).
export async function handleRegistryAndAppGatewayRoutes(arg1, ...restArgs) {
  const opts =
    arg1 && typeof arg1 === 'object' && 'pathname' in arg1 && 'req' in arg1
      ? arg1
      : {
          req: arg1,
          res: restArgs[0],
          db: restArgs[1],
          pathname: restArgs[2],
          url: restArgs[3],
          readBody: restArgs[4],
          sendJson: restArgs[5],
          appsRootDir: restArgs[6],
          getFullCitizenProfile: restArgs[7]
        };

  const { req, res, db, pathname, url, readBody, sendJson, appsRootDir, getFullCitizenProfile } = opts;

  if (pathname === '/api/v1/registry/apps' && req.method === 'GET') {
    const apps = await discoverNovatlantisApps(appsRootDir);
    const sanitized = apps.map(({ plugin, appDir, ...rest }) => ({
      ...rest,
      endpoints: {
        manifest: `/api/v1/apps/${rest.appId}/manifest`,
        citizenView: `/api/v1/apps/${rest.appId}/view?mode=citizen`,
        backstageView: `/api/v1/apps/${rest.appId}/view?mode=backstage`,
        action: `/api/v1/apps/${rest.appId}/action`,
        agentExecute: `/api/v1/apps/${rest.appId}/agent`
      }
    }));
    sendJson(res, 200, {
      status: 'ok',
      architecture: 'Novatlantis Pluggable App Registry & Federated Gateway v1',
      total_apps: sanitized.length,
      apps: sanitized
    });
    return true;
  }

  if (pathname === '/api/v1/registry/apps' && req.method === 'POST') {
    const body = await readBody(req);
    if (!body || !body.appId || !body.landingCatalog || !body.agentIntegration) {
      sendJson(res, 400, {
        error: 'Manifesto inválido. Campos obrigatórios: appId, landingCatalog, agentIntegration.'
      });
      return true;
    }
    runtimeRegisteredApps.set(body.appId, {
      ...body,
      registeredAt: new Date().toISOString()
    });
    sendJson(res, 201, {
      status: 'REGISTERED',
      appId: body.appId,
      message: `Módulo '${body.appId}' acoplado dinamicamente ao Portal Novatlantis.`
    });
    return true;
  }

  const match = pathname.match(/^\/api\/v1\/apps\/([a-z0-9-]+)\/(manifest|view|action|agent)$/);
  if (!match) return false;

  const [, appId, subroute] = match;
  const apps = await discoverNovatlantisApps(appsRootDir);
  const targetApp = apps.find((a) => a.appId === appId);

  if (!targetApp) {
    sendJson(res, 404, {
      error: `Módulo '${appId}' não encontrado no Service Registry do Portal Novatlantis.`
    });
    return true;
  }

  if (subroute === 'manifest' && req.method === 'GET') {
    const { plugin, appDir, ...manifest } = targetApp;
    sendJson(res, 200, manifest);
    return true;
  }

  if (subroute === 'view' && req.method === 'GET') {
    const mode = url.searchParams.get('mode') || 'citizen';
    const lang = url.searchParams.get('lang') || 'pt-BR';
    const nid = url.searchParams.get('nid') || req.headers['x-novatlantis-citizen-nid'] || '';
    const citizen =
      nid && getFullCitizenProfile
        ? getFullCitizenProfile(nid)
        : nid && db
        ? db.prepare('SELECT * FROM dim_citizens WHERE nid = ? LIMIT 1').get(nid)
        : null;

    if (targetApp.plugin && typeof targetApp.plugin.getViewData === 'function') {
      await targetApp.plugin.initDatabase?.(db);
      const rawView = await targetApp.plugin.getViewData({
        mode,
        lang,
        citizen,
        db,
        query: Object.fromEntries(url.searchParams.entries())
      });
      const enrichedView = {
        ...rawView,
        headline: rawView.headline || { 'pt-BR': rawView.title, 'es-419': rawView.title, 'en-US': rawView.title, pt: rawView.title },
        summary: rawView.summary || { 'pt-BR': rawView.subtitle, 'es-419': rawView.subtitle, 'en-US': rawView.subtitle, pt: rawView.subtitle },
        kpis: (rawView.kpis || []).map((k) => ({
          ...k,
          label: typeof k.label === 'string' ? { 'pt-BR': k.label, 'es-419': k.label, 'en-US': k.label, pt: k.label } : k.label
        })),
        actions: (rawView.actions || []).map((a) => ({
          ...a,
          action_id: a.action_id || a.actionId,
          label: typeof a.label === 'string' ? { 'pt-BR': a.label, 'es-419': a.label, 'en-US': a.label, pt: a.label } : a.label
        })),
        records: (rawView.records || []).map((r) => ({
          ...r,
          case_number: r.case_number || r.id,
          subject: r.subject || r.primary,
          court_branch: r.court_branch || r.secondary,
          ai_conciliation_summary: r.ai_conciliation_summary || r.detail
        }))
      };
      sendJson(res, 200, {
        appId: targetApp.appId,
        mode,
        lang,
        manifest: {
          title: targetApp.landingCatalog?.title,
          agency: targetApp.landingCatalog?.agency,
          badge: targetApp.landingCatalog?.badge,
          owner: targetApp.owner,
          sector: targetApp.sector
        },
        view: enrichedView,
        ...enrichedView
      });
      return true;
    }

    sendJson(res, 200, {
      appId: targetApp.appId,
      mode,
      view: { kpis: [], records: [], actions: [] },
      kpis: [],
      records: [],
      actions: []
    });
    return true;
  }

  if (subroute === 'action' && req.method === 'POST') {
    const body = await readBody(req);
    const nid = body.nid || req.headers['x-novatlantis-citizen-nid'] || '';
    const lang = body.lang || 'pt-BR';
    const citizen =
      nid && getFullCitizenProfile
        ? getFullCitizenProfile(nid)
        : nid && db
        ? db.prepare('SELECT * FROM dim_citizens WHERE nid = ? LIMIT 1').get(nid)
        : null;

    if (targetApp.plugin && typeof targetApp.plugin.executeAction === 'function') {
      await targetApp.plugin.initDatabase?.(db);
      const rawResult = await targetApp.plugin.executeAction({
        actionId: body.actionId,
        payload: body.payload || {},
        citizen,
        lang,
        db
      });
      const enrichedResult = {
        ...rawResult,
        message_pt: rawResult.message_pt || rawResult.message
      };
      sendJson(res, 200, {
        appId: targetApp.appId,
        status: 'EXECUTED',
        result: enrichedResult,
        ...enrichedResult
      });
      return true;
    }

    sendJson(res, 400, { error: `Módulo '${appId}' não implementa executeAction.` });
    return true;
  }

  if (subroute === 'agent' && req.method === 'POST') {
    const body = await readBody(req);
    const nid = body.nid || '';
    const lang = body.lang || 'pt-BR';
    const citizen =
      nid && getFullCitizenProfile
        ? getFullCitizenProfile(nid)
        : nid && db
        ? db.prepare('SELECT * FROM dim_citizens WHERE nid = ? LIMIT 1').get(nid)
        : null;

    if (targetApp.plugin && typeof targetApp.plugin.handleAgentTurn === 'function') {
      await targetApp.plugin.initDatabase?.(db);
      const agentResponse = await targetApp.plugin.handleAgentTurn({
        profile: citizen,
        message: body.message || '',
        lang,
        db
      });
      sendJson(res, 200, agentResponse);
      return true;
    }

    sendJson(res, 400, { error: `Módulo '${appId}' não implementa handleAgentTurn.` });
    return true;
  }

  return false;
}

// Verifica se a mensagem enviada ao Concierge IA Nacional corresponde a algum módulo plugável
// registrado em novatlantis.app.json e executa a delegação A2A para o plugin do módulo.
export async function matchAndExecutePluggableAgent(arg1, arg2, arg3, arg4) {
  const opts =
    arg1 && typeof arg1 === 'object'
      ? arg1
      : {
          message: arg1,
          profile: arg2 && typeof arg2 === 'string' ? { citizen_id: arg2, nid: arg2, full_name: 'Joao Thiago Poço (JT)' } : arg2,
          db: arg3,
          appsRootDir: arg4,
          lang: 'pt-BR'
        };

  const { appsRootDir, profile, message, lang, db, citizenPortalUrl, govBackstageUrl } = opts;
  const lower = String(message || '').toLowerCase();
  if (!lower) return null;

  const apps = await discoverNovatlantisApps(appsRootDir);
  for (const app of apps) {
    const keywords = app.agentIntegration?.triggerKeywords || [];
    const matched = keywords.some((kw) => lower.includes(String(kw).toLowerCase()));
    if (!matched) continue;

    if (app.plugin && typeof app.plugin.handleAgentTurn === 'function') {
      await app.plugin.initDatabase?.(db);
      return await app.plugin.handleAgentTurn({
        profile,
        message,
        lang,
        db,
        citizenPortalUrl,
        govBackstageUrl,
        manifest: app
      });
    }
  }

  return null;
}
