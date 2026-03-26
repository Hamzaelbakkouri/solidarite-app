"use client";

import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { useUser } from "@/lib/useUser";
import { MessageCircle, Inbox } from "lucide-react";

export default function MessagesPage() {
  const { user } = useUser();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 px-4 py-4 pb-20">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Messages</h2>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-4">
            <MessageCircle className="w-9 h-9 text-blue-400" />
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center -mt-8 mb-4 border-2 border-white">
            <Inbox className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-gray-600 font-medium">Aucune conversation</p>
          <p className="text-xs text-gray-400 mt-1.5 text-center max-w-[240px]">
            Vos conversations apparaitront ici apres validation d&apos;une demande par l&apos;admin
          </p>
        </div>
      </main>
      <BottomNav role={user?.role} />
    </div>
  );
}
