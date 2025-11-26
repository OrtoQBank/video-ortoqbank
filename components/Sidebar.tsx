"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Video, User, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: User, label: "Meu Perfil", href: "/" },
    { icon: BookOpen, label: "Cursos", href: "/cursos" },
    { icon: Video, label: "Vídeos", href: "/videos" },
  ];

  const bottomItems = [
    { icon: HelpCircle, label: "Suporte", href: "/suporte" },
    { icon: LogOut, label: "Logout", href: "/logout" },
  ];

  return (
    <aside className="w-[147px] h-screen bg-linear-to-b from-blue-brand to-blue-brand-dark text-white flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-4 flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shrink-0">
          
        </div>
        <h1 className="text-base font-bold whitespace-nowrap">OrtoQBank</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Button
                  variant="ghost"
                  asChild
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-2 text-white/80 hover:text-white hover:bg-white/10 h-9",
                    isActive && "bg-white/20 text-white hover:bg-white/20"
                  )}
                >
                  <Link href={item.href}>
                    <Icon size={16} />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Menu */}
      <div className="px-2 pb-4">
        <div className="border-t border-white/20 pt-3">
          <p className="text-xs text-white/60 px-3 mb-2">Usuário</p>
          <ul className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Button
                    variant="ghost"
                    asChild
                    size="sm"
                    className="w-full justify-start gap-2 text-white/80 hover:text-white hover:bg-white/10 h-8"
                  >
                    <Link href={item.href}>
                      <Icon size={16} />
                      <span className="text-xs">{item.label}</span>
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}

