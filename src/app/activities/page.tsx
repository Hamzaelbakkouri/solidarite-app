"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { useUser } from "@/lib/useUser";
import { FileText, Send, CheckCircle, XCircle, PartyPopper, ShieldCheck, ClipboardList, Pin } from "lucide-react";

interface Activity {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; borderColor: string }> = {
  donation_posted: {
    icon: <FileText className="w-5 h-5 text-blue-500" />,
    color: "bg-blue-50",
    borderColor: "border-l-blue-500",
  },
  request_made: {
    icon: <Send className="w-5 h-5 text-amber-500" />,
    color: "bg-amber-50",
    borderColor: "border-l-amber-500",
  },
  request_approved: {
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    color: "bg-green-50",
    borderColor: "border-l-green-500",
  },
  request_rejected: {
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    color: "bg-red-50",
    borderColor: "border-l-red-500",
  },
  donation_completed: {
    icon: <PartyPopper className="w-5 h-5 text-purple-500" />,
    color: "bg-purple-50",
    borderColor: "border-l-purple-500",
  },
  agent_verified: {
    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    color: "bg-emerald-50",
    borderColor: "border-l-emerald-500",
  },
};

const defaultConfig = {
  icon: <Pin className="w-5 h-5 text-gray-500" />,
  color: "bg-gray-50",
  borderColor: "border-l-gray-400",
};

export default function ActivitiesPage() {
  const { user } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activities")
      .then((res) => (res.ok ? res.json() : { activities: [] }))
      .then((data) => {
        setActivities(data.activities || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 px-4 py-4 pb-20">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Activites</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-4">
              <ClipboardList className="w-9 h-9 text-gray-300" />
            </div>
            <p className="text-gray-600 font-medium">Aucune activite</p>
            <p className="text-xs text-gray-400 mt-1">Vos activites apparaitront ici</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activities.map((a) => {
              const config = typeConfig[a.type] || defaultConfig;
              return (
                <div
                  key={a._id}
                  className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${config.borderColor} p-3.5 flex items-start gap-3`}
                >
                  <div className={`w-9 h-9 rounded-lg ${config.color} flex items-center justify-center shrink-0`}>
                    {config.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800 leading-snug">{a.description}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      {new Date(a.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav role={user?.role} />
    </div>
  );
}
