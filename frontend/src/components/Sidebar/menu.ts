import {
  LayoutDashboard,
  Laptop,
  MapPin,
  Settings,
  UserCog2Icon,
  Users,
  Wrench,
} from "lucide-react";
import type { title } from "process";

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
];
