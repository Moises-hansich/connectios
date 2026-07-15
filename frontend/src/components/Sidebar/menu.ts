import { LayoutDashboard, Laptop, MapPin, Settings, User } from "lucide-react";

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
    title: "Usuários",
    icon: User,
    path: "/usuarios",
  },
  {
    title: "Configurações",
    icon: Settings,
    path: "/configuracoes",
  },
];
