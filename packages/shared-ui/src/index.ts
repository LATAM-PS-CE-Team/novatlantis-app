/**
 * @novatlantis/shared-ui
 * Design System Oficial: "Sovereign Civic" (Austeridade Institucional & Estado Agêntico)
 * Lema Constitucional: "NOVATLANTIS • LIBERTAS IN DIGITALI"
 */

export type SupportedLocale = 'pt-BR' | 'es-419' | 'en-US';

export interface PluggableAppKpi {
  label: string;
  value: string;
  helper?: string;
}

export interface PluggableAppAction {
  actionId: string;
  label: string;
  description: string;
}

export interface PluggableAppRecordItem {
  id: string;
  primary: string;
  secondary: string;
  detail?: string;
  status: string;
  badgeColor?: 'success' | 'warning' | 'info' | 'error' | 'default';
}

export interface PluggableAppViewPayload {
  appId: string;
  mode: 'citizen' | 'backstage';
  title: string;
  subtitle: string;
  kpis: PluggableAppKpi[];
  actions: PluggableAppAction[];
  records: PluggableAppRecordItem[];
}

export interface PluggableAppManifest {
  appId: string;
  version: string;
  owner: string;
  sector: string;
  serviceUrl?: string | null;
  landingCatalog: {
    enabled: boolean;
    icon?: string;
    badge?: string;
    title: Record<SupportedLocale, string>;
    agency: Record<SupportedLocale, string>;
    description: Record<SupportedLocale, string>;
    questionPrompt: Record<SupportedLocale, string>;
    servicePrompt: Record<SupportedLocale, string>;
  };
  agentIntegration: {
    agentId: string;
    triggerKeywords: string[];
    executeEndpoint?: string;
    requiresAuthForTransaction?: boolean;
  };
  citizenPortalTab?: {
    enabled: boolean;
    tabId: string;
    title: Record<SupportedLocale, string>;
    subtitle: Record<SupportedLocale, string>;
    uiEntryPath?: string;
    apiBasePath?: string;
  };
  backstageModule?: {
    enabled: boolean;
    moduleId: string;
    allowedRoles: string[];
    title: Record<SupportedLocale, string>;
    subtitle?: Record<SupportedLocale, string>;
    uiEntryPath?: string;
  };
}

export const NOVATLANTIS_HERALDRY = {
  motto: 'NOVATLANTIS • LIBERTAS IN DIGITALI',
  mottoTranslations: {
    'pt-BR': 'Novatlantis • Liberdade na Era Digital',
    'es-419': 'Novatlantis • Libertad en la Era Digital',
    'en-US': 'Novatlantis • Liberty in the Digital Age',
  },
  flagAssetPath: '/assets/flag-novatlantis.jpg',
  coatOfArmsAssetPath: '/assets/coat-of-arms-novatlantis.jpg',
} as const;

export const SOVEREIGN_CIVIC_DESIGN_SYSTEM = {
  name: 'Sovereign Civic',
  aestheticPhilosophy:
    'Austeridade institucional, clareza tipográfica absoluta, superfícies claras em Titanium Cool Gray (#F7F9FC) e cartões brancos puros (#FFFFFF) com bordas estruturais de 1px (#C6C6CE / #DCE3EC).',
  colors: {
    surfacePrimary: '#F7F9FC',
    surfaceCard: '#FFFFFF',
    surfaceContainerLow: '#F2F4F7',
    sovereignNavy: '#141A32',
    sovereignDeepNavy: '#0A1128',
    primaryAction: '#000000',
    administrativeBlue: '#0061A5',
    consensusTeal: '#00957F',
    consensusTealBright: '#57FBDB',
    alertErrorRed: '#BA1A1A',
    borderHairline: '#C6C6CE',
    textPrimary: '#191C1E',
    textSecondary: '#45464D',
  },
  typography: {
    headlineFont: '"Public Sans", sans-serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    monoFont: '"JetBrains Mono", monospace',
    iconFont: '"Material Symbols Outlined"',
  },
  districts: [
    'Distrito Tecnológico',
    'Distrito Oceânico',
    'Colina da Justiça',
    'Porto Solar',
    'Vale das Águas',
    'Jardins Botânicos',
  ] as const,
};

export const NOVATLANTIS_DESIGN_TOKENS = SOVEREIGN_CIVIC_DESIGN_SYSTEM;
