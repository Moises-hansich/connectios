import {
  LayoutDashboard,
  Laptop,
  MapPin,
  Settings,
  UserCog2Icon,
  Users,
  Wrench,
  ArrowLeftRight,
  Icon,
  Building2,
} from "lucide-react";

export const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Equipamentos",
    icon: Laptop,
    path: "/equipamentos",
  },
  {
    title: "Localizações",
    icon: MapPin,
    path: "/localizacoes",
  },
  {
    title: "Colaboradores",
    icon: Users,
    path: "/colaboradores",
  },
  {
    title: "Usuários",
    icon: UserCog2Icon,
    path: "/usuarios",
  },
  {
    title: "Configurações",
    icon: Settings,
    path: "/configuracoes",
  },
  {
    title: "Manutenções",
    icon: Wrench,
    path: "/manutencoes",
  },
  {
    title: "Historico",
    icon: ArrowLeftRight,
    path: "/movimentacoes",
  },

  {
    title: "Empresas",
    icon: Building2,
    path: "/empresas",
  },
];
