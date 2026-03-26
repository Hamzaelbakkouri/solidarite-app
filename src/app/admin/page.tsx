"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import {
  Settings,
  Users,
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Coins,
  Package,
  ShieldCheck,
  ShieldX,
  UserCheck,
  Inbox,
} from "lucide-react";

interface Agent {
  _id: string;
  name: string;
  email: string;
  agentStatus: string;
  agentDocuments?: string[];
}

interface PendingRequest {
  _id: string;
  agentName: string;
  giverName: string;
  postType: string;
  amount?: number;
  productTitle?: string;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"agents" | "requests">("agents");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/agents").then((r) => (r.ok ? r.json() : { agents: [] })),
      fetch("/api/requests").then((r) => (r.ok ? r.json() : { requests: [] })),
    ]).then(([agentData, requestData]) => {
      setAgents(agentData.agents || []);
      setRequests(requestData.requests || []);
      setLoading(false);
    });
  }, []);

  async function handleVerifyAgent(id: string, action: "verify" | "reject") {
    await fetch(`/api/admin/agents/${id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setAgents((prev) =>
      prev.map((a) =>
        a._id === id ? { ...a, agentStatus: action === "verify" ? "verified" : "rejected" } : a
      )
    );
  }

  async function handleValidateRequest(id: string, action: "approve" | "reject") {
    const res = await fetch(`/api/requests/${id}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setRequests((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, status: action === "approve" ? "approved" : "rejected" } : r
        )
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  const pendingAgentsCount = agents.filter((a) => a.agentStatus === "pending").length;
  const pendingRequestsCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 px-4 py-4 pb-20">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-800">Administration</h2>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{pendingAgentsCount}</p>
            <p className="text-[11px] text-gray-500">Agents en attente</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{pendingRequestsCount}</p>
            <p className="text-[11px] text-gray-500">Demandes en attente</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
          <button
            onClick={() => setTab("agents")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm rounded-lg font-semibold transition-all ${
              tab === "agents"
                ? "bg-green-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Agents ({pendingAgentsCount})
          </button>
          <button
            onClick={() => setTab("requests")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm rounded-lg font-semibold transition-all ${
              tab === "requests"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Demandes ({pendingRequestsCount})
          </button>
        </div>

        {tab === "agents" && (
          <div className="space-y-3">
            {agents.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Inbox className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">Aucun agent inscrit</p>
              </div>
            ) : (
              agents.map((agent) => (
                <div key={agent._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{agent.name}</p>
                        <p className="text-xs text-gray-500">{agent.email}</p>
                      </div>
                    </div>
                    <span
                      className={`flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-full font-semibold ${
                        agent.agentStatus === "verified"
                          ? "bg-green-100 text-green-700"
                          : agent.agentStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {agent.agentStatus === "verified" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : agent.agentStatus === "rejected" ? (
                        <XCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {agent.agentStatus === "verified" ? "Verifie" : agent.agentStatus === "rejected" ? "Rejete" : "En attente"}
                    </span>
                  </div>
                  {/* Documents Preview */}
                  {agent.agentDocuments && agent.agentDocuments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 mb-2">
                        <FileText className="w-3 h-3 text-gray-400" />
                        <p className="text-[10px] text-gray-500 font-semibold">Documents de verification ({agent.agentDocuments.length})</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {agent.agentDocuments.map((fileId, i) => (
                          <a
                            key={i}
                            href={`/api/files/${fileId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors"
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
                            <p className="text-[10px] text-center text-blue-600 font-medium py-1.5 bg-blue-50">
                              Document {i + 1}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {agent.agentStatus === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleVerifyAgent(agent._id, "verify")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 text-white text-xs rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Valider
                      </button>
                      <button
                        onClick={() => handleVerifyAgent(agent._id, "reject")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500 text-white text-xs rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <ShieldX className="w-3.5 h-3.5" />
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === "requests" && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Inbox className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">Aucune demande</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {req.postType === "money" ? (
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Coins className="w-4 h-4 text-blue-500" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                          <Package className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                      <span className="text-sm font-semibold text-gray-800">
                        {req.postType === "money" ? `${req.amount} EUR` : req.productTitle}
                      </span>
                    </div>
                    <span
                      className={`flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-full font-semibold ${
                        req.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : req.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {req.status === "approved" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : req.status === "rejected" ? (
                        <XCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {req.status === "approved" ? "Approuve" : req.status === "rejected" ? "Rejete" : "En attente"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 ml-10">
                    Agent: {req.agentName} &rarr; Donateur: {req.giverName}
                  </p>
                  {req.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleValidateRequest(req._id, "approve")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 text-white text-xs rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approuver
                      </button>
                      <button
                        onClick={() => handleValidateRequest(req._id, "reject")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500 text-white text-xs rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
      <BottomNav role="admin" />
    </div>
  );
}
