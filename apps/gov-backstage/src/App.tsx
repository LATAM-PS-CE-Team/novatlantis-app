import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Chip,
  Stack,
  Alert,
  Paper,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Shield as ShieldIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import {
  AlertTriangle,
  Siren,
  Wrench,
  ExternalLink,
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import { novatlantisTheme } from './theme';
import { TopNavUserWidget, SupportedLanguage, resolveInitialLanguage, DYNAMIC_PORTAL_URLS } from './components/TopNavUserWidget';

type Language = SupportedLanguage;
type BackstageTab =
  | 'pm_cabinet'
  | 'iam360'
  | 'health_mgmt'
  | 'edu_mgmt'
  | 'ops_311'
  | 'ops_911'
  | 'justice_datalake'
  | string;

const LANDING_PORTAL_URL = DYNAMIC_PORTAL_URLS.landingPortalUrl;
const CITIZEN_PORTAL_URL = DYNAMIC_PORTAL_URLS.citizenPortalUrl;

const BACKSTAGE_MENU_ITEMS: { id: BackstageTab; title: Record<Language, string>; subtitle: Record<Language, string> }[] = [
  {
    id: 'pm_cabinet',
    title: {
      'pt-BR': 'Gabinete Executivo',
      'es-419': 'Gabinete Ejecutivo',
      'en-US': 'Executive Cabinet'
    },
    subtitle: {
      'pt-BR': 'Indicadores gerais e gestão de Estado',
      'es-419': 'Indicadores generales y gestión de Estado',
      'en-US': 'Key indicators and executive management'
    }
  },
  {
    id: 'iam360',
    title: {
      'pt-BR': 'Identidade e Acessos (IAM)',
      'es-419': 'Identidad y Accesos (IAM)',
      'en-US': 'Identity & Access (IAM)'
    },
    subtitle: {
      'pt-BR': 'Concessão e revogação de perfis administrativos',
      'es-419': 'Concesión y revocación de perfiles administrativos',
      'en-US': 'Grant and revoke administrative roles'
    }
  },
  {
    id: 'health_mgmt',
    title: {
      'pt-BR': 'Gestão da Saúde',
      'es-419': 'Gestión de Salud',
      'en-US': 'Healthcare Management'
    },
    subtitle: {
      'pt-BR': 'Rede hospitalar e fila de telemedicina',
      'es-419': 'Red hospitalaria y cola de telemedicina',
      'en-US': 'Hospital network and telehealth queue'
    }
  },
  {
    id: 'edu_mgmt',
    title: {
      'pt-BR': 'Gestão da Educação',
      'es-419': 'Gestión de Educación',
      'en-US': 'Education Management'
    },
    subtitle: {
      'pt-BR': 'Diário de classe, avaliações e frequência',
      'es-419': 'Registro de calificaciones, evaluaciones y asistencia',
      'en-US': 'Grade entry, assessments, and attendance'
    }
  },
  {
    id: 'ops_311',
    title: {
      'pt-BR': 'Zeladoria Urbana 311',
      'es-419': 'Mantenimiento Urbano 311',
      'en-US': '311 Urban Maintenance'
    },
    subtitle: {
      'pt-BR': 'Atendimento e conclusão de chamados urbanos',
      'es-419': 'Atención y resolución de reportes urbanos',
      'en-US': 'Handling and resolution of urban service requests'
    }
  },
  {
    id: 'ops_911',
    title: {
      'pt-BR': 'Central de Emergência 911',
      'es-419': 'Central de Emergencia 911',
      'en-US': '911 Emergency Dispatch'
    },
    subtitle: {
      'pt-BR': 'Despacho de atendimento médico e defesa civil',
      'es-419': 'Despacho de atención médica y defensa civil',
      'en-US': 'Emergency medical and civil defense dispatch'
    }
  },
  {
    id: 'justice_datalake',
    title: {
      'pt-BR': 'Cadastro Nacional e Tesouro',
      'es-419': 'Registro Nacional y Tesoro',
      'en-US': 'National Registry & Treasury'
    },
    subtitle: {
      'pt-BR': 'Consulta à base de cidadãos e situação fiscal',
      'es-419': 'Consulta de ciudadanos y situación fiscal',
      'en-US': 'Citizen directory and tax status lookup'
    }
  }
];

const BACKSTAGE_I18N: Record<
  Language,
  {
    officialBanner: string;
    homeLink: string;
    citizenPortalLink: string;
    govTitle: string;
    portalBadge: string;
    activeEnvLabel: string;
    defaultSubline: string;
    drawerTitle: string;
    drawerAuthRequired: string;
    drawerEnvsHeader: string;
    drawerBackHome: string;
    drawerBackHomeSub: string;
    authWallTitle: string;
    authWallDesc: string;
    loginPublicServantBtn: string;
    backHomeBtn: string;
    switchEnvBtn: string;
    authenticatedServantChip: string;
  }
> = {
  'pt-BR': {
    officialBanner: 'Site oficial do Governo de Novatlantis • Backstage Governamental',
    homeLink: 'Início',
    citizenPortalLink: 'Portal do Cidadão',
    govTitle: 'Governo de Novatlantis',
    portalBadge: 'Backstage',
    activeEnvLabel: 'Módulo',
    defaultSubline: 'Painel administrativo e operacional para servidores públicos',
    drawerTitle: 'Menu do Backstage',
    drawerAuthRequired: 'Autenticação necessária',
    drawerEnvsHeader: 'MÓDULOS ADMINISTRATIVOS',
    drawerBackHome: 'Voltar ao Início',
    drawerBackHomeSub: 'Portal de Serviços',
    authWallTitle: 'Acesso Administrativo',
    authWallDesc:
      'Para acessar o Backstage Governamental, entre com um NID que possua perfil de servidor público ativo (Gabinete Executivo, Gestão de Acessos, Saúde, Educação, Zeladoria 311, Emergência 911 ou Magistratura).',
    loginPublicServantBtn: 'Entrar com NID',
    backHomeBtn: 'Voltar ao Início',
    switchEnvBtn: 'Menu',
    authenticatedServantChip: 'Servidor'
  },
  'es-419': {
    officialBanner: 'Sitio oficial del Gobierno de Novatlantis • Backstage Gubernamental',
    homeLink: 'Inicio',
    citizenPortalLink: 'Portal del Ciudadano',
    govTitle: 'Gobierno de Novatlantis',
    portalBadge: 'Backstage',
    activeEnvLabel: 'Módulo',
    defaultSubline: 'Panel administrativo y operativo para servidores públicos',
    drawerTitle: 'Menú del Backstage',
    drawerAuthRequired: 'Autenticación requerida',
    drawerEnvsHeader: 'MÓDULOS ADMINISTRATIVOS',
    drawerBackHome: 'Volver al Inicio',
    drawerBackHomeSub: 'Portal de Servicios',
    authWallTitle: 'Acceso Administrativo',
    authWallDesc:
      'Para acceder al Backstage Gubernamental, inicie sesión con un NID que posea un perfil de servidor público activo (Gabinete Ejecutivo, Gestión de Accesos, Salud, Educación, Mantenimiento 311, Emergencia 911 o Magistratura).',
    loginPublicServantBtn: 'Ingresar con NID',
    backHomeBtn: 'Volver al Inicio',
    switchEnvBtn: 'Menú',
    authenticatedServantChip: 'Servidor'
  },
  'en-US': {
    officialBanner: 'Official website of the Government of Novatlantis • Government Backstage',
    homeLink: 'Home',
    citizenPortalLink: 'Citizen Portal',
    govTitle: 'Government of Novatlantis',
    portalBadge: 'Backstage',
    activeEnvLabel: 'Module',
    defaultSubline: 'Administrative and operational workspace for civil servants',
    drawerTitle: 'Backstage Menu',
    drawerAuthRequired: 'Sign-in required',
    drawerEnvsHeader: 'ADMINISTRATIVE MODULES',
    drawerBackHome: 'Back to Home',
    drawerBackHomeSub: 'Service Portal',
    authWallTitle: 'Administrative Sign-In',
    authWallDesc:
      'To access the Government Backstage, sign in with an NID holding an active civil servant role (Executive Cabinet, Access Management, Health, Education, 311 Maintenance, 911 Dispatch, or Judiciary).',
    loginPublicServantBtn: 'Sign in with NID',
    backHomeBtn: 'Back to Home',
    switchEnvBtn: 'Menu',
    authenticatedServantChip: 'Staff'
  }
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => resolveInitialLanguage());
  const t = BACKSTAGE_I18N[lang] || BACKSTAGE_I18N['pt-BR'];

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('novatlantis_lang', newLang);
    localStorage.setItem('novatlantis_lang_explicit', '1');
  };
  const [backstageTab, setBackstageTab] = useState<BackstageTab>('pm_cabinet');
  const [hamburgerOpen, setHamburgerOpen] = useState(true);
  const [loginTriggerCount, setLoginTriggerCount] = useState(0);
  const [ssoToken, setSsoToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [backstageOverview, setBackstageOverview] = useState<any>(null);
  const [iamState, setIamState] = useState<any>(null);
  const [healthBackstage, setHealthBackstage] = useState<any>(null);
  const [eduBackstage, setEduBackstage] = useState<any>(null);
  const [opsBackstage, setOpsBackstage] = useState<any>(null);
  const [datalakeExplorerResults, setDatalakeExplorerResults] = useState<any[]>([]);
  const [datalakeFilter, setDatalakeFilter] = useState('NID-000');
  const [pluggableQueues, setPluggableQueues] = useState<{ id: string; appId: string; title: Record<Language, string>; subtitle: Record<Language, string> }[]>([]);
  const [pluggableQueueView, setPluggableQueueView] = useState<any>(null);

  const [iamTargetNid, setIamTargetNid] = useState('NID-000-0000-0005-1');
  const [iamSelectedRole, setIamSelectedRole] = useState('DOCTOR_TELEMED');
  const [examSchool] = useState('Liceu Politécnico');
  const [examSubject] = useState('IA & Robótica');
  const [examTitle, setExamTitle] = useState('');
  const [gradeStudentNid, setGradeStudentNid] = useState('NID-000-0000-0010-8');
  const [gradeMath, setGradeMath] = useState(95);
  const [gradeSci, setGradeSci] = useState(92);
  const [gradeAi, setGradeAi] = useState(99);
  const [gradeLang, setGradeLang] = useState(91);

  const loadUserSession = async (identifier: string) => {
    if (!identifier) return;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      if (!res.ok) return;
      const data = await res.json();
      setCurrentUser(data.citizen);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAllBackstageData = async () => {
    try {
      const [ovRes, iamRes, hRes, eRes, oRes, dlRes] = await Promise.all([
        fetch('/api/backstage/overview'),
        fetch('/api/iam360/roles'),
        fetch('/api/backstage/health'),
        fetch('/api/backstage/education'),
        fetch('/api/backstage/operations'),
        fetch(`/api/gdf/search?q=${encodeURIComponent(datalakeFilter)}&limit=25`)
      ]);
      setBackstageOverview(await ovRes.json());
      setIamState(await iamRes.json());
      setHealthBackstage(await hRes.json());
      setEduBackstage(await eRes.json());
      setOpsBackstage(await oRes.json());
      const dlData = await dlRes.json();
      setDatalakeExplorerResults(dlData.results || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAllBackstageData();
    fetch('/api/v1/registry/apps')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.apps)) {
          const dynamicQueues = data.apps
            .filter((app: any) => app.surfaces?.backstageQueue?.enabled)
            .map((app: any) => ({
              id: app.surfaces.backstageQueue.tabId || app.appId,
              appId: app.appId,
              title: {
                'pt-BR': app.surfaces.backstageQueue.title?.pt || app.title?.pt || app.appId,
                'es-419': app.surfaces.backstageQueue.title?.es || app.title?.es || app.appId,
                'en-US': app.surfaces.backstageQueue.title?.en || app.title?.en || app.appId
              },
              subtitle: {
                'pt-BR': app.surfaces.backstageQueue.subtitle?.pt || app.summary?.pt || '',
                'es-419': app.surfaces.backstageQueue.subtitle?.es || app.summary?.es || '',
                'en-US': app.surfaces.backstageQueue.subtitle?.en || app.summary?.en || ''
              }
            }));
          setPluggableQueues(dynamicQueues);
        }
      })
      .catch(() => {});
  }, []);

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const res = await fetch('/api/iam360/grant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actor_nid: currentUser.nid,
        target_nid: iamTargetNid,
        new_role: iamSelectedRole
      })
    });
    const data = await res.json();
    if (data.updated) {
      setStatusMessage(
        `Permissão [${iamSelectedRole}] concedida a ${data.target_citizen.full_name} (${data.target_citizen.nid}).`
      );
      if (currentUser.nid === iamTargetNid) {
        loadUserSession(currentUser.nid);
      }
      loadAllBackstageData();
    } else if (data.error) {
      setStatusMessage(`Erro: ${data.error}`);
    }
  };

  const handleRevokeRole = async (targetNid: string) => {
    if (!currentUser) return;
    const res = await fetch('/api/iam360/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actor_nid: currentUser.nid,
        target_nid: targetNid
      })
    });
    const data = await res.json();
    if (data.revoked) {
      setStatusMessage(
        `Permissão administrativa de ${data.target_citizen.full_name} (${targetNid}) revogada.`
      );
      if (currentUser.nid === targetNid) {
        loadUserSession(currentUser.nid);
      }
      loadAllBackstageData();
    } else if (data.error) {
      setStatusMessage(`Erro: ${data.error}`);
    }
  };

  const handleResolve311 = async (ticketId: string) => {
    if (!currentUser) return;
    const res = await fetch('/api/services/311/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticket_id: ticketId,
        actor_nid: currentUser.nid
      })
    });
    const data = await res.json();
    if (data.resolved) {
      setStatusMessage(`Chamado 311 #${ticketId} concluído por ${currentUser.full_name}.`);
      loadAllBackstageData();
    }
  };

  const handleUpdateStudentGrades = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const res = await fetch('/api/backstage/education/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacher_nid: currentUser.nid,
        student_nid: gradeStudentNid,
        score_mathematics: gradeMath,
        score_sciences: gradeSci,
        score_ai_robotics: gradeAi,
        score_languages: gradeLang,
        attendance_rate: 98.5
      })
    });
    const data = await res.json();
    if (data.updated) {
      setStatusMessage(`Notas escolares do aluno ${gradeStudentNid} atualizadas.`);
      loadAllBackstageData();
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const res = await fetch('/api/backstage/education/exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacher_nid: currentUser.nid,
        school_name: examSchool,
        subject: examSubject,
        title: examTitle || `Avaliação de ${examSubject}`,
        grade_level: '6º Ano Fundamental'
      })
    });
    const data = await res.json();
    if (data.created) {
      setExamTitle('');
      setStatusMessage(`Avaliação #${data.exam.exam_id} publicada.`);
      loadAllBackstageData();
    }
  };

  const handleSearchDatalake = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/gdf/search?q=${encodeURIComponent(datalakeFilter)}&limit=30`);
    const data = await res.json();
    setDatalakeExplorerResults(data.results || []);
  };

  const allBackstageMenuItems = [...BACKSTAGE_MENU_ITEMS, ...pluggableQueues];
  const activePluggableQueue = pluggableQueues.find((q) => q.id === backstageTab);

  useEffect(() => {
    if (activePluggableQueue) {
      const nid = currentUser?.nid || 'NID-000-0000-0001-9';
      fetch(`/api/v1/apps/${encodeURIComponent(activePluggableQueue.appId)}/view?nid=${encodeURIComponent(nid)}&mode=backstage`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.view) setPluggableQueueView(data.view);
        })
        .catch(() => {});
    }
  }, [backstageTab, activePluggableQueue?.appId, currentUser?.nid]);

  const handlePluggableBackstageAction = async (appId: string, actionId: string) => {
    const nid = currentUser?.nid || 'NID-000-0000-0001-9';
    const res = await fetch(`/api/v1/apps/${encodeURIComponent(appId)}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, nid, payload: {} })
    });
    const data = await res.json();
    if (data?.result?.message_pt) {
      setStatusMessage(data.result.message_pt);
      const viewRes = await fetch(`/api/v1/apps/${encodeURIComponent(appId)}/view?nid=${encodeURIComponent(nid)}&mode=backstage`);
      const viewJson = await viewRes.json();
      if (viewJson?.view) setPluggableQueueView(viewJson.view);
    }
  };

  const activeMenuObj = allBackstageMenuItems.find((m) => m.id === backstageTab) || allBackstageMenuItems[0];

  return (
    <ThemeProvider theme={novatlantisTheme}>
      <CssBaseline />
      <div className="min-h-screen bg-[#f8f9fa] text-[#202124] flex flex-col">
        {/* Barra de identidade cromática Google Material 3 */}
        <Box
          sx={{
            height: 4,
            width: '100%',
            background:
              'linear-gradient(90deg, #4285F4 0%, #4285F4 25%, #EA4335 25%, #EA4335 50%, #FBBC05 50%, #FBBC05 75%, #34A853 75%, #34A853 100%)'
          }}
        />

        {/* Faixa superior institucional */}
        <Box sx={{ bgcolor: '#f1f3f4', borderBottom: '1px solid #dadce0', py: 0.65, px: 2 }}>
          <Container maxWidth="xl" sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <img src="/assets/flag.jpg" alt="Bandeira" className="h-3.5 w-5 object-cover border border-[#dadce0] rounded-sm" />
              <Typography variant="caption" sx={{ color: '#5f6368', fontWeight: 500, fontSize: '0.76rem' }}>
                {t.officialBanner}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2.5} alignItems="center">
              <a
                href={ssoToken ? `${LANDING_PORTAL_URL}?sso_token=${encodeURIComponent(ssoToken)}&lang=${encodeURIComponent(lang)}` : `${LANDING_PORTAL_URL}?lang=${encodeURIComponent(lang)}`}
                className="text-[#1a73e8] hover:underline flex items-center gap-1 text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t.homeLink}
              </a>
              <a
                href={ssoToken ? `${CITIZEN_PORTAL_URL}?sso_token=${encodeURIComponent(ssoToken)}&lang=${encodeURIComponent(lang)}` : `${CITIZEN_PORTAL_URL}?lang=${encodeURIComponent(lang)}`}
                className="text-[#1a73e8] hover:underline flex items-center gap-1 text-xs font-semibold"
              >
                <UserCheck className="w-3.5 h-3.5" /> {t.citizenPortalLink}
              </a>
            </Stack>
          </Container>
        </Box>

        {/* Cabeçalho principal */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            color: '#202124',
            borderBottom: '1px solid #dadce0',
            zIndex: 30
          }}
        >
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ py: 1.25, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton
                  onClick={() => setHamburgerOpen((prev) => !prev)}
                  sx={{
                    border: '1px solid #dadce0',
                    borderRadius: 2,
                    p: 1,
                    color: hamburgerOpen ? '#1a73e8' : '#5f6368',
                    bgcolor: hamburgerOpen ? '#e8f0fe' : '#ffffff',
                    '&:hover': {
                      bgcolor: '#f1f3f4',
                      borderColor: '#1a73e8'
                    }
                  }}
                  aria-label="Alternar menu lateral"
                >
                  <MenuIcon />
                </IconButton>

                <Box
                  component="img"
                  src="/assets/coat_of_arms.jpg"
                  alt="Brasão"
                  sx={{
                    height: { xs: 40, md: 48 },
                    width: { xs: 40, md: 48 },
                    objectFit: 'cover',
                    borderRadius: 2,
                    border: '1px solid #dadce0'
                  }}
                />
                <Box>
                  <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
                    <Typography
                      sx={{
                        fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.5rem' },
                        fontWeight: 700,
                        color: '#202124',
                        letterSpacing: '-0.015em',
                        lineHeight: 1.2
                      }}
                    >
                      {t.govTitle}
                    </Typography>
                    <Chip
                      label={t.portalBadge}
                      size="small"
                      sx={{
                        bgcolor: '#e8f0fe',
                        color: '#174ea6',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 24
                      }}
                    />
                  </Stack>
                  <Typography
                    sx={{
                      mt: 0.25,
                      fontSize: { xs: '0.78rem', sm: '0.88rem' },
                      fontWeight: 500,
                      color: '#5f6368'
                    }}
                  >
                    {currentUser?.backstage_allowed
                      ? `${t.activeEnvLabel}: ${activeMenuObj.title[lang]}`
                      : t.defaultSubline}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TopNavUserWidget
                  currentNid={currentUser?.nid}
                  openLoginTrigger={loginTriggerCount}
                  citizenPortalUrl={CITIZEN_PORTAL_URL}
                  govBackstageUrl={window.location.origin}
                  lang={lang}
                  onLanguageChange={handleLanguageChange}
                  onUserAuthenticated={(nid, user, token) => {
                    if (token) setSsoToken(token);
                    if (user?.native_language && ['pt-BR', 'es-419', 'en-US'].includes(user.native_language)) {
                      if (!localStorage.getItem('novatlantis_lang_explicit')) {
                        setLang(user.native_language as Language);
                      }
                    }
                    loadUserSession(nid);
                  }}
                  onUserLoggedOut={() => {
                    setCurrentUser(null);
                    setSsoToken(null);
                  }}
                />
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {/* Layout com Navigation Drawer Persistente Material Design 3 */}
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, alignItems: 'stretch' }}>
          <Box
            component="aside"
            sx={{
              width: hamburgerOpen ? { xs: 280, md: 320 } : 0,
              flexShrink: 0,
              overflow: 'hidden',
              transition: 'width 225ms cubic-bezier(0.4, 0, 0.2, 1)',
              bgcolor: '#ffffff',
              borderRight: hamburgerOpen ? '1px solid #dadce0' : 'none',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ width: { xs: 280, md: 320 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#f8f9fa',
                  borderBottom: '1px solid #dadce0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#202124' }}>
                    {t.drawerTitle}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5f6368', fontFamily: 'monospace' }}>
                    {currentUser ? `${currentUser.full_name} (${currentUser.effective_role_code})` : t.drawerAuthRequired}
                  </Typography>
                </Box>
                <IconButton onClick={() => setHamburgerOpen(false)} sx={{ color: '#5f6368' }} size="small">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <List sx={{ py: 1.5, px: 1.25 }}>
                <Box sx={{ px: 1.5, py: 0.75 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#5f6368', letterSpacing: '0.06em' }}>
                    {t.drawerEnvsHeader}
                  </Typography>
                </Box>

                {allBackstageMenuItems.map((item) => (
                  <ListItemButton
                    key={item.id}
                    selected={backstageTab === item.id}
                    onClick={() => setBackstageTab(item.id)}
                    sx={{
                      py: 1.1,
                      mb: 0.5,
                      borderRadius: 2,
                      '&.Mui-selected': {
                        bgcolor: '#e8f0fe',
                        color: '#174ea6',
                        '&:hover': { bgcolor: '#d2e3fc' }
                      }
                    }}
                  >
                    <ListItemText
                      primary={item.title[lang]}
                      secondary={item.subtitle[lang]}
                      primaryTypographyProps={{
                        fontWeight: backstageTab === item.id ? 700 : 500,
                        fontSize: '0.86rem',
                        color: backstageTab === item.id ? '#174ea6' : '#202124'
                      }}
                      secondaryTypographyProps={{ fontSize: '0.73rem', color: '#5f6368' }}
                    />
                  </ListItemButton>
                ))}

                <Divider sx={{ my: 1.5, borderColor: '#e8eaed' }} />

                <ListItemButton
                  component="a"
                  href={ssoToken ? `${LANDING_PORTAL_URL}?sso_token=${encodeURIComponent(ssoToken)}&lang=${encodeURIComponent(lang)}` : `${LANDING_PORTAL_URL}?lang=${encodeURIComponent(lang)}`}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ArrowBackIcon sx={{ color: '#1a73e8', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={t.drawerBackHome}
                    secondary={t.drawerBackHomeSub}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.86rem', color: '#1a73e8' }}
                  />
                </ListItemButton>

                <Divider sx={{ my: 1.5, borderColor: '#e8eaed' }} />

                <Box sx={{ px: 1.5, py: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#5f6368', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
                    IDIOMA
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    {([
                      { code: 'pt-BR', label: 'PT' },
                      { code: 'es-419', label: 'ES' },
                      { code: 'en-US', label: 'EN' }
                    ] as { code: Language; label: string }[]).map((opt) => (
                      <Button
                        key={opt.code}
                        size="small"
                        variant={lang === opt.code ? 'contained' : 'outlined'}
                        onClick={() => handleLanguageChange(opt.code)}
                        sx={{
                          flex: 1,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          bgcolor: lang === opt.code ? '#1a73e8' : 'transparent',
                          borderColor: '#dadce0',
                          color: lang === opt.code ? '#ffffff' : '#202124'
                        }}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </Box>
                </Box>
              </List>
            </Box>
          </Box>

          {/* Conteúdo principal */}
          <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
            {statusMessage && (
              <div className="mb-4 w-full">
                <Alert
                  severity="info"
                  onClose={() => setStatusMessage(null)}
                  sx={{ bgcolor: '#e8f0fe', color: '#174ea6', borderLeft: '4px solid #1a73e8', fontWeight: 500 }}
                >
                  {statusMessage}
                </Alert>
              </div>
            )}

            {!currentUser ? (
              <Paper
                elevation={0}
                sx={{
                  maxWidth: 620,
                  mx: 'auto',
                  mt: 4,
                  p: { xs: 3.5, md: 5 },
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  border: '1px solid #dadce0',
                  boxShadow: '0 1px 3px rgba(60, 64, 67, 0.12)'
                }}
              >
                <ShieldIcon sx={{ fontSize: 44, color: '#1a73e8', mb: 1.5 }} />
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: '#202124', mb: 1.5 }}
                >
                  {t.authWallTitle}
                </Typography>
                <Typography variant="body2" sx={{ color: '#5f6368', mb: 3.5, lineHeight: 1.6 }}>
                  {t.authWallDesc}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShieldIcon />}
                    onClick={() => setLoginTriggerCount((c) => c + 1)}
                    sx={{
                      bgcolor: '#1a73e8',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 999,
                      px: 3.5,
                      py: 1.1,
                      '&:hover': { bgcolor: '#1557b0' }
                    }}
                  >
                    {t.loginPublicServantBtn}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    href={`${LANDING_PORTAL_URL}?lang=${encodeURIComponent(lang)}`}
                    sx={{
                      borderColor: '#dadce0',
                      color: '#202124',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 999,
                      px: 3
                    }}
                  >
                    {t.backHomeBtn}
                  </Button>
                </Box>
              </Paper>
            ) : !currentUser.backstage_allowed ? (
              <div className="bg-white border border-[#d93025] rounded-xl p-8 max-w-3xl mx-auto my-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-3 text-[#c5221f]">
                  <AlertTriangle className="w-7 h-7 text-[#d93025] shrink-0" />
                  <div>
                    <div className="font-mono text-xs uppercase font-semibold text-[#d93025]">
                      CONTROLE DE ACESSO (RBAC)
                    </div>
                    <h2 className="text-xl font-bold text-[#202124]">
                      Acesso restrito a servidores públicos
                    </h2>
                  </div>
                </div>

                <p className="text-sm text-[#5f6368] leading-relaxed">
                  A conta autenticada <strong>{currentUser.full_name}</strong> (<code className="font-mono">{currentUser.nid}</code>) possui perfil de cidadão (<code className="font-mono">CITIZEN_COMMON</code>) e não dispõe de permissões administrativas no Backstage.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={ssoToken ? `${CITIZEN_PORTAL_URL}?sso_token=${encodeURIComponent(ssoToken)}&lang=${encodeURIComponent(lang)}` : `${CITIZEN_PORTAL_URL}?lang=${encodeURIComponent(lang)}`}
                    className="bg-[#1a73e8] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-[#1557b0] transition flex items-center gap-2"
                  >
                    Ir para o Portal do Cidadão
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setLoginTriggerCount((c) => c + 1)}
                    className="bg-[#e8f0fe] text-[#174ea6] px-4 py-2.5 rounded-full text-xs font-semibold hover:bg-[#d2e3fc] transition"
                  >
                    Trocar para conta de servidor
                  </button>
                </div>
              </div>
            ) : (
              currentUser && (
                <>
                  {/* Barra de módulo ativo */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 3,
                      borderRadius: 2.5,
                      bgcolor: '#ffffff',
                      border: '1px solid #dadce0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<MenuIcon />}
                        onClick={() => setHamburgerOpen((prev) => !prev)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          borderColor: '#dadce0',
                          color: '#202124',
                          borderRadius: 2
                        }}
                      >
                        {t.switchEnvBtn}
                      </Button>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#202124' }}>
                          {activeMenuObj.title[lang]}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#5f6368' }}>
                          {activeMenuObj.subtitle[lang]}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={`${t.authenticatedServantChip}: ${currentUser.full_name} (${currentUser.effective_role_code})`}
                      size="small"
                      sx={{
                        bgcolor: '#e6f4ea',
                        color: '#137333',
                        fontFamily: 'monospace',
                        fontWeight: 600
                      }}
                    />
                  </Paper>

                  {/* Gabinete Executivo */}
                  {backstageTab === 'pm_cabinet' && (
                    <div className="space-y-6">
                      <div className="bg-white border border-[#dadce0] rounded-xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                        <div className="space-y-1">
                          <div className="font-mono text-xs uppercase text-[#1a73e8] font-semibold">
                            GABINETE EXECUTIVO
                          </div>
                          <h2 className="text-xl font-bold text-[#202124]">
                            Painel de Gestão de Estado
                          </h2>
                          <p className="text-xs text-[#5f6368]">
                            Indicadores populacionais, rede pública de atendimento e servidores ativos.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setBackstageTab('iam360')}
                            className="bg-[#1a73e8] text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-[#1557b0] transition"
                          >
                            Gerenciar Permissões (IAM)
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white border border-[#dadce0] rounded-xl p-4">
                          <div className="text-xs text-[#5f6368] font-medium">População Registrada</div>
                          <div className="text-2xl font-mono font-bold text-[#202124] mt-1">
                            {backstageOverview?.kpis?.total_citizens?.toLocaleString('pt-BR') || '100.000'}
                          </div>
                          <div className="text-[11px] text-[#1e8e3e] font-medium mt-1">Cadastro Nacional NID</div>
                        </div>
                        <div className="bg-white border border-[#dadce0] rounded-xl p-4">
                          <div className="text-xs text-[#5f6368] font-medium">Vínculos Familiares</div>
                          <div className="text-2xl font-mono font-bold text-[#202124] mt-1">
                            {backstageOverview?.kpis?.total_family_links?.toLocaleString('pt-BR') || '71.425'}
                          </div>
                          <div className="text-[11px] text-[#5f6368] mt-1">Registro Civil</div>
                        </div>
                        <div className="bg-white border border-[#dadce0] rounded-xl p-4">
                          <div className="text-xs text-[#5f6368] font-medium">Médicos Credenciados</div>
                          <div className="text-2xl font-mono font-bold text-[#202124] mt-1">
                            {backstageOverview?.kpis?.total_doctors?.toLocaleString('pt-BR') || '589'}
                          </div>
                          <div className="text-[11px] text-[#5f6368] mt-1">6 Unidades Hospitalares</div>
                        </div>
                        <div className="bg-white border border-[#dadce0] rounded-xl p-4">
                          <div className="text-xs text-[#5f6368] font-medium">Professores na Rede</div>
                          <div className="text-2xl font-mono font-bold text-[#202124] mt-1">
                            {backstageOverview?.kpis?.total_teachers?.toLocaleString('pt-BR') || '912'}
                          </div>
                          <div className="text-[11px] text-[#5f6368] mt-1">20.440 Alunos Matriculados</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Identidade e Acessos (IAM) */}
                  {backstageTab === 'iam360' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-5 bg-white border border-[#dadce0] rounded-xl p-6 space-y-4">
                        <div className="border-b border-[#e8eaed] pb-3">
                          <div className="font-mono text-[11px] uppercase text-[#1a73e8] font-semibold">
                            GESTÃO DE ACESSOS (RBAC)
                          </div>
                          <h3 className="text-base font-bold text-[#202124] mt-0.5">
                            Conceder Permissão Administrativa
                          </h3>
                          <p className="text-xs text-[#5f6368] mt-0.5">
                            Atribua ou revogue perfis de acesso ao Backstage para servidores públicos.
                          </p>
                        </div>

                        <form onSubmit={handleGrantRole} className="space-y-3 text-xs">
                          <div>
                            <label className="block font-semibold text-[#202124] mb-1">
                              NID do Cidadão / Servidor
                            </label>
                            <input
                              type="text"
                              value={iamTargetNid}
                              onChange={(e) => setIamTargetNid(e.target.value)}
                              className="w-full border border-[#dadce0] rounded-lg px-3 py-2 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-[#202124] mb-1">
                              Perfil de Acesso
                            </label>
                            <select
                              value={iamSelectedRole}
                              onChange={(e) => setIamSelectedRole(e.target.value)}
                              className="w-full border border-[#dadce0] rounded-lg px-3 py-2"
                            >
                              <option value="IDENTITY_MANAGER_360">IDENTITY_MANAGER_360 (Gestor de Identidades)</option>
                              <option value="SECRETARY_GENERAL">SECRETARY_GENERAL (Secretário-Geral)</option>
                              <option value="DOCTOR_AND_HEALTH_MANAGER">DOCTOR_AND_HEALTH_MANAGER (Gestor de Saúde & Médico)</option>
                              <option value="DOCTOR_TELEMED">DOCTOR_TELEMED (Médico de Telemedicina)</option>
                              <option value="TEACHER_AND_EDU_MANAGER">TEACHER_AND_EDU_MANAGER (Gestor de Educação & Professor)</option>
                              <option value="TEACHER_EDUCATOR">TEACHER_EDUCATOR (Professor da Rede Pública)</option>
                              <option value="OPERATIONS_311_911_MANAGER">OPERATIONS_311_911_MANAGER (Coordenador 311/911)</option>
                              <option value="JUSTICE_AND_TREASURY_MANAGER">JUSTICE_AND_TREASURY_MANAGER (Magistrado & Tesouro)</option>
                            </select>
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-[#1a73e8] text-white font-semibold py-2.5 rounded-lg hover:bg-[#1557b0] transition"
                          >
                            Conceder Permissão
                          </button>
                        </form>
                      </div>

                      <div className="lg:col-span-7 bg-white border border-[#dadce0] rounded-xl p-6 space-y-4">
                        <div className="border-b border-[#e8eaed] pb-3 flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-bold text-[#202124]">
                              Servidores com Acesso Ativo
                            </h3>
                            <p className="text-xs text-[#5f6368] mt-0.5">
                              Ao revogar a permissão, a conta retorna ao perfil padrão (<code className="font-mono">CITIZEN_COMMON</code>).
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2.5 max-h-96 overflow-y-auto">
                          {(iamState?.privileged_servants || []).map((srv: any) => (
                            <div
                              key={srv.nid}
                              className="p-3 rounded-lg bg-[#f8f9fa] border border-[#dadce0] flex flex-wrap items-center justify-between gap-2 text-xs"
                            >
                              <div>
                                <div className="font-bold text-[#202124]">{srv.full_name}</div>
                                <div className="font-mono text-[11px] text-[#5f6368]">
                                  {srv.nid} • {srv.email} • {srv.profession}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#e8f0fe] text-[#174ea6] font-semibold">
                                  {srv.iam_role}
                                </span>
                                {srv.nid !== 'NID-000-0000-0001-9' && (
                                  <button
                                    onClick={() => handleRevokeRole(srv.nid)}
                                    className="px-2.5 py-1 rounded-lg bg-[#d93025] text-white text-[11px] font-semibold hover:bg-[#b31412] transition"
                                  >
                                    Revogar
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gestão da Saúde */}
                  {backstageTab === 'health_mgmt' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-6 bg-white border border-[#dadce0] rounded-xl p-5 space-y-3">
                          <h3 className="text-base font-bold text-[#202124]">
                            Unidades Hospitalares e Clínicas
                          </h3>
                          <div className="space-y-2 text-xs">
                            {(healthBackstage?.facilities || []).map((f: any) => (
                              <div key={f.facility_id} className="p-3 rounded-lg bg-[#f8f9fa] border border-[#dadce0] flex justify-between">
                                <div>
                                  <div className="font-bold text-[#202124]">{f.name}</div>
                                  <div className="text-[11px] text-[#5f6368]">
                                    {f.district} • Direção: {f.director}
                                  </div>
                                </div>
                                <div className="text-right font-mono text-[11px]">
                                  <div className="text-[#1e8e3e] font-bold">Ocupação: {f.occupancy_rate}%</div>
                                  <div className="text-[#5f6368]">Fila Teleconsulta: {f.telemed_queue}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="lg:col-span-6 bg-white border border-[#dadce0] rounded-xl p-5 space-y-3">
                          <h3 className="text-base font-bold text-[#202124]">
                            Atendimentos de Telemedicina
                          </h3>
                          <div className="space-y-2 text-xs max-h-80 overflow-y-auto">
                            {(healthBackstage?.telemed_consultations || []).map((c: any) => (
                              <div key={c.consult_id} className="p-3 rounded-lg bg-[#f8f9fa] border border-[#dadce0] space-y-1">
                                <div className="flex justify-between font-mono text-[11px]">
                                  <strong className="text-[#202124]">
                                    {c.consult_id} • Paciente: {c.patient_name} ({c.patient_nid})
                                  </strong>
                                  <span className="text-[#1e8e3e] font-bold">{c.status}</span>
                                </div>
                                <div className="text-[11px] text-[#5f6368]">
                                  Médico: <strong>{c.doctor_name}</strong> • {c.facility}
                                </div>
                                <div className="text-[#202124]">{c.ai_clinical_summary}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gestão da Educação */}
                  {backstageTab === 'edu_mgmt' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-5 bg-white border border-[#dadce0] rounded-xl p-5 space-y-4">
                        <h3 className="text-base font-bold text-[#202124]">
                          Diário de Classe • Lançamento de Notas
                        </h3>
                        <form onSubmit={handleUpdateStudentGrades} className="space-y-3 text-xs">
                          <div>
                            <label className="block font-semibold text-[#202124] mb-1">NID do Aluno</label>
                            <input
                              type="text"
                              value={gradeStudentNid}
                              onChange={(e) => setGradeStudentNid(e.target.value)}
                              className="w-full border border-[#dadce0] rounded-lg px-3 py-2 font-mono"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block font-semibold text-[#202124] mb-1">Matemática</label>
                              <input
                                type="number"
                                value={gradeMath}
                                onChange={(e) => setGradeMath(Number(e.target.value))}
                                className="w-full border border-[#dadce0] rounded-lg px-3 py-1.5 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#202124] mb-1">Ciências</label>
                              <input
                                type="number"
                                value={gradeSci}
                                onChange={(e) => setGradeSci(Number(e.target.value))}
                                className="w-full border border-[#dadce0] rounded-lg px-3 py-1.5 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#202124] mb-1">Robótica</label>
                              <input
                                type="number"
                                value={gradeAi}
                                onChange={(e) => setGradeAi(Number(e.target.value))}
                                className="w-full border border-[#dadce0] rounded-lg px-3 py-1.5 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#202124] mb-1">Idiomas</label>
                              <input
                                type="number"
                                value={gradeLang}
                                onChange={(e) => setGradeLang(Number(e.target.value))}
                                className="w-full border border-[#dadce0] rounded-lg px-3 py-1.5 font-mono"
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-[#1a73e8] text-white font-semibold py-2 rounded-lg hover:bg-[#1557b0] transition"
                          >
                            Salvar Notas
                          </button>
                        </form>

                        <form onSubmit={handleCreateExam} className="pt-4 border-t border-[#e8eaed] space-y-3 text-xs">
                          <div className="font-bold text-sm text-[#202124]">
                            Publicar Nova Avaliação
                          </div>
                          <input
                            type="text"
                            value={examTitle}
                            onChange={(e) => setExamTitle(e.target.value)}
                            placeholder="Título da avaliação (ex: Avaliação Semestral)"
                            className="w-full border border-[#dadce0] rounded-lg px-3 py-2"
                          />
                          <button
                            type="submit"
                            className="w-full bg-[#1e8e3e] text-white font-semibold py-2 rounded-lg hover:bg-[#137333] transition"
                          >
                            Publicar Avaliação
                          </button>
                        </form>
                      </div>

                      <div className="lg:col-span-7 bg-white border border-[#dadce0] rounded-xl p-5 space-y-3">
                        <h3 className="text-base font-bold text-[#202124]">
                          Alunos Matriculados e Desempenho
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-[#dadce0] bg-[#f8f9fa] font-mono text-[10px] uppercase text-[#5f6368]">
                                <th className="p-2">Aluno / NID</th>
                                <th className="p-2">Escola / Série</th>
                                <th className="p-2">Mat</th>
                                <th className="p-2">Ciên</th>
                                <th className="p-2">Rob</th>
                                <th className="p-2">Idiom</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(eduBackstage?.student_enrollments || []).slice(0, 10).map((st: any) => (
                                <tr key={st.enrollment_id} className="border-b border-[#e8eaed] hover:bg-[#f8f9fa]">
                                  <td className="p-2">
                                    <div className="font-bold text-[#202124]">{st.student_name}</div>
                                    <div className="font-mono text-[10px] text-[#5f6368]">{st.student_nid}</div>
                                  </td>
                                  <td className="p-2 text-[11px] text-[#5f6368]">
                                    {st.school_id} • {st.grade_level}
                                  </td>
                                  <td className="p-2 font-mono font-bold">{st.score_mathematics}</td>
                                  <td className="p-2 font-mono font-bold">{st.score_sciences}</td>
                                  <td className="p-2 font-mono font-bold text-[#1a73e8]">{st.score_ai_robotics}</td>
                                  <td className="p-2 font-mono font-bold">{st.score_languages}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Zeladoria Urbana 311 */}
                  {backstageTab === 'ops_311' && (
                    <div className="bg-white border border-[#dadce0] rounded-xl p-6 space-y-4">
                      <div className="border-b border-[#e8eaed] pb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-[#202124] flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-[#1a73e8]" />
                            Zeladoria Urbana 311 • Fila de Solicitações
                          </h3>
                          <p className="text-xs text-[#5f6368] mt-0.5">
                            Gerenciamento de chamados de manutenção urbana, iluminação, limpeza e drenagem.
                          </p>
                        </div>
                        <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#e8f0fe] text-[#174ea6] font-semibold">
                          {(opsBackstage?.tickets_311 || []).length} Chamados
                        </span>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        {(opsBackstage?.tickets_311 || []).map((tk: any) => (
                          <div key={tk.ticket_id} className="p-3.5 rounded-lg bg-[#f8f9fa] border border-[#dadce0] space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-[#202124]">
                                #{tk.ticket_id} • {tk.category}
                              </span>
                              <span
                                className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                                  tk.status === 'CONCLUIDO'
                                    ? 'bg-[#e6f4ea] text-[#137333]'
                                    : 'bg-[#fef7e0] text-[#b06000]'
                                }`}
                              >
                                {tk.status}
                              </span>
                            </div>
                            <div className="text-[#202124]">{tk.description}</div>
                            <div className="flex items-center justify-between pt-1 text-[11px] text-[#5f6368]">
                              <span>
                                Solicitante: <strong>{tk.citizen_name}</strong> ({tk.citizen_nid}) • {tk.district}
                              </span>
                              {tk.status !== 'CONCLUIDO' && (
                                <button
                                  onClick={() => handleResolve311(tk.ticket_id)}
                                  className="bg-[#1a73e8] text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-[#1557b0]"
                                >
                                  Concluir Atendimento
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Central de Emergência 911 */}
                  {backstageTab === 'ops_911' && (
                    <div className="bg-white border border-[#d93025] rounded-xl p-6 space-y-4">
                      <div className="border-b border-[#fce8e6] pb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-[#c5221f] flex items-center gap-2">
                            <Siren className="w-5 h-5 text-[#d93025]" />
                            Central de Emergência 911
                          </h3>
                          <p className="text-xs text-[#5f6368] mt-0.5">
                            Acompanhamento de ocorrências médicas de urgência, defesa civil e guarda costeira.
                          </p>
                        </div>
                        <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#fce8e6] text-[#c5221f] font-semibold">
                          {(opsBackstage?.dispatches_911 || []).length} Ocorrências Ativas
                        </span>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        {(opsBackstage?.dispatches_911 || []).map((dp: any) => (
                          <div key={dp.dispatch_id} className="p-3.5 rounded-lg bg-[#fce8e6]/40 border border-[#f5c2c0] space-y-1">
                            <div className="flex justify-between font-mono text-[11px] font-bold text-[#c5221f]">
                              <span>#{dp.dispatch_id} • {dp.emergency_type}</span>
                              <span>Tempo estimado: {dp.eta_minutes} min</span>
                            </div>
                            <div className="text-[#202124] font-medium">{dp.ai_protocol}</div>
                            <div className="text-[11px] text-[#5f6368]">
                              Cidadão: <strong>{dp.citizen_name}</strong> ({dp.citizen_nid}) • {dp.district}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cadastro Nacional e Tesouro */}
                  {backstageTab === 'justice_datalake' && (
                    <div className="space-y-6">
                      <div className="bg-white border border-[#dadce0] rounded-xl p-5 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8eaed] pb-3">
                          <div>
                            <h3 className="text-base font-bold text-[#202124]">
                              Diretório Nacional de Cidadãos (100.000 Registros)
                            </h3>
                            <p className="text-xs text-[#5f6368] mt-0.5">
                              Consulta cadastral integrada à base operacional e analítica.
                            </p>
                          </div>
                          <form onSubmit={handleSearchDatalake} className="flex gap-2 text-xs">
                            <input
                              type="text"
                              value={datalakeFilter}
                              onChange={(e) => setDatalakeFilter(e.target.value)}
                              placeholder="Filtrar por nome, NID, cargo ou e-mail..."
                              className="border border-[#dadce0] rounded-lg px-3 py-1.5 w-64"
                            />
                            <button
                              type="submit"
                              className="bg-[#1a73e8] text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-[#1557b0]"
                            >
                              Buscar
                            </button>
                          </form>
                        </div>

                        <div className="overflow-x-auto max-h-96">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-[#dadce0] bg-[#f8f9fa] font-mono text-[10px] uppercase text-[#5f6368]">
                                <th className="p-2">NID</th>
                                <th className="p-2">Nome</th>
                                <th className="p-2">Idade</th>
                                <th className="p-2">Cargo / Especialidade</th>
                                <th className="p-2">Distrito</th>
                                <th className="p-2">Perfil IAM</th>
                                <th className="p-2">Ação</th>
                              </tr>
                            </thead>
                            <tbody>
                              {datalakeExplorerResults.map((row: any) => (
                                <tr key={row.nid} className="border-b border-[#e8eaed] hover:bg-[#f8f9fa]">
                                  <td className="p-2 font-mono font-bold text-[#1a73e8]">{row.nid}</td>
                                  <td className="p-2 font-semibold text-[#202124]">{row.full_name}</td>
                                  <td className="p-2 font-mono">{row.age}</td>
                                  <td className="p-2 text-[#5f6368]">
                                    {row.profession} ({row.specialty})
                                  </td>
                                  <td className="p-2">{row.district}</td>
                                  <td className="p-2 font-mono text-[10px]">{row.iam_role}</td>
                                  <td className="p-2">
                                    <button
                                      onClick={() => {
                                        setIamTargetNid(row.nid);
                                        setBackstageTab('iam360');
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-[#e8f0fe] text-[#174ea6] font-semibold text-[11px] hover:bg-[#d2e3fc]"
                                    >
                                      Gerenciar acesso
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Módulos Setoriais Integrados */}
                  {activePluggableQueue && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl p-6 border border-[#dadce0] shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8eaed] pb-4 mb-5">
                          <div>
                            <h3 className="text-lg font-bold text-[#202124]">
                              {pluggableQueueView?.headline?.[lang] || activePluggableQueue.title[lang]}
                            </h3>
                            <p className="text-xs text-[#5f6368] mt-0.5">
                              {pluggableQueueView?.summary?.[lang] || activePluggableQueue.subtitle[lang]}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(pluggableQueueView?.actions || []).map((act: any) => (
                              <button
                                key={act.action_id}
                                onClick={() => {
                                  if (act.externalUrl) {
                                    window.open(act.externalUrl, '_blank', 'noopener,noreferrer');
                                  }
                                  handlePluggableBackstageAction(activePluggableQueue.appId, act.action_id);
                                }}
                                className="bg-[#1a73e8] text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-[#1557b0] transition flex items-center gap-1.5"
                              >
                                {act.label?.[lang] || act.label?.pt || act.action_id}
                                {act.externalUrl && <ExternalLink className="w-3.5 h-3.5" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        {pluggableQueueView?.kpis && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {pluggableQueueView.kpis.map((kpi: any, idx: number) => (
                              <div key={idx} className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dadce0]">
                                <div className="text-[11px] font-semibold uppercase text-[#5f6368]">
                                  {kpi.label?.[lang] || kpi.label?.pt}
                                </div>
                                <div className="text-xl font-bold text-[#202124] mt-1">{kpi.value}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5f6368]">
                            Registros e Sistemas Integrados
                          </h4>
                          {(pluggableQueueView?.records || []).map((rec: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dadce0] flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-[#1a73e8]">
                                    {rec.case_number || rec.cert_id}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] text-[10px] font-semibold">
                                    {rec.status}
                                  </span>
                                </div>
                                <div className="text-sm font-bold text-[#202124] mt-1">
                                  {rec.subject || rec.cert_type}
                                </div>
                                <div className="text-xs text-[#5f6368] mt-0.5">
                                  {rec.court_branch || `Hash: ${rec.authenticity_hash}`} • {rec.ai_conciliation_summary || rec.issued_at}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {rec.claim_amount_nva !== undefined && (
                                  <div className="text-right">
                                    <div className="text-xs text-[#5f6368]">Valor da Causa</div>
                                    <div className="text-sm font-bold text-[#202124]">NVA$ {rec.claim_amount_nva}</div>
                                  </div>
                                )}
                                {rec.external_url && (
                                  <a
                                    href={rec.external_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3.5 py-1.5 rounded-lg bg-[#1e8e3e] text-white text-xs font-semibold hover:bg-[#137333] flex items-center gap-1"
                                  >
                                    Acessar <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </main>
        </Box>
      </div>
    </ThemeProvider>
  );
}
