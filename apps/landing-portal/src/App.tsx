import React, { useState, useRef, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  Button,
  TextField,
  Chip,
  Grid,
  Divider,
  Alert,
  Collapse,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  Send as SendIcon,
  VerifiedUser as VerifiedUserIcon,
  Https as HttpsIcon,
  AccountBalance as AccountBalanceIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
  Mic as MicIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  LocalHospital as HealthIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  ReportProblem as UrbanIcon,
  Badge as BadgeIcon,
  AdminPanelSettings as AdminIcon,
  Close as CloseIcon,
  AutoAwesome as SparkleIcon,
  Launch as LaunchIcon,
  Language as LanguageIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import {
  TopNavUserWidget,
  SupportedLanguage,
  resolveInitialLanguage,
  DYNAMIC_PORTAL_URLS
} from './components/TopNavUserWidget';

const CITIZEN_PORTAL_URL = DYNAMIC_PORTAL_URLS.citizenPortalUrl;
const GOV_BACKSTAGE_URL = DYNAMIC_PORTAL_URLS.govBackstageUrl;

interface CitizenProfile {
  nid: string;
  full_name: string;
  email: string;
  age: number;
  gender: string;
  native_language: string;
  profession: string;
  specialty: string;
  iam_role: string;
  effective_role_code: string;
  role_title: string;
  ministry_label: string;
  backstage_allowed: boolean;
  allowed_modules: string[];
  district: string;
  tax_status: string;
  ubi_monthly_credits: number;
}

interface CitationItem {
  id: number;
  agency: string;
  title: string;
  url: string;
}

interface ServiceRequestAction {
  requires_auth: boolean;
  service_id: string;
  service_title: string;
  service_description: string;
  service_prompt: string;
  target_portal: string;
  target_tab: string;
}

interface OrchestrationStep {
  agent: string;
  step: string;
  status: string;
  latency_ms: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'orchestrator';
  text: string;
  timestamp: string;
  intent?: string;
  authenticated?: boolean;
  citations?: CitationItem[];
  service_request_action?: ServiceRequestAction | null;
  orchestration_steps?: OrchestrationStep[];
  action_card?: {
    type: string;
    title: string;
    reference_id: string;
    status: string;
    target_portal: string;
    target_url: string;
    details: Record<string, string>;
  } | null;
}

const googleMaterialTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a73e8',
      dark: '#1557b0',
      light: '#4285f4'
    },
    secondary: {
      main: '#1e8e3e'
    },
    error: {
      main: '#d93025'
    },
    warning: {
      main: '#f9ab00'
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff'
    },
    text: {
      primary: '#202124',
      secondary: '#5f6368'
    }
  },
  typography: {
    fontFamily: '"Google Sans", "Plus Jakarta Sans", "Inter", "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontFamily: '"Google Sans", "Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontFamily: '"Google Sans", "Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.015em'
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em'
    }
  },
  shape: {
    borderRadius: 12
  }
});

interface ServiceEntry {
  id: string;
  title: Record<SupportedLanguage, string>;
  agency: Record<SupportedLanguage, string>;
  description: Record<SupportedLanguage, string>;
  questionPrompt: Record<SupportedLanguage, string>;
  servicePrompt: Record<SupportedLanguage, string>;
  tab: string;
  icon: React.ReactNode;
  externalTargetUrl?: string;
  federatedSubdomain?: string;
  owner?: string;
  badge?: string;
}

const POPULAR_SERVICES: ServiceEntry[] = [
  {
    id: 'passport',
    title: {
      'pt-BR': 'Passaporte e Vistos',
      'es-419': 'Pasaporte y Visas',
      'en-US': 'Passport & Visas'
    },
    agency: {
      'pt-BR': 'Chancelaria',
      'es-419': 'Cancillería',
      'en-US': 'Chancellery'
    },
    description: {
      'pt-BR': 'Emissão, renovação e consulta de situação do passaporte.',
      'es-419': 'Emisión, renovación y consulta de estado del pasaporte.',
      'en-US': 'Issuance, renewal, and passport status lookup.'
    },
    questionPrompt: {
      'pt-BR': 'Como emitir ou renovar meu passaporte?',
      'es-419': '¿Cómo emitir o renovar mi pasaporte?',
      'en-US': 'How do I issue or renew my passport?'
    },
    servicePrompt: {
      'pt-BR': 'Emitir ou renovar meu passaporte',
      'es-419': 'Emitir o renovar mi pasaporte',
      'en-US': 'Issue or renew my passport'
    },
    tab: 'treasury',
    icon: <PublicIcon sx={{ color: '#1a73e8' }} />
  },
  {
    id: 'company',
    title: {
      'pt-BR': 'Abertura de Empresas e Benefícios',
      'es-419': 'Apertura de Empresas y Beneficios',
      'en-US': 'Business Registration & Benefits'
    },
    agency: {
      'pt-BR': 'Ministério do Tesouro',
      'es-419': 'Ministerio del Tesoro',
      'en-US': 'Ministry of the Treasury'
    },
    description: {
      'pt-BR': 'Registro de pessoa jurídica, consulta fiscal e renda básica (UBI).',
      'es-419': 'Registro de persona jurídica, consulta fiscal y renta básica (RBU).',
      'en-US': 'Business registration, tax status, and basic income (UBI).'
    },
    questionPrompt: {
      'pt-BR': 'Como abrir uma empresa e consultar benefícios fiscais?',
      'es-419': '¿Cómo abrir una empresa y consultar beneficios fiscales?',
      'en-US': 'How do I register a business and check tax benefits?'
    },
    servicePrompt: {
      'pt-BR': 'Registrar nova empresa no Ministério do Tesouro',
      'es-419': 'Registrar nueva empresa en el Ministerio del Tesoro',
      'en-US': 'Register a new business at the Ministry of the Treasury'
    },
    tab: 'treasury',
    icon: <BusinessIcon sx={{ color: '#1a73e8' }} />
  },
  {
    id: 'health',
    title: {
      'pt-BR': 'Consultas e Prontuário de Saúde',
      'es-419': 'Consultas e Historia Clínica',
      'en-US': 'Appointments & Health Records'
    },
    agency: {
      'pt-BR': 'Ministério da Saúde',
      'es-419': 'Ministerio de Salud',
      'en-US': 'Ministry of Health'
    },
    description: {
      'pt-BR': 'Agendamento de teleconsulta, carteira de vacinação e histórico clínico.',
      'es-419': 'Citas por teleconsulta, carnet de vacunación e historial clínico.',
      'en-US': 'Telehealth appointments, vaccination records, and medical history.'
    },
    questionPrompt: {
      'pt-BR': 'Como agendar uma consulta médica e acessar meu prontuário?',
      'es-419': '¿Cómo programar una consulta médica y acceder a mi historia clínica?',
      'en-US': 'How do I schedule a medical appointment and view my health record?'
    },
    servicePrompt: {
      'pt-BR': 'Agendar consulta médica',
      'es-419': 'Programar consulta médica',
      'en-US': 'Schedule a medical appointment'
    },
    tab: 'health',
    icon: <HealthIcon sx={{ color: '#1a73e8' }} />
  },
  {
    id: 'education',
    title: {
      'pt-BR': 'Boletim e Frequência Escolar',
      'es-419': 'Boletín y Asistencia Escolar',
      'en-US': 'Report Cards & Attendance'
    },
    agency: {
      'pt-BR': 'Ministério da Educação',
      'es-419': 'Ministerio de Educación',
      'en-US': 'Ministry of Education'
    },
    description: {
      'pt-BR': 'Consulta de matrículas, notas por disciplina e frequência escolar.',
      'es-419': 'Consulta de matrículas, calificaciones por materia y asistencia escolar.',
      'en-US': 'Enrollment lookup, subject grades, and school attendance.'
    },
    questionPrompt: {
      'pt-BR': 'Como consultar o boletim e a frequência escolar?',
      'es-419': '¿Cómo consultar el boletín y la asistencia escolar?',
      'en-US': 'How can I check school report cards and attendance?'
    },
    servicePrompt: {
      'pt-BR': 'Consultar boletim e frequência escolar',
      'es-419': 'Consultar boletín y asistencia escolar',
      'en-US': 'Check school report card and attendance'
    },
    tab: 'education',
    icon: <SchoolIcon sx={{ color: '#1a73e8' }} />
  },
  {
    id: 'urban_311',
    title: {
      'pt-BR': 'Zeladoria Urbana 311',
      'es-419': 'Mantenimiento Urbano 311',
      'en-US': '311 Urban Services'
    },
    agency: {
      'pt-BR': 'Secretaria de Infraestrutura Urbana',
      'es-419': 'Secretaría de Infraestructura Urbana',
      'en-US': 'Department of Urban Infrastructure'
    },
    description: {
      'pt-BR': 'Solicitações de iluminação pública, pavimentação, limpeza e reparos.',
      'es-419': 'Solicitudes de alumbrado público, pavimentación, limpieza y reparaciones.',
      'en-US': 'Street lighting, paving, sanitation, and maintenance requests.'
    },
    questionPrompt: {
      'pt-BR': 'Como abrir um chamado de manutenção urbana 311?',
      'es-419': '¿Cómo abrir un reporte de mantenimiento urbano 311?',
      'en-US': 'How do I open a 311 urban maintenance ticket?'
    },
    servicePrompt: {
      'pt-BR': 'Abrir chamado 311 de manutenção urbana',
      'es-419': 'Abrir reporte 311 de mantenimiento urbano',
      'en-US': 'Open a 311 urban maintenance ticket'
    },
    tab: 'urban_311',
    icon: <UrbanIcon sx={{ color: '#1a73e8' }} />
  },
  {
    id: 'emergency_911',
    title: {
      'pt-BR': 'Emergência 911',
      'es-419': 'Emergencia 911',
      'en-US': '911 Emergency'
    },
    agency: {
      'pt-BR': 'Central de Operações e Emergências',
      'es-419': 'Central de Operaciones y Emergencias',
      'en-US': 'Emergency Dispatch Center'
    },
    description: {
      'pt-BR': 'Acionamento de atendimento médico de urgência, defesa civil e segurança.',
      'es-419': 'Activación de atención médica de urgencia, defensa civil y seguridad.',
      'en-US': 'Emergency medical response, civil defense, and public safety dispatch.'
    },
    questionPrompt: {
      'pt-BR': 'Como funciona o acionamento de emergência 911?',
      'es-419': '¿Cómo funciona la activación de emergencia 911?',
      'en-US': 'How does 911 emergency dispatch work?'
    },
    servicePrompt: {
      'pt-BR': 'Acionar atendimento de emergência 911',
      'es-419': 'Activar atención de emergencia 911',
      'en-US': 'Trigger 911 emergency response'
    },
    tab: 'emergency_911',
    icon: <ShieldIcon sx={{ color: '#d93025' }} />
  },
  {
    id: 'identity',
    title: {
      'pt-BR': 'Identidade Digital (NID)',
      'es-419': 'Identidad Digital (NID)',
      'en-US': 'Digital Identity (NID)'
    },
    agency: {
      'pt-BR': 'Registro Civil',
      'es-419': 'Registro Civil',
      'en-US': 'Civil Registry'
    },
    description: {
      'pt-BR': 'Consulta cadastral, vínculos familiares e credenciais de acesso.',
      'es-419': 'Consulta registral, vínculos familiares y credenciales de acceso.',
      'en-US': 'Civil record lookup, family links, and access credentials.'
    },
    questionPrompt: {
      'pt-BR': 'Como consultar meus dados cadastrais e vínculos familiares?',
      'es-419': '¿Cómo consultar mis datos personales y vínculos familiares?',
      'en-US': 'How do I check my civil registration and family links?'
    },
    servicePrompt: {
      'pt-BR': 'Consultar minha carteira digital NID',
      'es-419': 'Consultar mi credencial digital NID',
      'en-US': 'Check my NID digital ID'
    },
    tab: 'identity',
    icon: <BadgeIcon sx={{ color: '#1a73e8' }} />
  }
];

const LANDING_I18N: Record<
  SupportedLanguage,
  {
    officialBanner: string;
    howToVerify: string;
    verifyTitle1: string;
    verifyDesc1: string;
    verifyTitle2: string;
    verifyDesc2: string;
    govTitle: string;
    portalBadge: string;
    govSubtitle: string;
    drawerSubtitle: string;
    drawerOfficialEnvs: string;
    citizenPortalLabel: string;
    citizenPortalSubAuth: string;
    citizenPortalSubAnon: string;
    backstageLabel: string;
    backstageSub: string;
    drawerAskConcierge: string;
    drawerLanguageTitle: string;
    heroChipAuth: string;
    heroChipAnon: string;
    heroGreetingPrefix: string;
    heroGreetingAnon: string;
    heroSubheading: string;
    promptPlaceholder: string;
    simplifyFormBtn: string;
    simplifyFormPrompt: string;
    chatStatusAuth: string;
    chatStatusAnon: string;
    askBtn: string;
    askingBtn: string;
    pills: string[];
    conciergeHeader: string;
    clearChat: string;
    officialCitations: string;
    trackInCitizenPortal: string;
    executeServiceNow: string;
    requestServiceLogin: string;
    directoryOverline: string;
    directoryHeading: string;
    askQuestionBtn: string;
    requestServiceBtn: string;
    footerSubtitle: string;
    footerRight1: string;
    footerRight2: string;
  }
> = {
  'pt-BR': {
    officialBanner: 'Site oficial do Governo de Novatlantis',
    howToVerify: 'Como verificar',
    verifyTitle1: 'Domínio oficial .gov.novatlantis.cloud',
    verifyDesc1: 'Todos os sistemas oficiais do Governo de Novatlantis utilizam este endereço.',
    verifyTitle2: 'Conexão segura (HTTPS) e acesso com NID',
    verifyDesc2: 'Consultas gerais são abertas. A identificação com NID é solicitada apenas ao iniciar um serviço.',
    govTitle: 'Governo de Novatlantis',
    portalBadge: 'Portal de Serviços',
    govSubtitle: 'Atendimento e serviços digitais',
    drawerSubtitle: 'Diretório de Serviços',
    drawerOfficialEnvs: 'PORTAIS',
    citizenPortalLabel: 'Portal do Cidadão',
    citizenPortalSubAuth: 'Conectado',
    citizenPortalSubAnon: 'Acesso com NID',
    backstageLabel: 'Backstage',
    backstageSub: 'Painel administrativo e operacional',
    drawerAskConcierge: 'SERVIÇOS RÁPIDOS',
    drawerLanguageTitle: 'IDIOMA',
    heroChipAuth: 'Sessão ativa',
    heroChipAnon: '',
    heroGreetingPrefix: 'Olá',
    heroGreetingAnon: 'Como podemos ajudar?',
    heroSubheading: 'Encontre informações e acesse serviços públicos em um só lugar.',
    promptPlaceholder: 'Busque por passaporte, consultas médicas, boletim escolar, abertura de empresa, processos ou 311...',
    simplifyFormBtn: 'Requisitos de passaporte e empresa',
    simplifyFormPrompt: 'Quais são os requisitos para emitir o passaporte e para abrir uma empresa?',
    chatStatusAuth: 'Conectado',
    chatStatusAnon: 'Consulta aberta',
    askBtn: 'Buscar',
    askingBtn: 'Consultando...',
    pills: [
      'Emitir passaporte',
      'Abrir empresa',
      'Agendar consulta',
      'Boletim escolar',
      'Zeladoria 311',
      'Tribunal de Justiça'
    ],
    conciergeHeader: 'Atendimento Digital',
    clearChat: 'Limpar',
    officialCitations: 'Referências:',
    trackInCitizenPortal: 'Abrir no Portal do Cidadão',
    executeServiceNow: 'Solicitar agora',
    requestServiceLogin: 'Entrar para solicitar',
    directoryOverline: 'CATÁLOGO DE SERVIÇOS',
    directoryHeading: 'Serviços e sistemas',
    askQuestionBtn: 'Dúvidas',
    requestServiceBtn: 'Solicitar',
    footerSubtitle: 'Portal Oficial de Serviços Públicos',
    footerRight1: 'gov.novatlantis.cloud',
    footerRight2: 'Portal do Cidadão • Backstage • Sistemas Integrados'
  },
  'es-419': {
    officialBanner: 'Sitio oficial del Gobierno de Novatlantis',
    howToVerify: 'Cómo verificarlo',
    verifyTitle1: 'Dominio oficial .gov.novatlantis.cloud',
    verifyDesc1: 'Todos los sistemas oficiales del Gobierno de Novatlantis utilizan esta dirección.',
    verifyTitle2: 'Conexión segura (HTTPS) y acceso con NID',
    verifyDesc2: 'Las consultas generales son abiertas. La identificación con NID solo se solicita al iniciar un trámite.',
    govTitle: 'Gobierno de Novatlantis',
    portalBadge: 'Portal de Servicios',
    govSubtitle: 'Atención y servicios digitales',
    drawerSubtitle: 'Directorio de Servicios',
    drawerOfficialEnvs: 'PORTALES',
    citizenPortalLabel: 'Portal del Ciudadano',
    citizenPortalSubAuth: 'Conectado',
    citizenPortalSubAnon: 'Acceso con NID',
    backstageLabel: 'Backstage',
    backstageSub: 'Panel administrativo y operativo',
    drawerAskConcierge: 'SERVICIOS RÁPIDOS',
    drawerLanguageTitle: 'IDIOMA',
    heroChipAuth: 'Sesión activa',
    heroChipAnon: '',
    heroGreetingPrefix: 'Hola',
    heroGreetingAnon: '¿Cómo podemos ayudar?',
    heroSubheading: 'Encuentre información y acceda a los servicios públicos en un solo lugar.',
    promptPlaceholder: 'Busque pasaporte, citas médicas, boletín escolar, apertura de empresa, expedientes o 311...',
    simplifyFormBtn: 'Requisitos de pasaporte y empresa',
    simplifyFormPrompt: '¿Cuáles son los requisitos para emitir el pasaporte y abrir una empresa?',
    chatStatusAuth: 'Conectado',
    chatStatusAnon: 'Consulta abierta',
    askBtn: 'Buscar',
    askingBtn: 'Consultando...',
    pills: [
      'Emitir pasaporte',
      'Abrir empresa',
      'Agendar consulta',
      'Boletín escolar',
      'Mantenimiento 311',
      'Tribunal de Justicia'
    ],
    conciergeHeader: 'Atención Digital',
    clearChat: 'Limpiar',
    officialCitations: 'Referencias:',
    trackInCitizenPortal: 'Abrir en el Portal del Ciudadano',
    executeServiceNow: 'Solicitar ahora',
    requestServiceLogin: 'Ingresar para solicitar',
    directoryOverline: 'CATÁLOGO DE SERVICIOS',
    directoryHeading: 'Servicios y sistemas',
    askQuestionBtn: 'Dudas',
    requestServiceBtn: 'Solicitar',
    footerSubtitle: 'Portal Oficial de Servicios Públicos',
    footerRight1: 'gov.novatlantis.cloud',
    footerRight2: 'Portal del Ciudadano • Backstage • Sistemas Integrados'
  },
  'en-US': {
    officialBanner: 'Official website of the Government of Novatlantis',
    howToVerify: 'How to verify',
    verifyTitle1: 'Official .gov.novatlantis.cloud domain',
    verifyDesc1: 'All official Government of Novatlantis systems use this domain.',
    verifyTitle2: 'Secure connection (HTTPS) and NID sign-in',
    verifyDesc2: 'General inquiries are open to everyone. NID sign-in is only required when submitting a service request.',
    govTitle: 'Government of Novatlantis',
    portalBadge: 'Service Portal',
    govSubtitle: 'Digital services and support',
    drawerSubtitle: 'Service Directory',
    drawerOfficialEnvs: 'PORTALS',
    citizenPortalLabel: 'Citizen Portal',
    citizenPortalSubAuth: 'Signed in',
    citizenPortalSubAnon: 'Sign in with NID',
    backstageLabel: 'Backstage',
    backstageSub: 'Administrative and operations panel',
    drawerAskConcierge: 'QUICK SERVICES',
    drawerLanguageTitle: 'LANGUAGE',
    heroChipAuth: 'Active session',
    heroChipAnon: '',
    heroGreetingPrefix: 'Hello',
    heroGreetingAnon: 'How can we help?',
    heroSubheading: 'Find information and access public services in one place.',
    promptPlaceholder: 'Search for passports, medical appointments, report cards, business registration, court cases, or 311...',
    simplifyFormBtn: 'Passport & business requirements',
    simplifyFormPrompt: 'What are the requirements to issue a passport and register a business?',
    chatStatusAuth: 'Signed in',
    chatStatusAnon: 'Public inquiry',
    askBtn: 'Search',
    askingBtn: 'Searching...',
    pills: [
      'Issue passport',
      'Register business',
      'Book appointment',
      'Report card',
      '311 maintenance',
      'Court of Justice'
    ],
    conciergeHeader: 'Digital Support',
    clearChat: 'Clear',
    officialCitations: 'References:',
    trackInCitizenPortal: 'Open in Citizen Portal',
    executeServiceNow: 'Submit request',
    requestServiceLogin: 'Sign in to request',
    directoryOverline: 'SERVICE CATALOG',
    directoryHeading: 'Services and systems',
    askQuestionBtn: 'Questions',
    requestServiceBtn: 'Request',
    footerSubtitle: 'Official Public Services Portal',
    footerRight1: 'gov.novatlantis.cloud',
    footerRight2: 'Citizen Portal • Backstage • Integrated Systems'
  }
};

export function App() {
  const [lang, setLang] = useState<SupportedLanguage>(() => resolveInitialLanguage());
  const t = LANDING_I18N[lang] || LANDING_I18N['pt-BR'];

  // IMPORTANTE: Nenhum usuário inicia logado por padrão (currentUser = null)
  const [currentUser, setCurrentUser] = useState<CitizenProfile | null>(null);
  const [ssoToken, setSsoToken] = useState<string | null>(null);
  const [govBannerOpen, setGovBannerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);

  // Trigger externo para abrir o modal de login apenas quando o usuário solicitar um serviço
  const [loginTriggerCount, setLoginTriggerCount] = useState(0);
  const [loginReasonMessage, setLoginReasonMessage] = useState<string | null>(null);
  const pendingServicePromptRef = useRef<string | null>(null);

  // Estado do Concierge AI (Sidebar Persistente à Esquerda + Prompt Box)
  const [promptInput, setPromptInput] = useState('');
  const [sidebarPromptInput, setSidebarPromptInput] = useState('');
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [pluggableServices, setPluggableServices] = useState<ServiceEntry[]>([]);
  const chatSectionRef = useRef<HTMLDivElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/v1/registry/apps')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.apps)) return;
        const dynamicEntries: ServiceEntry[] = data.apps
          .filter((a: any) => a?.landingCatalog?.enabled)
          .map((a: any) => ({
            id: a.appId,
            title: a.landingCatalog.title,
            agency: a.landingCatalog.agency,
            description: a.landingCatalog.description,
            questionPrompt: a.landingCatalog.questionPrompt,
            servicePrompt: a.landingCatalog.servicePrompt,
            tab: a.citizenPortalTab?.tabId || a.appId,
            externalTargetUrl: a.externalTargetUrl,
            federatedSubdomain: a.federatedSubdomain,
            owner: a.owner,
            badge: a.landingCatalog.badge,
            icon: <AccountBalanceIcon sx={{ color: '#1a73e8' }} />
          }));
        setPluggableServices(dynamicEntries);
      })
      .catch(() => {});
  }, []);

  const allCatalogServices = [
    ...POPULAR_SERVICES,
    ...pluggableServices.filter((ps) => !POPULAR_SERVICES.some((cs) => cs.id === ps.id))
  ];

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('novatlantis_lang', newLang);
    }
  };

  const loadFullCitizenContext = async (nidOrEmail: string): Promise<CitizenProfile | null> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: nidOrEmail })
      });
      if (!res.ok) return null;
      const data = await res.json();
      setCurrentUser(data.citizen);
      return data.citizen;
    } catch {
      return null;
    }
  };

  const sendToConcierge = async (messageText: string, explicitNid?: string | null) => {
    const cleanMsg = messageText.trim();
    if (!cleanMsg) return;

    const effectiveNid = explicitNid !== undefined ? explicitNid : currentUser?.nid || null;

    const userMsg: ChatMessage = {
      id: `USR-${Date.now()}`,
      sender: 'user',
      text: cleanMsg,
      timestamp: new Date().toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
    };

    // Ao clicar em Perguntar, muda o modo do agente para Sidebar Persistente à Esquerda
    setChatSidebarOpen(true);
    setChatMessages((prev) => [...prev, userMsg]);
    setPromptInput('');
    setSidebarPromptInput('');
    setChatLoading(true);

    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 90);

    try {
      const res = await fetch('/api/orchestrator/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nid: effectiveNid,
          message: cleanMsg,
          lang
        })
      });
      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: data.message_id || `AGT-${Date.now()}`,
        sender: 'orchestrator',
        text: data.reply || 'Orientação governamental processada.',
        timestamp: new Date().toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
        authenticated: Boolean(data.authenticated),
        citations: data.citations || [],
        service_request_action: data.service_request_action || null,
        orchestration_steps: data.orchestration_steps || [],
        action_card: data.action_card || null
      };

      setChatMessages((prev) => [...prev, agentMsg]);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    } catch {
      // ignore network error
    } finally {
      setChatLoading(false);
    }
  };

  const handleRequestService = (servicePrompt: string, serviceTitle: string) => {
    if (!currentUser) {
      pendingServicePromptRef.current = servicePrompt;
      setLoginReasonMessage(
        lang === 'es-419'
          ? `Autenticación requerida para solicitar el servicio: "${serviceTitle}". Tras ingresar con su NID, su solicitud se ejecutará automáticamente.`
          : lang === 'en-US'
          ? `Authentication required to request the service: "${serviceTitle}". After signing in with your NID, your request will be executed automatically.`
          : `Autenticação necessária para solicitar o serviço: "${serviceTitle}". Após entrar com seu NID, sua solicitação será executada automaticamente.`
      );
      setLoginTriggerCount((prev) => prev + 1);
      return;
    }

    sendToConcierge(servicePrompt, currentUser.nid);
  };

  const buildCrossPortalUrl = (baseUrl: string, tab?: string) => {
    const params = new URLSearchParams();
    if (tab) params.set('tab', tab);
    if (ssoToken) params.set('sso_token', ssoToken);
    if (lang) params.set('lang', lang);
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  };

  const handleNavigateToPortal = (targetPortal: 'citizen' | 'backstage', tab?: string) => {
    if (!currentUser) {
      setLoginReasonMessage(
        targetPortal === 'backstage'
          ? lang === 'es-419'
            ? 'Para acceder al Backstage Gubernamental, autentíquese con una credencial de Servidor Público / Identidad 360.'
            : lang === 'en-US'
            ? 'To access the Government Backstage, sign in with a Civil Servant / Identity 360 credential.'
            : 'Para acessar o Backstage Governamental, autentique-se com uma credencial de Servidor Público / Identidade 360.'
          : lang === 'es-419'
          ? 'Para acceder a sus servicios personales en el Portal del Ciudadano, inicie sesión con su NID.'
          : lang === 'en-US'
          ? 'To access your personal services in the Citizen Portal, sign in with your NID.'
          : 'Para acessar seus serviços pessoais no Portal do Cidadão, faça login com seu NID.'
      );
      setLoginTriggerCount((prev) => prev + 1);
      return;
    }
    const base = targetPortal === 'backstage' ? GOV_BACKSTAGE_URL : CITIZEN_PORTAL_URL;
    window.location.href = buildCrossPortalUrl(base, tab);
  };

  return (
    <ThemeProvider theme={googleMaterialTheme}>
      <CssBaseline />
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
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                component="img"
                src="/assets/flag.jpg"
                alt="Bandeira Oficial de Novatlantis"
                sx={{ width: 20, height: 13, objectFit: 'cover', borderRadius: 0.5, border: '1px solid #cbd5e1' }}
              />
              <Typography variant="caption" sx={{ color: '#202124', fontWeight: 600, fontSize: '0.76rem' }}>
                {t.officialBanner}
              </Typography>
              <Button
                size="small"
                onClick={() => setGovBannerOpen(!govBannerOpen)}
                endIcon={govBannerOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                sx={{
                  fontSize: '0.74rem',
                  py: 0,
                  px: 0.75,
                  minHeight: 20,
                  textTransform: 'none',
                  color: '#1a73e8',
                  fontWeight: 700,
                  textDecoration: 'underline'
                }}
              >
                {t.howToVerify}
              </Button>
            </Box>

            <Typography
              variant="caption"
              sx={{ fontFamily: 'monospace', color: '#5f6368', fontSize: '0.72rem', display: { xs: 'none', md: 'block' } }}
            >
              gov.novatlantis.cloud
            </Typography>
          </Box>

          <Collapse in={govBannerOpen}>
            <Grid container spacing={2} sx={{ pt: 1.5, pb: 1, mt: 0.5, borderTop: '1px solid #dadce0' }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <AccountBalanceIcon color="primary" fontSize="small" sx={{ mt: 0.25 }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#202124' }}>
                      {t.verifyTitle1}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.verifyDesc1}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <HttpsIcon color="success" fontSize="small" sx={{ mt: 0.25 }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#202124' }}>
                      {t.verifyTitle2}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.verifyDesc2}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Collapse>
        </Container>
      </Box>

      {/* Seção de interface Material Design 3 */}
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #dadce0'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 1.5, justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            {/* Esquerda: Botão Hambúrguer (☰) + Brasão + Título Institucional Ampliado */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={() => setNavDrawerOpen((prev) => !prev)}
                sx={{
                  border: '1px solid #d1d5db',
                  borderRadius: 2,
                  p: 1,
                  color: '#1a73e8',
                  bgcolor: navDrawerOpen ? '#e2e8f0' : '#ffffff',
                  '&:hover': { bgcolor: '#f3f4f6', borderColor: '#1a73e8' }
                }}
                aria-label="Alternar Navigation Drawer da Nação"
              >
                <MenuIcon />
              </IconButton>

              <Box
                component="img"
                src="/assets/coat_of_arms.jpg"
                alt="Brasão da República de Novatlantis"
                sx={{
                  width: { xs: 44, md: 56 },
                  height: { xs: 44, md: 56 },
                  borderRadius: 2,
                  objectFit: 'cover',
                  border: '1.5px solid #1a73e8'
                }}
              />

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: '#1a73e8',
                      fontSize: { xs: '1.15rem', sm: '1.45rem', md: '1.75rem' },
                      lineHeight: 1.15,
                      letterSpacing: '-0.02em'
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
                      fontSize: { xs: '0.7rem', md: '0.8rem' },
                      height: 26
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    color: '#5f6368',
                    fontWeight: 600,
                    fontSize: { xs: '0.78rem', sm: '0.92rem', md: '1.04rem' },
                    mt: 0.35,
                    lineHeight: 1.3
                  }}
                >
                  {t.govSubtitle}
                </Typography>
              </Box>
            </Box>

            {/* Direita: Seletor de Idiomas (PT / ES / EN) + Status do Usuário com Foto / Login NID */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TopNavUserWidget
                lang={lang}
                onLanguageChange={handleLanguageChange}
                currentNid={currentUser?.nid}
                openLoginTrigger={loginTriggerCount}
                loginReasonMessage={loginReasonMessage}
                citizenPortalUrl={CITIZEN_PORTAL_URL}
                govBackstageUrl={GOV_BACKSTAGE_URL}
                onUserAuthenticated={async (nid, _authProfile, token) => {
                  if (token) setSsoToken(token);
                  const loadedProfile = await loadFullCitizenContext(nid);
                  if (pendingServicePromptRef.current && loadedProfile) {
                    const pendingPrompt = pendingServicePromptRef.current;
                    pendingServicePromptRef.current = null;
                    setLoginReasonMessage(null);
                    sendToConcierge(pendingPrompt, loadedProfile.nid);
                  }
                }}
                onUserLoggedOut={() => {
                  setCurrentUser(null);
                  setSsoToken(null);
                  pendingServicePromptRef.current = null;
                }}
              />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* LAYOUT FLEX PRINCIPAL: NAVIGATION DRAWER PERSISTENTE (GOOGLE MATERIAL DESIGN SIDEBAR) + CONTEÚDO DA PÁGINA */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 110px)' }}>
        <Box
          component="aside"
          sx={{
            width: navDrawerOpen ? { xs: 290, sm: 340 } : 0,
            flexShrink: 0,
            bgcolor: '#f8f9fa',
            borderRight: navDrawerOpen ? '1px solid #dadce0' : 'none',
            transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowX: 'hidden',
            overflowY: navDrawerOpen ? 'auto' : 'hidden'
          }}
        >
          <Box sx={{ minWidth: 290 }}>
            <Box sx={{ p: 2.5, bgcolor: '#1a73e8', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {t.govTitle}
                </Typography>
                <Typography variant="caption" sx={{ color: '#cbd5e1', fontFamily: 'monospace' }}>
                  {t.drawerSubtitle}
                </Typography>
              </Box>
              <IconButton onClick={() => setNavDrawerOpen(false)} sx={{ color: '#ffffff' }} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Seletor de Idiomas também dentro do Navigation Drawer */}
            <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f1f3f4', borderBottom: '1px solid #dadce0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LanguageIcon sx={{ fontSize: 16, color: '#1a73e8' }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#1a73e8', letterSpacing: '0.05em' }}>
                  {t.drawerLanguageTitle}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {(
                  [
                    { code: 'pt-BR', label: 'Português' },
                    { code: 'es-419', label: 'Español' },
                    { code: 'en-US', label: 'English' }
                  ] as { code: SupportedLanguage; label: string }[]
                ).map((l) => (
                  <Button
                    key={l.code}
                    size="small"
                    variant={lang === l.code ? 'contained' : 'outlined'}
                    onClick={() => handleLanguageChange(l.code)}
                    sx={{
                      flex: 1,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      bgcolor: lang === l.code ? '#1a73e8' : '#ffffff',
                      color: lang === l.code ? '#ffffff' : '#1a73e8',
                      borderColor: '#cbd5e1'
                    }}
                  >
                    {l.label}
                  </Button>
                ))}
              </Box>
            </Box>

            <List sx={{ py: 1.5 }}>
              <Box sx={{ px: 2.5, py: 0.75 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6b7280', letterSpacing: '0.06em' }}>
                  {t.drawerOfficialEnvs}
                </Typography>
              </Box>

              <ListItemButton
                onClick={() => {
                  handleNavigateToPortal('citizen', 'identity');
                }}
              >
                <ListItemIcon>
                  <BadgeIcon sx={{ color: '#1a73e8' }} />
                </ListItemIcon>
                <ListItemText
                  primary={t.citizenPortalLabel}
                  secondary={currentUser ? `${t.citizenPortalSubAuth}: ${currentUser.nid}` : t.citizenPortalSubAnon}
                  primaryTypographyProps={{ fontWeight: 700 }}
                />
              </ListItemButton>

              <ListItemButton
                onClick={() => {
                  handleNavigateToPortal('citizen', 'urban_311');
                }}
              >
                <ListItemIcon>
                  <UrbanIcon sx={{ color: '#1a73e8' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Zeladoria Urbana 311"
                  secondary="Manutenção urbana, vias e iluminação"
                  primaryTypographyProps={{ fontWeight: 700, fontSize: '0.88rem' }}
                />
              </ListItemButton>

              <ListItemButton
                onClick={() => {
                  handleNavigateToPortal('citizen', 'emergency_911');
                }}
              >
                <ListItemIcon>
                  <ShieldIcon sx={{ color: '#d93025' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Emergência 911"
                  secondary="Atendimento de urgência e defesa civil"
                  primaryTypographyProps={{ fontWeight: 700, fontSize: '0.88rem', color: '#c5221f' }}
                />
              </ListItemButton>

              <ListItemButton
                onClick={() => {
                  handleNavigateToPortal('backstage');
                }}
              >
                <ListItemIcon>
                  <AdminIcon sx={{ color: '#1e8e3e' }} />
                </ListItemIcon>
                <ListItemText
                  primary={t.backstageLabel}
                  secondary={t.backstageSub}
                  primaryTypographyProps={{ fontWeight: 700 }}
                />
              </ListItemButton>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ px: 2.5, py: 0.75 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6b7280', letterSpacing: '0.06em' }}>
                  {t.drawerAskConcierge}
                </Typography>
              </Box>

              {POPULAR_SERVICES.map((srv) => (
                <ListItemButton
                  key={srv.id}
                  onClick={() => {
                    sendToConcierge(srv.questionPrompt[lang]);
                  }}
                >
                  <ListItemIcon>{srv.icon}</ListItemIcon>
                  <ListItemText
                    primary={srv.title[lang]}
                    secondary={srv.agency[lang]}
                    primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: '0.73rem' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Box>

        {/* SIDEBAR PERSISTENTE À ESQUERDA DO AGENTE CONCIERGE (Abre ao clicar em Perguntar e persiste durante a navegação) */}
        <Box
          component="aside"
          data-testid="agent-left-sidebar"
          sx={{
            width: chatSidebarOpen ? { xs: 340, sm: 420, md: 450 } : 0,
            flexShrink: 0,
            bgcolor: '#ffffff',
            borderRight: chatSidebarOpen ? '1.5px solid #d1d5db' : 'none',
            boxShadow: chatSidebarOpen ? '8px 0 28px rgba(60, 64, 67, 0.10)' : 'none',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 76,
            height: chatSidebarOpen ? 'calc(100vh - 76px)' : 'auto',
            alignSelf: 'flex-start',
            zIndex: 20
          }}
        >
          {chatSidebarOpen && (
            <Box sx={{ minWidth: { xs: 340, sm: 420, md: 450 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Cabeçalho Fixo da Sidebar do Agente */}
              <Box
                sx={{
                  px: 2.25,
                  py: 1.75,
                  bgcolor: '#1a73e8',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  borderBottom: '1px solid #dadce0'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedUserIcon sx={{ color: '#93c5fd', fontSize: 20 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                      {t.conciergeHeader}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '0.7rem', display: 'block' }}>
                      {lang === 'en-US'
                        ? 'Government of Novatlantis'
                        : lang === 'es-419'
                        ? 'Gobierno de Novatlantis'
                        : 'Governo de Novatlantis'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {chatMessages.length > 0 && (
                    <Button
                      size="small"
                      onClick={() => setChatMessages([])}
                      sx={{
                        textTransform: 'none',
                        color: '#e2e8f0',
                        fontSize: '0.73rem',
                        minWidth: 'auto',
                        px: 1,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' }
                      }}
                    >
                      {t.clearChat}
                    </Button>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => setChatSidebarOpen(false)}
                    sx={{ color: '#ffffff' }}
                    aria-label="Fechar barra lateral do agente"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Área de Mensagens Rolável da Sidebar à Esquerda */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2.25,
                  bgcolor: '#f8f9fa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.25
                }}
              >
                {chatMessages.map((msg) => (
                  <Box key={msg.id}>
                    {msg.sender === 'user' ? (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Paper
                          elevation={0}
                          sx={{
                            px: 2,
                            py: 1.25,
                            bgcolor: '#1a73e8',
                            color: '#ffffff',
                            borderRadius: '16px 16px 4px 16px',
                            maxWidth: '88%'
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.92rem' }}>
                            {msg.text}
                          </Typography>
                        </Paper>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: '#ffffff',
                          border: '1px solid #dadce0',
                          boxShadow: '0 4px 14px rgba(60, 64, 67, 0.06)'
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-line',
                            color: '#202124',
                            lineHeight: 1.62,
                            fontSize: '0.91rem'
                          }}
                        >
                          {msg.text}
                        </Typography>

                        {/* Citações Oficiais de Agências do Governo */}
                        {msg.citations && msg.citations.length > 0 && (
                          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #dadce0' }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 800,
                                color: '#5f6368',
                                display: 'block',
                                mb: 0.75,
                                letterSpacing: '0.04em',
                                fontSize: '0.68rem'
                              }}
                            >
                              {t.officialCitations}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                              {msg.citations.map((cit) => (
                                <Chip
                                  key={cit.id}
                                  label={`[${cit.id}] ${cit.agency}: ${cit.title}`}
                                  size="small"
                                  sx={{
                                    bgcolor: '#f3f4f6',
                                    color: '#202124',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    height: 'auto',
                                    py: 0.35,
                                    '& .MuiChip-label': { whiteSpace: 'normal' }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* Recibo Oficial de Transação Executada */}
                        {msg.action_card && (
                          <Alert
                            severity="success"
                            icon={<CheckCircleIcon fontSize="small" />}
                            sx={{ mt: 2, borderRadius: 2, border: '1px solid #86efac', bgcolor: '#f0fdf4' }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#14532d', fontSize: '0.84rem' }}>
                              {msg.action_card.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontFamily: 'monospace', display: 'block', color: '#166534', mt: 0.5, mb: 1 }}
                            >
                              Protocolo: {msg.action_card.reference_id} • {msg.action_card.status}
                            </Typography>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              endIcon={<LaunchIcon fontSize="small" />}
                              onClick={() => {
                                if (
                                  (msg.action_card?.target_portal === 'external-module') &&
                                  msg.action_card.target_url
                                ) {
                                  window.open(msg.action_card.target_url, '_blank', 'noopener,noreferrer');
                                } else {
                                  handleNavigateToPortal('citizen', msg.service_request_action?.target_tab);
                                }
                              }}
                              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}
                            >
                              {msg.action_card.target_portal === 'external-module'
                                ? 'Acessar sistema ↗'
                                : t.trackInCitizenPortal}
                            </Button>
                          </Alert>
                        )}

                        {/* Card de Solicitação de Serviço */}
                        {msg.service_request_action && !msg.action_card && (
                          <Paper
                            variant="outlined"
                            sx={{
                              mt: 2,
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: '#f8fafc',
                              borderColor: '#cbd5e1',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 1.25
                            }}
                          >
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                                {currentUser ? (
                                  <CheckCircleIcon color="success" fontSize="small" />
                                ) : (
                                  <LockIcon sx={{ color: '#b45309', fontSize: 16 }} />
                                )}
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1a73e8', fontSize: '0.83rem' }}>
                                  {msg.service_request_action.service_title}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.35 }}>
                                {msg.service_request_action.service_description}
                              </Typography>
                            </Box>

                            <Button
                              fullWidth
                              size="small"
                              variant="contained"
                              endIcon={<ArrowForwardIcon fontSize="small" />}
                              onClick={() =>
                                handleRequestService(
                                  msg.service_request_action!.service_prompt,
                                  msg.service_request_action!.service_title
                                )
                              }
                              sx={{
                                bgcolor: '#1a73e8',
                                fontWeight: 700,
                                textTransform: 'none',
                                borderRadius: 1.75,
                                py: 0.85,
                                fontSize: '0.8rem',
                                '&:hover': { bgcolor: '#1557b0' }
                              }}
                            >
                              {currentUser ? t.executeServiceNow : t.requestServiceLogin}
                            </Button>
                          </Paper>
                        )}
                      </Box>
                    )}
                  </Box>
                ))}

                {chatLoading && (
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f1f5f9', border: '1px dashed #cbd5e1' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a73e8' }}>
                      {t.askingBtn}
                    </Typography>
                  </Box>
                )}

                <Box ref={chatBottomRef} />
              </Box>

              {/* Caixa de Pergunta Persistente no Rodapé da Sidebar à Esquerda */}
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendToConcierge(sidebarPromptInput);
                }}
                sx={{
                  p: 1.75,
                  bgcolor: '#ffffff',
                  borderTop: '1px solid #dadce0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  maxRows={3}
                  value={sidebarPromptInput}
                  onChange={(e) => setSidebarPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendToConcierge(sidebarPromptInput);
                    }
                  }}
                  placeholder={t.promptPlaceholder}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#f8fafc',
                      fontSize: '0.86rem'
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {lang === 'en-US'
                      ? 'Ask in English, Español, or Português'
                      : lang === 'es-419'
                      ? 'Pregunte en Español, Português o English'
                      : 'Pergunte em Português, Español ou English'}
                  </Typography>
                  <Button
                    type="submit"
                    size="small"
                    variant="contained"
                    disabled={chatLoading || !sidebarPromptInput.trim()}
                    endIcon={<SendIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      borderRadius: 999,
                      px: 2,
                      bgcolor: '#1a73e8',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      '&:hover': { bgcolor: '#1557b0' }
                    }}
                  >
                    {chatLoading ? t.askingBtn : t.askBtn}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        <Box component="main" sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Seção de interface Material Design 3 */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 6, md: 9 },
          pb: { xs: 6, md: 8 },
          background:
            'radial-gradient(circle at 50% 0%, rgba(26, 115, 232, 0.06) 0%, rgba(248, 249, 250, 0) 70%)'
        }}
      >
        <Container maxWidth="md">
          {/* Seção de interface Material Design 3 */}
          <Box sx={{ textAlign: 'center', mb: 4.5 }}>
            {currentUser && (
              <Chip
                icon={<SparkleIcon sx={{ fontSize: '15px !important', color: '#1a73e8 !important' }} />}
                label={`${t.heroChipAuth} • ${currentUser.full_name} (${currentUser.nid})`}
                sx={{
                  mb: 2.5,
                  px: 1,
                  bgcolor: '#eef2f6',
                  color: '#1a73e8',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  border: '1px solid #cbd5e1'
                }}
              />
            )}

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' },
                color: '#202124',
                mb: 1.5,
                lineHeight: 1.12
              }}
            >
              {currentUser ? `${t.heroGreetingPrefix}, ${currentUser.full_name.split(' ')[0]}.` : t.heroGreetingAnon}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                color: '#5f6368',
                fontSize: { xs: '1.15rem', md: '1.45rem' },
                maxWidth: 680,
                mx: 'auto',
                lineHeight: 1.45
              }}
            >
              {t.heroSubheading}
            </Typography>
          </Box>

          {/* Seção de interface Material Design 3 */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 4,
              bgcolor: '#ffffff',
              border: '1.5px solid #d1d5db',
              boxShadow: '0 16px 40px -12px rgba(60, 64, 67, 0.12)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              '&:focus-within': {
                borderColor: '#1a73e8',
                boxShadow: '0 20px 48px -12px rgba(26, 115, 232, 0.18)'
              }
            }}
          >
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                sendToConcierge(promptInput);
              }}
            >
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={5}
                variant="standard"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendToConcierge(promptInput);
                  }
                }}
                placeholder={t.promptPlaceholder}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: { xs: '1.02rem', md: '1.14rem' },
                    color: '#202124',
                    lineHeight: 1.5,
                    px: 1,
                    py: 0.5
                  }
                }}
              />

              <Divider sx={{ my: 1.5, borderColor: '#f3f4f6' }} />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1
                }}
              >
                {/* Seção de interface Material Design 3 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DescriptionIcon fontSize="small" />}
                    onClick={() => sendToConcierge(t.simplifyFormPrompt)}
                    sx={{
                      borderRadius: 999,
                      textTransform: 'none',
                      borderColor: '#e5e7eb',
                      color: '#5f6368',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      px: 1.5,
                      '&:hover': { borderColor: '#1a73e8', bgcolor: '#f9fafb' }
                    }}
                  >
                    {t.simplifyFormBtn}
                  </Button>

                  <Chip
                    size="small"
                    icon={
                      currentUser ? (
                        <CheckCircleIcon sx={{ fontSize: '14px !important' }} />
                      ) : (
                        <LockOpenIcon sx={{ fontSize: '14px !important' }} />
                      )
                    }
                    label={
                      currentUser
                        ? `${t.chatStatusAuth}: ${currentUser.nid}`
                        : t.chatStatusAnon
                    }
                    color={currentUser ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ fontSize: '0.74rem', fontWeight: 600, height: 28 }}
                  />
                </Box>

                {/* Ações de Voz + Enviar */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    title="Consulta por Voz Assistida"
                    onClick={() => sendToConcierge(POPULAR_SERVICES[2].questionPrompt[lang])}
                    sx={{
                      border: '1px solid #e5e7eb',
                      color: '#5f6368',
                      '&:hover': { bgcolor: '#f3f4f6', color: '#1a73e8' }
                    }}
                  >
                    <MicIcon fontSize="small" />
                  </IconButton>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={chatLoading || !promptInput.trim()}
                    endIcon={<SendIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      borderRadius: 999,
                      px: 2.75,
                      py: 0.9,
                      bgcolor: '#1a73e8',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      '&:hover': { bgcolor: '#1557b0' }
                    }}
                  >
                    {chatLoading ? t.askingBtn : t.askBtn}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Seção de interface Material Design 3 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 1,
              mt: 2.5
            }}
          >
            {t.pills.map((pill) => (
              <Chip
                key={pill}
                label={pill}
                onClick={() => sendToConcierge(pill)}
                sx={{
                  bgcolor: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#202124',
                  fontWeight: 500,
                  fontSize: '0.82rem',
                  py: 0.5,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: '#1a73e8',
                    color: '#ffffff',
                    borderColor: '#1a73e8'
                  }
                }}
              />
            ))}
          </Box>

          {/* Indicador compacto da Barra Lateral Persistente à Esquerda */}
          <Box ref={chatSectionRef} sx={{ mt: chatMessages.length > 0 ? 2.5 : 0, textAlign: 'center' }}>
            {chatMessages.length > 0 && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<VerifiedUserIcon fontSize="small" />}
                onClick={() => setChatSidebarOpen((prev) => !prev)}
                sx={{
                  borderRadius: 999,
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: '#1a73e8',
                  color: '#1a73e8',
                  bgcolor: '#ffffff',
                  px: 2.5
                }}
              >
                {chatSidebarOpen
                  ? lang === 'en-US'
                    ? 'Hide support panel'
                    : lang === 'es-419'
                    ? 'Ocultar panel de atención'
                    : 'Ocultar painel de atendimento'
                  : lang === 'en-US'
                  ? `Open support panel (${chatMessages.length})`
                  : lang === 'es-419'
                  ? `Abrir panel de atención (${chatMessages.length})`
                  : `Abrir painel de atendimento (${chatMessages.length})`}
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Seção de interface Material Design 3 */}
      <Container maxWidth="lg" sx={{ pb: 9 }}>
        <Divider sx={{ mb: 6, borderColor: '#dadce0' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography
              variant="overline"
              sx={{ fontWeight: 800, color: '#6b7280', letterSpacing: '0.08em', display: 'block' }}
            >
              {t.directoryOverline}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a73e8', fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>
              {t.directoryHeading}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => handleNavigateToPortal('citizen', 'identity')}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderColor: '#1a73e8',
                color: '#1a73e8',
                borderRadius: 999,
                px: 2.5
              }}
            >
              {t.citizenPortalLabel}
            </Button>
            <Button
              variant="outlined"
              endIcon={<AdminIcon />}
              onClick={() => handleNavigateToPortal('backstage')}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderColor: '#cbd5e1',
                color: '#5f6368',
                borderRadius: 999,
                px: 2.5
              }}
            >
              {t.backstageLabel}
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {allCatalogServices.map((srv) => (
            <Grid item xs={12} md={4} key={srv.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  border: '1px solid #dadce0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#1a73e8',
                    boxShadow: '0 12px 28px -8px rgba(60, 64, 67, 0.12)'
                  }
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.75 }}>
                    <Box
                      sx={{
                        p: 1.1,
                        borderRadius: 2,
                        bgcolor: '#f3f4f6',
                        display: 'inline-flex'
                      }}
                    >
                      {srv.icon}
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#5f6368' }}>
                      {srv.agency[lang]}
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a73e8', mb: 1, fontSize: '1.08rem' }}>
                    {srv.title[lang]}
                  </Typography>

                  {srv.federatedSubdomain && (
                    <Box sx={{ mb: 1.25 }}>
                      <Chip
                        size="small"
                        label={`${srv.federatedSubdomain}.gov.novatlantis.cloud`}
                        sx={{
                          bgcolor: '#f8fafc',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          fontSize: '0.68rem',
                          height: 22
                        }}
                      />
                    </Box>
                  )}

                  <Typography variant="body2" sx={{ color: '#5f6368', lineHeight: 1.55, mb: 2.5 }}>
                    {srv.description[lang]}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, pt: 1.5, borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => sendToConcierge(srv.questionPrompt[lang])}
                    sx={{ textTransform: 'none', fontWeight: 700, color: '#1a73e8' }}
                  >
                    {t.askQuestionBtn}
                  </Button>
                  {srv.externalTargetUrl ? (
                    <Button
                      size="small"
                      variant="contained"
                      endIcon={<ArrowForwardIcon fontSize="small" />}
                      href={srv.externalTargetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        ml: 'auto',
                        bgcolor: '#1e8e3e',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#137333' }
                      }}
                    >
                      {lang === 'en-US' ? 'Open ↗' : lang === 'es-419' ? 'Acceder ↗' : 'Acessar ↗'}
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      endIcon={<ArrowForwardIcon fontSize="small" />}
                      onClick={() => handleRequestService(srv.servicePrompt[lang], srv.title[lang])}
                      sx={{
                        ml: 'auto',
                        bgcolor: '#1a73e8',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#1557b0' }
                      }}
                    >
                      {t.requestServiceBtn}
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Seção de interface Material Design 3 */}
      <Box sx={{ bgcolor: '#1a73e8', color: '#ffffff', py: 5, borderTop: '1px solid #dadce0' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Box
                  component="img"
                  src="/assets/coat_of_arms.jpg"
                  alt="Brasão"
                  sx={{ width: 42, height: 42, borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.3)' }}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {t.govTitle}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#cbd5e1', fontFamily: 'monospace' }}>
                    {t.footerSubtitle}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block' }}>
                {t.footerRight1}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                {t.footerRight2}
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
