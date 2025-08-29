import { UnidadesIcon, TrabajadoresIcon, OrdenesEntregaIcon, RecursosHumanosIcon, BoletasIcon } from '../components/Icons';

export interface NavigationSectionConfig {
  title: string;
  description: string;
  href: string;
  linkText: string;
  icon: React.ReactNode;
}

export const navigationSections: Record<string, NavigationSectionConfig> = {
  unidades: {
    title: 'Gestión de Unidades',
    description: 'Administra las unidades organizacionales',
    href: '/unidades',
    linkText: 'Ir a la página de Unidades',
    icon: <UnidadesIcon />
  },
  trabajadores: {
    title: 'Gestión de Trabajadores',
    description: 'Administra el personal de la empresa',
    href: '/trabajadores',
    linkText: 'Ir a la página de Trabajadores',
    icon: <TrabajadoresIcon />
  },
  'ordenes-entrega': {
    title: 'Órdenes de Entrega',
    description: 'Gestiona las solicitudes de entrega de productos',
    href: '/ordenes-entrega',
    linkText: 'Ir a la página de Órdenes de Entrega',
    icon: <OrdenesEntregaIcon />
  },
  recursoshumanos: {
    title: 'Recursos Humanos',
    description: 'Gestión y administración del personal de la empresa',
    href: '/recursoshumanos',
    linkText: 'Ir a la página de Recursos Humanos',
    icon: <RecursosHumanosIcon />
  },
  boletas: {
    title: 'Vista de Boletas',
    description: 'Visualiza e imprime órdenes de entrega y traslados en formato de boleta',
    href: '/boletas',
    linkText: 'Ir a la vista de Boletas',
    icon: <BoletasIcon />
  }
};