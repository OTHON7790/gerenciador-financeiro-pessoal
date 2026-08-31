import {
  Banknote,
  Laptop,
  TrendingUp,
  PlusCircle,
  Utensils,
  Home,
  Car,
  HeartPulse,
  GraduationCap,
  Gamepad2,
  ShoppingBag,
  Repeat,
  Wallet,
  Zap,
  Droplets,
  Flame,
  Wifi,
  CreditCard,
  Scissors,
  type LucideIcon,
} from "lucide-react";

const MAPA: Record<string, LucideIcon> = {
  banknote: Banknote,
  laptop: Laptop,
  "trending-up": TrendingUp,
  "plus-circle": PlusCircle,
  utensils: Utensils,
  home: Home,
  car: Car,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  "gamepad-2": Gamepad2,
  "shopping-bag": ShoppingBag,
  repeat: Repeat,
  wallet: Wallet,
  zap: Zap,
  droplets: Droplets,
  flame: Flame,
  wifi: Wifi,
  "credit-card": CreditCard,
  scissors: Scissors,
};

export function iconeCategoria(nome: string): LucideIcon {
  return MAPA[nome] ?? Wallet;
}
