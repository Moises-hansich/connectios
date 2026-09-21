import {
  LayoutDashboard,
  Laptop,
  MapPin,
  Settings,
  UserCog2Icon,
  Users,
  Wrench,
  ArrowLeftRight,
  Building2,
  type LucideIcon,
} from "lucide-react";

interface MenuItem {
  title: string;
  icon: LucideIcon;
  path: string;
  permissoes: string[];
  somenteAdmin?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    permissoes: ["dashboard.visualizar"],
  },
  {
    title: "Equipamentos",
    icon: Laptop,
    path: "/equipamentos",
    permissoes: ["equipamentos.visualizar"],
  },
  {
    title: "Localizações",
    icon: MapPin,
    path: "/localizacoes",
    permissoes: ["localizacoes.visualizar"],
  },
  {
    title: "Colaboradores",
    icon: Users,
    path: "/colaboradores",
    permissoes: ["colaboradores.visualizar"],
  },
  {
    title: "Usuários",
    icon: UserCog2Icon,
    path: "/usuarios",
    permissoes: [],
    somenteAdmin: true,
  },
  {
    title: "Configurações",
    icon: Settings,
    path: "/configuracoes",
    permissoes: ["configuracoes.visualizar", "hardware.visualizar"],
  },
  {
    title: "Manutenções",
    icon: Wrench,
    path: "/manutencoes",
    permissoes: ["manutencoes.visualizar"],
  },
  {
    title: "Histórico",
    icon: ArrowLeftRight,
    path: "/movimentacoes",
    permissoes: ["movimentacoes.visualizar"],
  },
  {
    title: "Empresas",
    icon: Building2,
    path: "/empresas",
    permissoes: ["empresas.visualizar"],
  },
];
