import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { type ComponentType } from "react";

interface ActionButtonProps {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  variant: "blue" | "green";
}

export default function ActionButton({ href, label, icon: Icon, variant }: ActionButtonProps) {
  const styles = variant === "blue"
    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/25"
    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/25";

  return (
    <Link
      href={href}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-white font-semibold text-sm shadow-lg ${styles} transition-all duration-200 active:scale-[0.97]`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <span>{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 opacity-70" />
    </Link>
  );
}
