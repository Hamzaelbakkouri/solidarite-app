"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import type { UserData } from "@/lib/useUser";
import {
  User,
  Wallet,
  CreditCard,
  Gift,
  ShieldCheck,
  Clock,
  XCircle as XCircleIcon,
  CheckCircle,
  FileText,
  Settings,
  LogOut,
  Plus,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  Building,
  Wrench,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const roleLabels: Record<string, string> = {
    giver: "Donateur",
    agent: "Benevole / Agent",
    admin: "Administrateur",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    verified: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-3 h-3" />,
    verified: <CheckCircle className="w-3 h-3" />,
    rejected: <XCircleIcon className="w-3 h-3" />,
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 px-4 py-6 pb-20">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center mb-4">
          <div className="w-18 h-18 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 w-[72px] h-[72px] shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full font-semibold border border-green-100">
            <ShieldCheck className="w-3 h-3" />
            {roleLabels[user.role] || user.role}
          </span>
        </div>

        {/* Giver Stats + Top Up */}
        {user.role === "giver" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-bold text-gray-700">Mon Portefeuille</h3>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-center shadow-md shadow-blue-200">
              <CreditCard className="w-6 h-6 text-blue-200 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{user.sold?.toFixed(2) ?? "0.00"} EUR</p>
              <p className="text-xs text-blue-200 mt-1">Solde disponible</p>
            </div>

            {/* Top Up Section */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="w-3.5 h-3.5 text-gray-500" />
                <h4 className="text-xs font-bold text-gray-600">Recharger mon solde</h4>
              </div>
              {topUpSuccess && (
                <div className="flex items-center gap-2 bg-green-50 text-green-600 text-xs p-2.5 rounded-xl mb-2 border border-green-100">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{topUpSuccess}</span>
                </div>
              )}
              <div className="flex gap-2 mb-3">
                {[10, 50, 100, 200].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTopUpAmount(String(val))}
                    className={`flex-1 py-2 text-xs rounded-lg font-semibold transition-colors ${
                      topUpAmount === String(val)
                        ? "bg-blue-500 text-white shadow-sm shadow-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {val} EUR
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={topUpAmount}
                  onChange={(e) => { setTopUpAmount(e.target.value); setTopUpSuccess(""); }}
                  placeholder="Montant..."
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                />
                <button
                  disabled={topUpLoading || !topUpAmount}
                  onClick={async () => {
                    const amount = parseFloat(topUpAmount);
                    if (!amount || amount <= 0) return;
                    setTopUpLoading(true);
                    setTopUpSuccess("");
                    const res = await fetch("/api/auth/balance", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ amount }),
                    });
                    const data = await res.json();
                    setTopUpLoading(false);
                    if (res.ok) {
                      setUser((prev) => prev ? { ...prev, sold: data.sold } : prev);
                      setTopUpAmount("");
                      setTopUpSuccess(`+${amount.toFixed(2)} EUR ajoute avec succes !`);
                    } else {
                      alert(data.error || "Erreur");
                    }
                  }}
                  className="px-5 py-2.5 bg-blue-500 text-white text-sm rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-sm shadow-blue-200"
                >
                  {topUpLoading ? "..." : "Ajouter"}
                </button>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-green-500" />
                <span>Dons realises</span>
              </div>
              <strong>{user.donationsCount ?? 0}</strong>
            </div>
          </div>
        )}

        {/* Agent Status */}
        {user.role === "agent" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-bold text-gray-700">Statut Agent</h3>
            </div>
            <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-xl p-3">
              <span className="text-sm text-gray-600">Verification</span>
              <span className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-semibold ${statusColors[user.agentStatus || "pending"]}`}>
                {statusIcons[user.agentStatus || "pending"]}
                {user.agentStatus === "verified" ? "Verifie" : user.agentStatus === "rejected" ? "Rejete" : "En attente"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
              <span>Demandes en cours</span>
              <strong className="text-green-600">{user.activeRequests ?? 0} en cours</strong>
            </div>
            <div className="flex items-start gap-2 mt-2 px-1">
              <AlertCircle className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-gray-400">
                Max 3 demandes non validees (en attente + approuvees)
              </p>
            </div>

            {/* Agent Documents */}
            {user.agentDocuments && user.agentDocuments.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                  <h4 className="text-xs font-bold text-gray-600">Mes documents de verification</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {user.agentDocuments.map((fileId, i) => (
                    <a
                      key={i}
                      href={`/api/files/${fileId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg overflow-hidden border border-gray-200 hover:border-green-400 transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/files/${fileId}`}
                        alt={`Document ${i + 1}`}
                        className="w-full h-28 object-cover bg-gray-50"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const parent = target.parentElement!;
                          const fallback = document.createElement("div");
                          fallback.className = "w-full h-28 bg-gray-50 flex flex-col items-center justify-center";
                          fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg><span class="text-[10px] text-gray-500 mt-1">PDF</span>';
                          parent.prepend(fallback);
                        }}
                      />
                      <p className="text-[10px] text-center text-green-600 font-medium py-1.5 bg-green-50">
                        Document {i + 1}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Link */}
        {user.role === "admin" && (
          <a
            href="/admin"
            className="flex items-center justify-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 hover:border-green-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Panel Administration</span>
          </a>
        )}

        <button
          onClick={handleLogout}
          className="w-full py-3 bg-white border border-red-200 text-red-500 rounded-xl font-semibold shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Se Deconnecter
        </button>
      </main>
      <BottomNav role={user?.role} />
    </div>
  );
}
