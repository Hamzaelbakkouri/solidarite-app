"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Activity, User, Shield } from "lucide-react";
import { type ComponentType } from "react";

interface Tab {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  roles: string[];
}

const tabs: Tab[] = [
  { href: "/", label: "Accueil", icon: Home, roles: [] },
  { href: "/messages", label: "Messages", icon: MessageCircle, roles: ["giver", "agent"] },
  { href: "/activities", label: "Activités", icon: Activity, roles: ["giver", "agent"] },
  { href: "/admin", label: "Admin", icon: Shield, roles: ["admin"] },
  { href: "/profile", label: "Profil", icon: User, roles: [] },
];

export default function BottomNav({ role }: { role?: string }) {
  const pathname = usePathname();

  const visibleTabs = tabs.filter(
    (tab) => tab.roles.length === 0 || (role && tab.roles.includes(role))
  );

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex justify-around items-center h-16 px-2">
        {visibleTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-green-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {isActive && (
                <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-green-500 rounded-full" />
              )}
              <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? "stroke-[2.5px]" : ""}`} />
              <span className={`text-[10px] transition-all duration-200 ${isActive ? "font-bold" : "font-medium"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
