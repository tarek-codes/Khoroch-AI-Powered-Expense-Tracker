'use client';

import React from 'react';
import {
  ForkKnife,
  Car,
  Bus,
  ShoppingCart,
  ShoppingBagOpen,
  FirstAid,
  Heartbeat,
  GraduationCap,
  GameController,
  FilmStrip,
  House,
  WifiHigh,
  Tote,
  Lightning,
  Tag,
  AirplaneTilt,
  Receipt,
  Bank,
  UsersThree,
  PawPrint,
  Briefcase,
  Gift,
  DotsThreeCircle,
  Coins,
  CreditCard,
  Sparkle,
} from '@phosphor-icons/react';

const iconLookup: Record<string, React.ElementType> = {
  // Food
  food: ForkKnife,
  'food&dining': ForkKnife,
  dining: ForkKnife,
  restaurant: ForkKnife,
  meal: ForkKnife,
  snacks: ForkKnife,
  খাবার: ForkKnife,
  রেস্তোরাঁ: ForkKnife,

  // Transport
  transport: Car,
  transportation: Car,
  car: Car,
  bus: Bus,
  rickshaw: Car,
  ride: Car,
  fuel: Lightning,
  যাতায়াত: Car,
  রিকশা: Car,
  বাস: Bus,

  // Housing
  housing: House,
  home: House,
  rent: House,
  apartment: House,
  maintenance: House,
  বাসস্থান: House,
  বাড়িভাড়া: House,

  // Shopping
  shopping: ShoppingBagOpen,
  'shopping-bag': ShoppingBagOpen,
  groceries: Tote,
  grocery: Tote,
  market: ShoppingCart,
  clothing: ShoppingBagOpen,
  clothes: ShoppingBagOpen,
  electronics: ShoppingBagOpen,
  কেনাকাটা: ShoppingBagOpen,
  মুদিসামগ্রী: Tote,

  // Health
  health: Heartbeat,
  healthcare: Heartbeat,
  'health&medical': Heartbeat,
  medical: FirstAid,
  medicine: FirstAid,
  doctor: FirstAid,
  'heart-pulse': Heartbeat,
  স্বাস্থ্য: Heartbeat,
  চিকিৎসা: FirstAid,
  ওষুধ: FirstAid,

  // Education
  education: GraduationCap,
  'graduation-cap': GraduationCap,
  tuition: GraduationCap,
  books: GraduationCap,
  school: GraduationCap,
  college: GraduationCap,
  university: GraduationCap,
  শিক্ষা: GraduationCap,
  টিউশন: GraduationCap,

  // Entertainment
  entertainment: GameController,
  game: GameController,
  'gamepad-2': GameController,
  games: GameController,
  movie: FilmStrip,
  movies: FilmStrip,
  cinema: FilmStrip,
  বিনোদন: GameController,
  সিনেমা: FilmStrip,

  // Travel
  travel: AirplaneTilt,
  plane: AirplaneTilt,
  flight: AirplaneTilt,
  hotel: AirplaneTilt,
  tour: AirplaneTilt,
  ভ্রমণ: AirplaneTilt,
  হোটেল: AirplaneTilt,

  // Bills & Subscriptions
  bills: Receipt,
  'bills&subscriptions': Receipt,
  bill: Receipt,
  receipt: Receipt,
  subscription: Receipt,
  subscriptions: Receipt,
  electricity: Lightning,
  utilities: Lightning,
  internet: WifiHigh,
  wifi: WifiHigh,
  recharge: WifiHigh,
  বিল: Receipt,
  বিদ্যুৎবিল: Lightning,
  ইন্টারনেটবিল: WifiHigh,

  // Financial
  financial: Bank,
  finance: Bank,
  bank: Bank,
  landmark: Bank,
  loan: Coins,
  emi: Coins,
  savings: Bank,
  dps: Bank,
  investment: Coins,
  আর্থিক: Bank,
  কিস্তি: Coins,
  সঞ্চয়: Bank,

  // Family & Personal
  family: UsersThree,
  'family&personal': UsersThree,
  personal: UsersThree,
  users: UsersThree,
  care: UsersThree,
  পরিবার: UsersThree,
  ব্যক্তিগত: UsersThree,

  // Pets
  pets: PawPrint,
  pet: PawPrint,
  'paw-print': PawPrint,
  animal: PawPrint,
  dog: PawPrint,
  cat: PawPrint,
  পোষাপ্রাণী: PawPrint,

  // Work & Business
  work: Briefcase,
  'work&business': Briefcase,
  business: Briefcase,
  office: Briefcase,
  briefcase: Briefcase,
  কাজ: Briefcase,
  ব্যবসা: Briefcase,
  অফিস: Briefcase,

  // Gifts & Donations
  gifts: Gift,
  'gifts&donations': Gift,
  gift: Gift,
  donation: Gift,
  donations: Gift,
  charity: Gift,
  zakat: Gift,
  উপহার: Gift,
  দান: Gift,
  যাকাত: Gift,

  // Other / Misc
  other: DotsThreeCircle,
  others: DotsThreeCircle,
  ellipsis: DotsThreeCircle,
  miscellaneous: DotsThreeCircle,
  misc: DotsThreeCircle,
  অন্যান্য: DotsThreeCircle,
  বিবিধ: DotsThreeCircle,
};

interface CategoryIconProps {
  name?: string;
  icon?: string;
  color?: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  icon,
  color = 'var(--text-secondary)',
  className = '',
  size = 20,
}) => {
  const clean = (s?: string) => s?.toLowerCase().replace(/[\s\-_&/]+/g, '') || '';
  const nameKey = clean(name);
  const iconKey = clean(icon);

  // Exact or partial matching
  let Icon = iconLookup[iconKey] || iconLookup[nameKey];

  if (!Icon) {
    // Search sub-key in nameKey
    const foundKey = Object.keys(iconLookup).find(
      (k) => nameKey.includes(k) || (iconKey && iconKey.includes(k))
    );
    if (foundKey) {
      Icon = iconLookup[foundKey];
    }
  }

  const FinalIcon = Icon || Tag;
  return <FinalIcon size={size} weight="bold" color={color} className={className} />;
};
