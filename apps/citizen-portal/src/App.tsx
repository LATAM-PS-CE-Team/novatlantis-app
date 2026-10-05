import React, { useState, useEffect } from 'react';
import {
  Shield,
  Globe,
  CheckCircle2,
  Stethoscope,
  GraduationCap,
  Siren,
  Wrench,
  Lock,
  ExternalLink,
  Activity,
  Users,
  Landmark,
  Plane,
  Briefcase,
  ArrowLeft,
  Home,
  FileText,
  KeyRound,
  HeartPulse,
  MapPin
} from 'lucide-react';
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Container,
  Box,
  Paper,
  Typography,
  Chip,
  Alert,
  Button,
  Drawer,
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
import { TopNavUserWidget, SupportedLanguage, resolveInitialLanguage, DYNAMIC_PORTAL_URLS } from './components/TopNavUserWidget';
import { novatlantisTheme } from './theme';

type Language = SupportedLanguage;
type CitizenTab = 'identity' | 'family_address' | 'health' | 'education' | 'urban_311' | 'emergency_911' | 'treasury' | string;

const LANDING_PORTAL_URL = DYNAMIC_PORTAL_URLS.landingPortalUrl;
const GOV_BACKSTAGE_URL = DYNAMIC_PORTAL_URLS.govBackstageUrl;

const CITIZEN_MENU_ITEMS: {
  id: CitizenTab;
  appId?: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
}[] = [
  {
    id: 'identity',
    title: {
      'pt-BR': 'Identidade Digital (NID)',
      'es-419': 'Identidad Digital (NID)',
      'en-US': 'Digital Identity (NID)'
    },
    subtitle: {
      'pt-BR': 'Credencial digital e histórico de acesso',
      'es-419': 'Credencial digital e historial de acceso',
      'en-US': 'Digital credential and access log'
    }
  },
  {
    id: 'family_address',
    title: {
      'pt-BR': 'Núcleo Familiar e Endereço',
      'es-419': 'Núcleo Familiar y Domicilio',
      'en-US': 'Family & Residence'
    },
    subtitle: {
      'pt-BR': 'Vínculos civis e atualização cadastral',
      'es-419': 'Vínculos civiles y actualización de domicilio',
      'en-US': 'Civil links and residence update'
    }
  },
  {
    id: 'health',
    title: {
      'pt-BR': 'Saúde e Telemedicina',
      'es-419': 'Salud y Telemedicina',
      'en-US': 'Health & Telemedicine'
    },
    subtitle: {
      'pt-BR': 'Prontuário clínico, vacinas e consultas',
      'es-419': 'Historia clínica, vacunas y consultas',
      'en-US': 'Medical record, vaccines, and appointments'
    }
  },
  {
    id: 'education',
    title: {
      'pt-BR': 'Educação e Boletim Escolar',
      'es-419': 'Educación y Boletín Escolar',
      'en-US': 'Education & Report Card'
    },
    subtitle: {
      'pt-BR': 'Matrícula, notas por disciplina e frequência',
      'es-419': 'Matrícula, calificaciones por materia y asistencia',
      'en-US': 'Enrollment, subject grades, and attendance'
    }
  },
  {
    id: 'urban_311',
    title: {
      'pt-BR': 'Zeladoria Urbana 311',
      'es-419': 'Mantenimiento Urbano 311',
      'en-US': '311 Urban Services'
    },
    subtitle: {
      'pt-BR': 'Solicitações de manutenção e iluminação',
      'es-419': 'Solicitudes de mantenimiento y alumbrado',
      'en-US': 'Maintenance and street lighting requests'
    }
  },
  {
    id: 'emergency_911',
    title: {
      'pt-BR': 'Emergência 911',
      'es-419': 'Emergencia 911',
      'en-US': '911 Emergency'
    },
    subtitle: {
      'pt-BR': 'Acionamento médico e defesa civil',
      'es-419': 'Activación médica y defensa civil',
      'en-US': 'Medical and civil defense dispatch'
    }
  },
  {
    id: 'treasury',
    title: {
      'pt-BR': 'Empresas e Passaporte',
      'es-419': 'Empresas y Pasaporte',
      'en-US': 'Business & Passport'
    },
    subtitle: {
      'pt-BR': 'Registro empresarial, benefícios e passaporte',
      'es-419': 'Registro empresarial, beneficios y pasaporte',
      'en-US': 'Business registration, benefits, and passport'
    }
  }
];

const CITIZEN_PORTAL_I18N: Record<
  Language,
  {
    officialBanner: string;
    backToHome: string;
    govTitle: string;
    portalBadge: string;
    activeModuleLabel: string;
    defaultSubline: string;
    drawerTitle: string;
    drawerUnauthenticated: string;
    drawerModulesHeader: string;
    drawerBackHome: string;
    drawerBackHomeSub: string;
    authRequiredTitle: string;
    authRequiredDesc: string;
    loginNowBtn: string;
    publicChatBtn: string;
    switchModuleBtn: string;
    authenticatedChip: string;
  }
> = {
  'pt-BR': {
    officialBanner: 'Site oficial do Governo de Novatlantis • Portal do Cidadão',
    backToHome: 'Início',
    govTitle: 'Governo de Novatlantis',
    portalBadge: 'Portal do Cidadão',
    activeModuleLabel: 'Serviço',
    defaultSubline: 'Autoatendimento e documentos digitais',
    drawerTitle: 'Menu do Cidadão',
    drawerUnauthenticated: 'Não conectado',
    drawerModulesHeader: 'SERVIÇOS DISPONÍVEIS',
    drawerBackHome: 'Página inicial',
    drawerBackHomeSub: 'Catálogo de serviços e atendimento',
    authRequiredTitle: 'Acesso ao Portal do Cidadão',
    authRequiredDesc: 'Entre com seu NID para acessar seus documentos, prontuário de saúde, boletim escolar e solicitações.',
    loginNowBtn: 'Entrar com NID',
    publicChatBtn: 'Voltar ao início',
    switchModuleBtn: 'Menu',
    authenticatedChip: 'Conectado'
  },
  'es-419': {
    officialBanner: 'Sitio oficial del Gobierno de Novatlantis • Portal del Ciudadano',
    backToHome: 'Inicio',
    govTitle: 'Gobierno de Novatlantis',
    portalBadge: 'Portal del Ciudadano',
    activeModuleLabel: 'Servicio',
    defaultSubline: 'Autoservicio y documentos digitales',
    drawerTitle: 'Menú del Ciudadano',
    drawerUnauthenticated: 'No conectado',
    drawerModulesHeader: 'SERVICIOS DISPONIBLES',
    drawerBackHome: 'Página principal',
    drawerBackHomeSub: 'Catálogo de servicios y atención',
    authRequiredTitle: 'Acceso al Portal del Ciudadano',
    authRequiredDesc: 'Ingrese con su NID para consultar sus documentos, historia clínica, boletín escolar y solicitudes.',
    loginNowBtn: 'Ingresar con NID',
    publicChatBtn: 'Volver al inicio',
    switchModuleBtn: 'Menú',
    authenticatedChip: 'Conectado'
  },
  'en-US': {
    officialBanner: 'Official website of the Government of Novatlantis • Citizen Portal',
    backToHome: 'Home',
    govTitle: 'Government of Novatlantis',
    portalBadge: 'Citizen Portal',
    activeModuleLabel: 'Service',
    defaultSubline: 'Self-service and digital documents',
    drawerTitle: 'Citizen Menu',
    drawerUnauthenticated: 'Not signed in',
    drawerModulesHeader: 'AVAILABLE SERVICES',
    drawerBackHome: 'Home page',
    drawerBackHomeSub: 'Service catalog and support',
    authRequiredTitle: 'Citizen Portal Sign In',
    authRequiredDesc: 'Sign in with your NID to access your documents, health records, school report cards, and requests.',
    loginNowBtn: 'Sign in with NID',
    publicChatBtn: 'Back to home',
    switchModuleBtn: 'Menu',
    authenticatedChip: 'Signed in'
  }
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => resolveInitialLanguage());
  const t = CITIZEN_PORTAL_I18N[lang] || CITIZEN_PORTAL_I18N['pt-BR'];
  const [activeTab, setActiveTab] = useState<CitizenTab>('identity');
  const [hamburgerOpen, setHamburgerOpen] = useState(true);
  const [loginTriggerCount, setLoginTriggerCount] = useState(0);
  const [ssoToken, setSsoToken] = useState<string | null>(null);
  const [dossier, setDossier] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [pluggableTabs, setPluggableTabs] = useState<typeof CITIZEN_MENU_ITEMS>([]);
  const [pluggableViewData, setPluggableViewData] = useState<any>(null);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('novatlantis_lang', newLang);
    }
  };

  // Forms
  const [newAddressId, setNewAddressId] = useState('');
  const [newDistrict, setNewDistrict] = useState('Distrito Tecnológico');
  const [ticketCategory, setTicketCategory] = useState('Iluminação Pública Inteligente & Sensores IoT');
  const [ticketDesc, setTicketDesc] = useState('');
  const [sosType, setSosType] = useState('Emergência Médica • Unidade Móvel UTI');
  const [telemedSpecialty, setTelemedSpecialty] = useState('Clínica Geral & Medicina Preventiva IA');
  const [telemedSymptoms, setTelemedSymptoms] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companySector, setCompanySector] = useState('Inteligência Artificial Soberana & Robótica');

  const loadCitizen = async (identifier: string) => {
    if (!identifier) return;
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      if (!res.ok) return;
      const data = await res.json();
      setDossier(data);
      setNewAddressId(data.citizen.address_id || 'ADDR-NOV-2026-101');
      setNewDistrict(data.citizen.district || 'Distrito Tecnológico');
      if (
        data.citizen.native_language &&
        ['pt-BR', 'es-419', 'en-US'].includes(data.citizen.native_language) &&
        typeof window !== 'undefined' &&
        !window.localStorage.getItem('novatlantis_lang_explicit')
      ) {
        setLang(data.citizen.native_language as Language);
      }
      loadDashboard(data.citizen.nid);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDashboard = async (nid: string) => {
    try {
      const res = await fetch(`/api/citizen/dashboard?nid=${encodeURIComponent(nid)}`);
      const data = await res.json();
      setDashboard(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawTab = params.get('tab');
    const mappedTab = rawTab === 'urban' ? 'urban_311' : rawTab;
    if (mappedTab) {
      setActiveTab(mappedTab as CitizenTab);
    }

    fetch('/api/v1/registry/apps')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.apps)) return;
        const dynamicTabs = data.apps
          .filter((a: any) => a?.citizenPortalTab?.enabled)
          .map((a: any) => ({
            id: a.citizenPortalTab.tabId,
            appId: a.appId,
            title: a.citizenPortalTab.title,
            subtitle: a.citizenPortalTab.subtitle
          }));
        setPluggableTabs(dynamicTabs);
      })
      .catch(() => {});
  }, []);

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossier?.citizen) return;
    const res = await fetch(`/api/users/${encodeURIComponent(dossier.citizen.nid)}/address`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nid: dossier.citizen.nid,
        address_id: newAddressId,
        district: newDistrict
      })
    });
    const data = await res.json();
    if (data.updated) {
      setDossier(data.dossier);
      loadDashboard(dossier.citizen.nid);
      setStatusBanner(`Endereço soberano atualizado para ${newAddressId} (${newDistrict}) no banco de 100.000 cidadãos.`);
    }
  };

  const handleCreate311 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossier?.citizen) return;
    const res = await fetch('/api/services/311', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        citizen_nid: dossier.citizen.nid,
        category: ticketCategory,
        district: dossier.citizen.district,
        description: ticketDesc || 'Solicitação de manutenção preventiva aberta via Portal do Cidadão.'
      })
    });
    const data = await res.json();
    if (data.created) {
      setTicketDesc('');
      loadDashboard(dossier.citizen.nid);
      setStatusBanner(`Chamado 311 #${data.ticket.ticket_id} registrado e encaminhado para ${data.ticket.assigned_department}.`);
    }
  };

  const handleCreate911 = async () => {
    if (!dossier?.citizen) return;
    const res = await fetch('/api/services/911', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        citizen_nid: dossier.citizen.nid,
        emergency_type: sosType,
        district: dossier.citizen.district
      })
    });
    const data = await res.json();
    if (data.dispatched) {
      loadDashboard(dossier.citizen.nid);
      setStatusBanner(`DESPACHO 911 #${data.dispatch.dispatch_id} ACIONADO! ETA: ${data.dispatch.eta_minutes} minutos.`);
    }
  };

  const handleCreateTelemed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossier?.citizen) return;
    const res = await fetch('/api/services/telemed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_nid: dossier.citizen.nid,
        specialty: telemedSpecialty,
        symptoms: telemedSymptoms
      })
    });
    const data = await res.json();
    if (data.created) {
      setTelemedSymptoms('');
      loadDashboard(dossier.citizen.nid);
      setStatusBanner(`Teleconsulta #${data.consultation.consult_id} realizada! Receita ICP: ${data.consultation.prescription_code}.`);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossier?.citizen) return;
    const res = await fetch('/api/services/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_nid: dossier.citizen.nid,
        company_name: companyName || `${dossier.citizen.full_name.split(' ')[0]} Digital Ventures S.A.`,
        sector: companySector
      })
    });
    const data = await res.json();
    if (data.created) {
      setCompanyName('');
      loadDashboard(dossier.citizen.nid);
      setStatusBanner(`Empresa ${data.company.company_name} (${data.company.company_id}) constituída em ${data.company.incorporation_seconds} segundos!`);
    }
  };

  const handleIssuePassport = async () => {
    if (!dossier?.citizen) return;
    const res = await fetch('/api/services/passport', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nid: dossier.citizen.nid })
    });
    const data = await res.json();
    if (data.issued) {
      loadCitizen(dossier.citizen.nid);
      setStatusBanner(`Passaporte Biométrico ICAO Doc 9303 #${data.passport.passport_number} emitido/revalidado com sucesso!`);
    }
  };

  const allMenuItems = [...CITIZEN_MENU_ITEMS, ...pluggableTabs];
  const activePluggableTab = pluggableTabs.find((p) => p.id === activeTab);

  useEffect(() => {
    if (activePluggableTab && dossier?.citizen?.nid) {
      fetch(`/api/v1/apps/${encodeURIComponent(activePluggableTab.appId)}/view?nid=${encodeURIComponent(dossier.citizen.nid)}&mode=citizen`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.view) setPluggableViewData(data.view);
        })
        .catch(() => {});
    }
  }, [activeTab, activePluggableTab?.appId, dossier?.citizen?.nid]);

  const handlePluggableAction = async (appId: string, actionId: string) => {
    if (!dossier?.citizen?.nid) return;
    const res = await fetch(`/api/v1/apps/${encodeURIComponent(appId)}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actionId,
        nid: dossier.citizen.nid,
        payload: {
          subject: 'Ação de Conciliação Digital Expressa / Relação de Consumo Soberana',
          claim_amount_nva: 4850.00
        }
      })
    });
    const data = await res.json();
    if (data?.result?.message_pt) {
      setStatusBanner(data.result.message_pt);
      const viewRes = await fetch(`/api/v1/apps/${encodeURIComponent(appId)}/view?nid=${encodeURIComponent(dossier.citizen.nid)}&mode=citizen`);
      const viewJson = await viewRes.json();
      if (viewJson?.view) setPluggableViewData(viewJson.view);
    }
  };

  const citizen = dossier?.citizen;
  const activeMenuObj = allMenuItems.find((m) => m.id === activeTab) || allMenuItems[0];

  return (
    <ThemeProvider theme={novatlantisTheme}>
      <CssBaseline />
      <div className="min-h-screen bg-[#f8f9fa] text-[#202124] flex flex-col">
        <Box
          sx={{
            height: 4,
            width: '100%',
            background:
              'linear-gradient(90deg, #4285F4 0%, #4285F4 25%, #EA4335 25%, #EA4335 50%, #FBBC05 50%, #FBBC05 75%, #34A853 75%, #34A853 100%)'
          }}
        />
        {/* Seção de interface Material Design 3 */}
        <Box sx={{ bgcolor: '#f1f3f4', borderBottom: '1px solid #dadce0', py: 0.65, px: 2 }}>
          <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <img src="/assets/flag.jpg" alt="Bandeira de Novatlantis" className="h-3.5 w-5 object-cover border border-slate-300 rounded-sm" />
              <Typography variant="caption" sx={{ color: '#202124', fontWeight: 600, fontSize: '0.76rem' }}>
                {t.officialBanner}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <a
                href={ssoToken ? `${LANDING_PORTAL_URL}?sso_token=${encodeURIComponent(ssoToken)}&lang=${encodeURIComponent(lang)}` : `${LANDING_PORTAL_URL}?lang=${encodeURIComponent(lang)}`}
                className="text-[#1a73e8] hover:underline flex items-center gap-1 text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t.backToHome}
              </a>
            </Box>
          </Container>
        </Box>

        {/* Seção de interface Material Design 3 */}
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #dadce0',
            zIndex: 30
          }}
        >
          <Container maxWidth="xl">
            <Toolbar
              disableGutters
              sx={{
                py: 1.5,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  onClick={() => setHamburgerOpen((prev) => !prev)}
                  sx={{
                    border: '1px solid #d1d5db',
                    borderRadius: 2,
                    p: 1,
                    color: hamburgerOpen ? '#ffffff' : '#1a73e8',
                    bgcolor: hamburgerOpen ? '#1a73e8' : '#ffffff',
                    '&:hover': {
                      bgcolor: hamburgerOpen ? '#1557b0' : '#f3f4f6',
                      borderColor: '#1a73e8'
                    }
                  }}
                  aria-label="Alternar Navigation Drawer (Sidebar) do Portal do Cidadão"
                >
                  <MenuIcon />
                </IconButton>

                <Box
                  component="img"
                  src="/assets/coat_of_arms.jpg"
                  alt="Brasão Oficial"
                  sx={{
                    height: { xs: 44, md: 54 },
                    width: { xs: 44, md: 54 },
                    objectFit: 'cover',
                    borderRadius: 2,
                    border: '1.5px solid #1a73e8'
                  }}
                />
                <Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25 }}>
                    <Typography
                      sx={{
                        fontSize: { xs: '1.15rem', sm: '1.45rem', md: '1.75rem' },
                        fontWeight: 900,
                        color: '#1a73e8',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.15
                      }}
                    >
                      {t.govTitle}
                    </Typography>
                    <Chip
                      label={t.portalBadge}
                      size="small"
                      sx={{
                        bgcolor: '#1a73e8',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.76rem',
                        height: 25
                      }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: { xs: '0.78rem', sm: '0.92rem', md: '1.02rem' },
                      fontWeight: 600,
                      color: '#5f6368',
                      mt: 0.3
                    }}
                  >
                    {citizen
                      ? `${t.activeModuleLabel}: ${activeMenuObj.title[lang]}`
                      : t.defaultSubline}
                  </Typography>
                </Box>
              </Box>

              {/* SELETOR DE IDIOMAS GLOBAL (PT/ES/EN) + STATUS DO USUÁRIO COM A FOTO / LOGIN NID */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TopNavUserWidget
                  currentNid={citizen?.nid}
                  openLoginTrigger={loginTriggerCount}
                  citizenPortalUrl={window.location.origin}
                  govBackstageUrl={GOV_BACKSTAGE_URL}
                  lang={lang}
                  onLanguageChange={handleLanguageChange}
                  onUserAuthenticated={(nid, user, token) => {
                    if (token) setSsoToken(token);
                    if (user?.native_language && ['pt-BR', 'es-419', 'en-US'].includes(user.native_language)) {
                      if (!localStorage.getItem('novatlantis_lang_explicit')) {
                        setLang(user.native_language as Language);
                      }
                    }
                    loadCitizen(nid);
                  }}
                  onUserLoggedOut={() => {
                    setDossier(null);
                    setDashboard(null);
                    setSsoToken(null);
                  }}
                />
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {/* LAYOUT GOOGLE MATERIAL DESIGN: PERSISTENT NAVIGATION DRAWER (SIDEBAR AO LADO) + PÁGINA INTEIRA */}
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, alignItems: 'stretch' }}>
          <Box
            component="aside"
            sx={{
              width: hamburgerOpen ? { xs: 290, md: 340 } : 0,
              flexShrink: 0,
              overflow: 'hidden',
              transition: 'width 225ms cubic-bezier(0.4, 0, 0.2, 1)',
              bgcolor: '#f8f9fa',
              borderRight: hamburgerOpen ? '1px solid #dadce0' : 'none',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ width: { xs: 290, md: 340 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: '#1a73e8',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {t.drawerTitle}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#cbd5e1', fontFamily: 'monospace' }}>
                    {citizen ? `${citizen.full_name} (${citizen.nid})` : t.drawerUnauthenticated}
                  </Typography>
                </Box>
                <IconButton onClick={() => setHamburgerOpen(false)} sx={{ color: '#ffffff' }} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>

              <List sx={{ py: 1.5, px: 1 }}>
                <Box sx={{ px: 1.5, py: 0.75 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#6b7280', letterSpacing: '0.06em' }}>
                    {t.drawerModulesHeader}
                  </Typography>
                </Box>

                {allMenuItems.map((item) => (
                  <ListItemButton
                    key={item.id}
                    selected={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                    sx={{
                      py: 1.25,
                      mb: 0.5,
                      borderRadius: 2,
                      '&.Mui-selected': {
                        bgcolor: '#e8f0fe',
                        color: '#1a73e8',
                        '&:hover': { bgcolor: '#d2e3fc' }
                      }
                    }}
                  >
                    <ListItemText
                      primary={item.title[lang]}
                      secondary={item.subtitle[lang]}
                      primaryTypographyProps={{
                        fontWeight: activeTab === item.id ? 800 : 600,
                        fontSize: '0.86rem',
                        color: '#1a73e8'
                      }}
                      secondaryTypographyProps={{ fontSize: '0.73rem' }}
                    />
                  </ListItemButton>
                ))}

                <Divider sx={{ my: 1.5 }} />

                <ListItemButton
                  component="a"
                  href={ssoToken ? `${LANDING_PORTAL_URL}?sso_token=${encodeURIComponent(ssoToken)}&lang=${encodeURIComponent(lang)}` : `${LANDING_PORTAL_URL}?lang=${encodeURIComponent(lang)}`}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ArrowBackIcon sx={{ color: '#1a73e8' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={t.drawerBackHome}
                    secondary={t.drawerBackHomeSub}
                    primaryTypographyProps={{ fontWeight: 700, fontSize: '0.86rem' }}
                  />
                </ListItemButton>

                <Divider sx={{ my: 1.5 }} />

                {/* Seletor de Idiomas Oficial dentro do Navigation Drawer */}
                <Box sx={{ px: 1.5, py: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#6b7280', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
                    IDIOMA / IDIOMA / LANGUAGE
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {([
                      { code: 'pt-BR', label: 'Português' },
                      { code: 'es-419', label: 'Español' },
                      { code: 'en-US', label: 'English' }
                    ] as { code: Language; label: string }[]).map((opt) => (
                      <Button
                        key={opt.code}
                        size="small"
                        variant={lang === opt.code ? 'contained' : 'outlined'}
                        onClick={() => handleLanguageChange(opt.code)}
                        sx={{
                          flex: 1,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          bgcolor: lang === opt.code ? '#1a73e8' : 'transparent',
                          borderColor: '#1a73e8',
                          color: lang === opt.code ? '#ffffff' : '#1a73e8'
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

          {/* CONTEÚDO PRINCIPAL DO PORTAL DO CIDADÃO (AO LADO DO NAVIGATION DRAWER) */}
          <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
            {/* BANNER DE FEEDBACK */}
            {statusBanner && (
              <div className="mb-4 w-full">
                <Alert severity="success" onClose={() => setStatusBanner(null)}>
                  {statusBanner}
                </Alert>
              </div>
            )}

            {!citizen ? (
              <Paper
                elevation={0}
                sx={{
                  maxWidth: 640,
                  mx: 'auto',
                  mt: 4,
                  p: { xs: 3.5, md: 5 },
                  textAlign: 'center',
                  borderRadius: 4,
                  bgcolor: '#ffffff',
                  border: '1px solid #dadce0',
                  boxShadow: '0 16px 40px -12px rgba(60, 64, 67, 0.12)'
                }}
              >
                <ShieldIcon sx={{ fontSize: 48, color: '#1a73e8', mb: 2 }} />
                <Typography
                  variant="h4"
                  sx={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 700, color: '#1a73e8', mb: 1.5 }}
                >
                  {t.authRequiredTitle}
                </Typography>
                <Typography variant="body1" sx={{ color: '#5f6368', mb: 3.5, lineHeight: 1.6 }}>
                  {t.authRequiredDesc}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShieldIcon />}
                    onClick={() => setLoginTriggerCount((c) => c + 1)}
                    sx={{
                      bgcolor: '#1a73e8',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 999,
                      px: 3.5,
                      py: 1.25,
                      '&:hover': { bgcolor: '#1557b0' }
                    }}
                  >
                    {t.loginNowBtn}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    href={`${LANDING_PORTAL_URL}?lang=${encodeURIComponent(lang)}`}
                    sx={{
                      borderColor: '#1a73e8',
                      color: '#1a73e8',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 999,
                      px: 3
                    }}
                  >
                    {t.publicChatBtn}
                  </Button>
                </Box>
              </Paper>
            ) : (
              <>
                {/* Barra de Seção Atual com Atalho para o Navigation Drawer (☰) */}
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
                        fontWeight: 700,
                        borderColor: '#1a73e8',
                        color: '#1a73e8',
                        borderRadius: 2
                      }}
                    >
                      {t.switchModuleBtn}
                    </Button>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1a73e8' }}>
                        {activeMenuObj.title[lang]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activeMenuObj.subtitle[lang]}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                label={`${t.authenticatedChip}: ${citizen.full_name} (${citizen.nid})`}
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontFamily: 'monospace', fontWeight: 700 }}
              />
            </Paper>

            {/* ABA 1: CARTEIRA DIGITAL NID */}
            {activeTab === 'identity' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-[#1a73e8] text-white rounded p-6 border-2 border-[#d2e3fc]/40 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-white/15 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={citizen.avatarUrl || citizen.avatar_url || '/assets/pm_portrait.jpg'}
                        alt={citizen.full_name}
                        className="h-14 w-14 rounded-full object-cover border-2 border-[#d2e3fc] bg-white"
                      />
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#d2e3fc]">
                          GOVERNO DE NOVATLANTIS • DOCUMENTO DE IDENTIDADE
                        </div>
                        <div className="font-serif-authority text-lg font-bold">
                          Carteira de Identidade Digital (NID)
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      VERIFICADO
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400 uppercase font-mono text-[10px]">Nome</div>
                      <div className="text-base font-bold text-white">
                        {citizen.social_name && citizen.social_name !== citizen.full_name
                          ? `${citizen.social_name} (${citizen.full_name})`
                          : citizen.full_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 uppercase font-mono text-[10px]">NID</div>
                      <div className="text-base font-mono font-bold text-[#d2e3fc]">{citizen.nid}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 uppercase font-mono text-[10px]">Data de nascimento</div>
                      <div className="font-mono text-white">
                        {citizen.birth_date} ({citizen.age} anos)
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 uppercase font-mono text-[10px]">E-mail</div>
                      <div className="font-mono text-white">{citizen.email}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 uppercase font-mono text-[10px]">Cargo / Especialidade</div>
                      <div className="text-white">
                        {citizen.profession} • {citizen.specialty}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 uppercase font-mono text-[10px]">Domicílio e Distrito</div>
                      <div className="font-mono text-white">
                        {citizen.address_id} ({citizen.district})
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#001530] border border-white/15 rounded p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px]">Padrão Biométrico</span>
                      <strong className="font-mono text-[#d2e3fc]">{citizen.nist_biometrics?.standard}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px]">Validação Biométrica</span>
                      <strong className="font-mono text-emerald-400">
                        {(citizen.nist_biometrics?.face_confidence * 100).toFixed(1)}% ({citizen.nist_biometrics?.minutiae_points} pts)
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px]">Assinatura Digital</span>
                      <strong className="font-mono text-white">{citizen.nist_biometrics?.ed25519_key_fingerprint}</strong>
                    </div>
                  </div>
                </div>

                {/* PAINEL DE HISTÓRICO DE ACESSO */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded p-5 space-y-4">
                  <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between">
                    <h3 className="font-serif-authority text-base font-bold text-[#1a73e8] flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#1a73e8]" />
                      Histórico de Acesso (48h)
                    </h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-[#e8f0fe] text-[#174ea6] rounded font-bold">
                      Auditoria
                    </span>
                  </div>
                  <p className="text-xs text-[#5f6368]">
                    Registro de consultas realizadas por órgãos públicos ao seu cadastro.
                  </p>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto">
                    {(dashboard?.audit_log || []).map((log: any) => (
                      <div key={log.id} className="p-3 rounded bg-[#f8f9fb] border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono text-[10px] text-[#1a73e8]">
                          <span className="font-bold">{log.action}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                        </div>
                        <div className="text-[#202124] font-medium">{log.details}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Responsável: {log.actor_name} ({log.actor_nid})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: NÚCLEO FAMILIAR & ENDEREÇO */}
            {activeTab === 'family_address' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded p-6 space-y-4">
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif-authority text-lg font-bold text-[#1a73e8]">
                        Núcleo e Vínculos Familiares
                      </h3>
                      <p className="text-xs text-[#5f6368]">
                        Dados constantes no Registro Civil (somente leitura).
                      </p>
                    </div>
                    <span className="font-mono text-[11px] bg-slate-800 text-[#d2e3fc] px-2.5 py-1 rounded font-bold">
                      SOMENTE LEITURA
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[...(dossier?.family?.outgoing || []), ...(dossier?.family?.incoming || [])].map((rel: any, idx: number) => {
                      const relatedNid = rel.target_name ? rel.target_nid : rel.source_nid;
                      const relatedName = rel.target_name || rel.source_name;
                      const relatedAge = rel.target_age ?? rel.source_age;
                      const relatedProf = rel.target_profession || rel.source_profession;
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded bg-[#f8f9fb] border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#1a73e8] text-sm">{relatedName}</div>
                            <div className="font-mono text-[11px] text-[#5f6368]">
                              {relatedNid} • {relatedAge} anos • {relatedProf}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-[#e8f0fe] text-[#174ea6] font-bold">
                              {rel.relation_type}
                            </span>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              Registro Civil
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ATUALIZAÇÃO DE ENDEREÇO */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded p-6 space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h3 className="font-serif-authority text-lg font-bold text-[#1a73e8] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#1a73e8]" />
                      Atualização de Endereço
                    </h3>
                    <p className="text-xs text-[#5f6368]">
                      Atualize seu código de domicílio e distrito de residência.
                    </p>
                  </div>
                  <form onSubmit={handleUpdateAddress} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-[#1a73e8] mb-1">Código de Endereço</label>
                      <input
                        type="text"
                        value={newAddressId}
                        onChange={(e) => setNewAddressId(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1a73e8] mb-1">Distrito</label>
                      <select
                        value={newDistrict}
                        onChange={(e) => setNewDistrict(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2"
                      >
                        <option value="Distrito Tecnológico">Distrito Tecnológico</option>
                        <option value="Colina da Justiça">Colina da Justiça</option>
                        <option value="Distrito Oceânico">Distrito Oceânico</option>
                        <option value="Vale da Inovação">Vale da Inovação</option>
                        <option value="Porto Soberano">Porto Soberano</option>
                        <option value="Bosque das Ciências">Bosque das Ciências</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#1a73e8] text-white font-bold py-2.5 rounded hover:bg-[#1557b0] transition"
                    >
                      Salvar endereço
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ABA 3: SAÚDE & TELEMEDICINA */}
            {activeTab === 'health' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded p-6 space-y-4">
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                    <h3 className="font-serif-authority text-lg font-bold text-[#1a73e8] flex items-center gap-2">
                      <HeartPulse className="w-5 h-5 text-[#1a73e8]" />
                      Prontuário de Saúde
                    </h3>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                      {dossier?.health?.vaccination_status || 'UP_TO_DATE'}
                    </span>
                  </div>
                  {dossier?.health ? (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded bg-[#f8f9fb] border border-slate-200">
                        <span className="text-slate-500 block font-mono text-[10px]">TIPO SANGUÍNEO</span>
                        <strong className="text-base font-mono text-[#1a73e8]">{dossier.health.blood_type}</strong>
                      </div>
                      <div className="p-3 rounded bg-[#f8f9fb] border border-slate-200">
                        <span className="text-slate-500 block font-mono text-[10px]">DOADOR DE ÓRGÃOS</span>
                        <strong className="text-base font-mono text-[#1a73e8]">
                          {dossier.health.organ_donor ? 'SIM' : 'NÃO'}
                        </strong>
                      </div>
                      <div className="p-3 rounded bg-[#f8f9fb] border border-slate-200">
                        <span className="text-slate-500 block font-mono text-[10px]">CONDIÇÕES CRÔNICAS</span>
                        <strong className="text-[#202124]">{dossier.health.chronic_conditions}</strong>
                      </div>
                      <div className="p-3 rounded bg-[#f8f9fb] border border-slate-200">
                        <span className="text-slate-500 block font-mono text-[10px]">ALERGIAS</span>
                        <strong className="text-[#202124]">{dossier.health.allergies}</strong>
                      </div>
                      <div className="col-span-2 p-3 rounded bg-[#e8f0fe]/30 border border-[#1a73e8]/20">
                        <span className="text-slate-600 block font-mono text-[10px]">MÉDICO RESPONSÁVEL</span>
                        <strong className="text-[#1a73e8] text-sm">
                          {dossier.health.doctor_name || 'Dra. Sofia Mendes Costa'} ({dossier.health.assigned_primary_care_physician_nid})
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Carregando prontuário...</p>
                  )}
                </div>

                {/* TELECONSULTA */}
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded p-6 space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h3 className="font-serif-authority text-lg font-bold text-[#1a73e8]">
                      Agendar Teleconsulta
                    </h3>
                    <p className="text-xs text-[#5f6368]">
                      Atendimento médico remoto com emissão de prescrição digital.
                    </p>
                  </div>
                  <form onSubmit={handleCreateTelemed} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-[#1a73e8] mb-1">Especialidade</label>
                      <select
                        value={telemedSpecialty}
                        onChange={(e) => setTelemedSpecialty(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2"
                      >
                        <option value="Clínica Geral & Medicina Preventiva IA">Clínica Geral e Preventiva</option>
                        <option value="Pediatria & Imunologia">Pediatria e Imunologia</option>
                        <option value="Cardiologia & Check-up Executivo">Cardiologia</option>
                        <option value="Saúde Mental & Neurociência">Saúde Mental</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1a73e8] mb-1">Motivo da consulta</label>
                      <input
                        type="text"
                        value={telemedSymptoms}
                        onChange={(e) => setTelemedSymptoms(e.target.value)}
                        placeholder="Ex: Renovação de receita ou avaliação clínica..."
                        className="w-full border border-slate-300 rounded px-3 py-2"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#1a73e8] text-white font-bold py-2.5 rounded hover:bg-[#1557b0] transition"
                    >
                      Iniciar teleconsulta
                    </button>
                  </form>

                  <div className="pt-2 space-y-2">
                    <div className="font-mono text-[11px] uppercase font-bold text-[#1a73e8]">
                      Histórico de Consultas
                    </div>
                    {(dashboard?.telemed_consultations || []).slice(0, 3).map((tm: any) => (
                      <div key={tm.consult_id} className="p-3 rounded bg-[#f8f9fb] border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between font-mono text-[10px]">
                          <strong className="text-[#1a73e8]">{tm.consult_id} • {tm.specialty}</strong>
                          <span className="text-emerald-700 font-bold">{tm.prescription_code}</span>
                        </div>
                        <div className="text-[#5f6368]">{tm.ai_clinical_summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 4: EDUCAÇÃO & DESEMPENHO ESCOLAR */}
            {activeTab === 'education' && (
              <div className="bg-white border border-slate-200 rounded p-6 space-y-5">
                <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif-authority text-xl font-bold text-[#1a73e8]">
                      Boletim e Frequência Escolar
                    </h3>
                    <p className="text-xs text-[#5f6368]">
                      Acompanhamento de matrícula, frequência e notas por disciplina.
                    </p>
                  </div>
                  <button
                    onClick={() => loadCitizen('NID-000-0000-0010-8')}
                    className="px-3 py-1.5 rounded bg-[#e8f0fe] text-[#174ea6] text-xs font-semibold"
                  >
                    Ver exemplo: Pedro Albuquerque (11 anos)
                  </button>
                </div>

                {dossier?.education ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 bg-[#f8f9fb] border border-slate-200 rounded p-4 space-y-2.5 text-xs">
                      <div className="font-mono text-xs uppercase font-bold text-[#1a73e8]">
                        Dados da Matrícula
                      </div>
                      <div>
                        <span className="text-slate-500">Matrícula: </span>
                        <strong className="font-mono">{dossier.education.enrollment_id}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Unidade Escolar: </span>
                        <strong>{dossier.education.school_id}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Série: </span>
                        <strong>{dossier.education.education_level} • {dossier.education.grade_level}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Docente: </span>
                        <strong>{dossier.education.teacher_name || 'Prof. Lucas Albuquerque Silva'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Frequência: </span>
                        <strong className="font-mono text-emerald-700">{dossier.education.attendance_rate}%</strong>
                      </div>
                    </div>

                    <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-4 rounded bg-[#f8f9fb] border border-slate-200">
                        <div className="font-mono text-[10px] uppercase text-slate-500">Matemática</div>
                        <div className="font-mono text-2xl font-bold text-[#1a73e8] mt-1">
                          {dossier.education.score_mathematics}
                        </div>
                      </div>
                      <div className="p-4 rounded bg-[#f8f9fb] border border-slate-200">
                        <div className="font-mono text-[10px] uppercase text-slate-500">Ciências</div>
                        <div className="font-mono text-2xl font-bold text-[#1a73e8] mt-1">
                          {dossier.education.score_sciences}
                        </div>
                      </div>
                      <div className="p-4 rounded bg-[#e8f0fe]/40 border border-[#1a73e8]/30">
                        <div className="font-mono text-[10px] uppercase text-[#174ea6] font-bold">Tecnologia</div>
                        <div className="font-mono text-2xl font-bold text-[#1a73e8] mt-1">
                          {dossier.education.score_ai_robotics}
                        </div>
                      </div>
                      <div className="p-4 rounded bg-[#f8f9fb] border border-slate-200">
                        <div className="font-mono text-[10px] uppercase text-slate-500">Idiomas</div>
                        <div className="font-mono text-2xl font-bold text-[#1a73e8] mt-1">
                          {dossier.education.score_languages}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded bg-[#f8f9fb] border border-slate-200 text-xs text-[#5f6368]">
                    Nenhuma matrícula escolar ativa para {citizen.full_name}. Clique no botão acima para visualizar o boletim de <strong>Pedro Albuquerque Viana</strong>.
                  </div>
                )}
              </div>
            )}

            {/* ABA 5: ZELADORIA URBANA 311 */}
            {activeTab === 'urban_311' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded p-6 space-y-4">
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                    <h3 className="font-serif-authority text-lg font-bold text-[#1a73e8] flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-[#1a73e8]" />
                      Solicitar Manutenção Urbana 311
                    </h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#e8f0fe] text-[#174ea6] font-bold">
                      311 Urbano
                    </span>
                  </div>
                  <p className="text-xs text-[#5f6368]">
                    Registre solicitações de reparo viário, iluminação pública ou limpeza para o distrito <strong>{citizen.district}</strong>.
                  </p>
                  <form onSubmit={handleCreate311} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-[#1a73e8] mb-1">Categoria</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2"
                      >
                        <option value="Iluminação Pública Inteligente & Sensores IoT">Iluminação Pública</option>
                        <option value="Zeladoria Viária & Drenagem Pluvial">Pavimentação e Drenagem</option>
                        <option value="Coleta Seletiva Automatizada & Resíduos">Coleta de Resíduos</option>
                        <option value="Manutenção de Parques & Mobiliário Urbano">Parques e Mobiliário Urbano</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1a73e8] mb-1">Descrição</label>
                      <input
                        type="text"
                        value={ticketDesc}
                        onChange={(e) => setTicketDesc(e.target.value)}
                        placeholder="Descreva o local e o serviço necessário..."
                        className="w-full border border-slate-300 rounded px-3 py-2"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#1a73e8] text-white font-bold py-2.5 rounded hover:bg-[#1557b0] transition"
                    >
                      Registrar chamado 311
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-6 bg-white border border-slate-200 rounded p-6 space-y-4">
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                    <h3 className="font-serif-authority text-lg font-bold text-[#1a73e8]">
                      Chamados Registrados
                    </h3>
                    <span className="font-mono text-xs text-slate-500">
                      {(dashboard?.tickets_311 || []).length} registros
                    </span>
                  </div>
                  <div className="space-y-2.5 max-h-80 overflow-y-auto text-xs">
                    {(dashboard?.tickets_311 || []).map((tk: any) => (
                      <div key={tk.ticket_id} className="p-3.5 rounded bg-[#f8f9fb] border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <strong className="text-[#1a73e8]">#{tk.ticket_id} • {tk.category}</strong>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tk.status === 'CONCLUIDO'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {tk.status}
                          </span>
                        </div>
                        <div className="text-[#202124]">{tk.description}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Distrito: {tk.district} • Setor: {tk.assigned_department}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 6: EMERGÊNCIA 911 */}
            {activeTab === 'emergency_911' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-white border-2 border-red-800 rounded p-6 space-y-4">
                  <div className="border-b border-red-200 pb-3 flex items-center justify-between">
                    <h3 className="font-serif-authority text-lg font-bold text-red-900 flex items-center gap-2">
                      <Siren className="w-5 h-5 text-red-700" />
                      Acionamento de Emergência 911
                    </h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-900 font-bold">
                      PRIORIDADE
                    </span>
                  </div>
                  <p className="text-xs text-[#5f6368]">
                    Aciona a Central 911 no distrito <strong>{citizen.district}</strong> com envio automático de informações médicas de urgência.
                  </p>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-red-900 mb-1">Tipo de Atendimento</label>
                      <select
                        value={sosType}
                        onChange={(e) => setSosType(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2"
                      >
                        <option value="Emergência Médica • Unidade Móvel UTI">Emergência Médica (Ambulância)</option>
                        <option value="Patrulha de Segurança Cidadã & Defesa Civil">Segurança e Defesa Civil</option>
                        <option value="Resgate Marítimo & Guarda Costeira">Resgate Marítimo</option>
                      </select>
                    </div>
                    <button
                      onClick={handleCreate911}
                      className="w-full bg-red-800 text-white font-bold py-3 rounded hover:bg-red-900 transition"
                    >
                      Acionar Emergência 911
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white border border-slate-200 rounded p-6 space-y-4">
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                    <h3 className="font-serif-authority text-lg font-bold text-red-900">
                      Ocorrências 911
                    </h3>
                    <span className="font-mono text-xs text-red-800 font-bold">
                      Tempo real
                    </span>
                  </div>
                  <div className="space-y-2.5 max-h-80 overflow-y-auto text-xs">
                    {(dashboard?.dispatches_911 || []).map((dp: any) => (
                      <div key={dp.dispatch_id} className="p-3.5 rounded bg-red-50/60 border border-red-200 space-y-1">
                        <div className="flex justify-between font-mono text-[11px] font-bold text-red-900">
                          <span>#{dp.dispatch_id} • {dp.emergency_type}</span>
                          <span>ETA: {dp.eta_minutes} min</span>
                        </div>
                        <div className="text-[#202124] font-medium">{dp.ai_protocol}</div>
                        <div className="text-[11px] text-slate-600 font-mono">
                          Distrito: {dp.district} • Status: {dp.status || 'EM DESLOCAMENTO'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 7: EMPRESAS & PASSAPORTE */}
            {activeTab === 'treasury' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded p-6 space-y-4">
                  <h3 className="font-serif-authority text-lg font-bold text-[#1a73e8] flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#1a73e8]" />
                    Registro de Empresa
                  </h3>
                  <form onSubmit={handleCreateCompany} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-[#1a73e8] mb-1">Razão Social</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: Atlântica Sistemas S.A."
                        className="w-full border border-slate-300 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1a73e8] mb-1">Setor de Atuação</label>
                      <input
                        type="text"
                        value={companySector}
                        onChange={(e) => setCompanySector(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#1a73e8] text-white font-bold py-2.5 rounded hover:bg-[#1557b0] transition"
                    >
                      Registrar empresa
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-6 bg-white border border-slate-200 rounded p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="font-serif-authority text-lg font-bold text-[#1a73e8] flex items-center gap-2">
                      <Plane className="w-5 h-5 text-[#1a73e8]" />
                      Passaporte Digital
                    </h3>
                    <button
                      onClick={handleIssuePassport}
                      className="bg-[#1a73e8] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[#1557b0]"
                    >
                      Emitir / Renovar Passaporte
                    </button>
                  </div>

                  {dossier?.passport ? (
                    <div className="p-4 rounded bg-[#001530] text-white space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-[#d2e3fc]">
                        <span>PASSAPORTE Nº: {dossier.passport.passport_number}</span>
                        <span>STATUS: {dossier.passport.passport_status}</span>
                      </div>
                      <div>VALIDADE: {dossier.passport.issue_date} ATÉ {dossier.passport.expiry_date}</div>
                      <div className="bg-black/40 p-2.5 rounded border border-white/15 text-[11px] tracking-widest overflow-x-auto">
                        <div>{dossier.passport.icao_mrz_line1}</div>
                        <div>{dossier.passport.icao_mrz_line2}</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#5f6368]">
                      Clique em <strong>Emitir / Renovar Passaporte</strong> para gerar seu documento de viagem.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* MÓDULO SETORIAL ACOPLADO */}
            {activePluggableTab && (
              <div className="space-y-6">
                <div className="bg-white rounded-md p-6 border border-[#1a73e8]/15 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-5">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded bg-[#1a73e8] text-white text-[10px] font-bold uppercase tracking-wider mb-1.5">
                        {activePluggableTab.appId}
                      </span>
                      <h3 className="text-lg font-extrabold text-[#1a73e8]">
                        {pluggableViewData?.headline?.[lang] || activePluggableTab.title[lang]}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {pluggableViewData?.summary?.[lang] || activePluggableTab.subtitle[lang]}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(pluggableViewData?.actions || []).map((act: any) => (
                        <button
                          key={act.action_id}
                          onClick={() => {
                            if (act.externalUrl) {
                              window.open(act.externalUrl, '_blank', 'noopener,noreferrer');
                            }
                            handlePluggableAction(activePluggableTab.appId, act.action_id);
                          }}
                          className="bg-[#1a73e8] text-white px-3.5 py-2 rounded text-xs font-bold hover:bg-[#1557b0] transition flex items-center gap-1.5"
                        >
                          {act.label?.[lang] || act.label?.pt || act.action_id}
                          {act.externalUrl && <ExternalLink className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {pluggableViewData?.kpis && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {pluggableViewData.kpis.map((kpi: any, idx: number) => (
                        <div key={idx} className="p-4 rounded bg-[#f4f3ef] border border-[#1a73e8]/10">
                          <div className="text-[11px] font-bold uppercase text-slate-500">
                            {kpi.label?.[lang] || kpi.label?.pt}
                          </div>
                          <div className="text-xl font-black text-[#1a73e8] mt-1">{kpi.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1a73e8]">
                      Registros ({citizen?.full_name})
                    </h4>
                    {(pluggableViewData?.records || []).map((rec: any, idx: number) => (
                      <div key={idx} className="p-4 rounded bg-[#f8f9fa] border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#1a73e8]">
                              {rec.case_number || rec.cert_id}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                              {rec.status}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-slate-900 mt-1">
                            {rec.subject || rec.cert_type}
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            {rec.court_branch || `Autenticidade: ${rec.authenticity_hash}`} • {rec.ai_conciliation_summary || `Emitido em ${rec.issued_at}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {rec.claim_amount_nva !== undefined && (
                            <div className="text-right">
                              <div className="text-xs text-slate-500">Valor da Causa</div>
                              <div className="text-sm font-extrabold text-[#1a73e8]">NVA$ {rec.claim_amount_nva}</div>
                            </div>
                          )}
                          {rec.external_url && (
                            <a
                              href={rec.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 flex items-center gap-1"
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
        )}
          </main>
        </Box>
      </div>
    </ThemeProvider>
  );
}
