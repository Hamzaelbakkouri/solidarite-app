"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ActionButton from "@/components/ActionButton";
import {
  Heart,
  Package,
  HandHelping,
  LifeBuoy,
  Search,
  Home as HomeIcon,
  HeartHandshake,
  TrendingUp,
  CircleDollarSign,
  MapPin,
  Clock,
  Eye,
  Gift,
  Wallet,
  CheckCircle,
  Building,
  ChevronRight,
  LogIn,
  UserPlus,
} from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  role: string;
  sold?: number;
  donationsCount?: number;
  volunteerHours?: number;
  currentNeed?: string;
  activeRequests?: number;
  agentStatus?: string;
}

interface PostPreview {
  _id: string;
  type: string;
  title?: string;
  amount?: number;
  photos?: string[];
  giverName: string;
}

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null);
  const [recentPosts, setRecentPosts] = useState<PostPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/posts")
      .then((res) => (res.ok ? res.json() : { posts: [] }))
      .then((data) => setRecentPosts((data.posts || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  // ---------- UNAUTHENTICATED VIEW ----------
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          {/* Illustration area */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center mb-2">
            <HeartHandshake className="w-14 h-14 text-green-500" />
          </div>

          <h1 className="text-xl font-bold text-gray-800 text-center">
            Bienvenue sur Solidarit&eacute; Partage
          </h1>
          <p className="text-gray-500 text-center text-sm max-w-xs leading-relaxed">
            Rejoignez notre communaut&eacute; de partage et d&apos;entraide.
            Donnez, recevez, et agissez ensemble.
          </p>

          <div className="w-full flex flex-col gap-3 mt-2">
            <a
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold text-base shadow-lg shadow-green-500/25 hover:from-green-600 hover:to-green-700 transition-all active:scale-[0.97]"
            >
              <LogIn className="w-5 h-5" />
              Se Connecter
            </a>
            <a
              href="/register"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-base shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700 transition-all active:scale-[0.97]"
            >
              <UserPlus className="w-5 h-5" />
              Cr&eacute;er un Compte
            </a>
          </div>

          {/* Recent posts preview for visitors */}
          {recentPosts.length > 0 && (
            <div className="w-full mt-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Offres r&eacute;centes
              </h3>
              <div className="space-y-2">
                {recentPosts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      {post.type === "money" ? (
                        <CircleDollarSign className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Package className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {post.type === "money"
                          ? `${post.amount} \u20AC`
                          : post.title}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Par {post.giverName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  // ---------- AUTHENTICATED VIEW ----------
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 px-4 py-4 pb-20 space-y-3">
        {/* Greeting Banner */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">
              {user.name?.charAt(0)?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">
              Bonjour, {user.name}
            </p>
            <p className="text-[10px] text-gray-400">
              {user.role === "giver" && "Merci pour votre g\u00E9n\u00E9rosit\u00E9"}
              {user.role === "agent" && "Nous sommes l\u00E0 pour vous"}
              {user.role === "admin" && "Bienvenue sur le tableau de bord"}
            </p>
          </div>
        </div>

        {/* =================== GIVER HOME =================== */}
        {user.role === "giver" && (
          <>
            {/* Balance Card */}
            <div className="rounded-xl overflow-hidden shadow-lg shadow-blue-500/10">
              <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-blue-200" />
                  <p className="text-xs text-blue-200 font-medium">
                    Solde disponible
                  </p>
                </div>
                <p className="text-3xl font-bold text-white tracking-tight">
                  {user.sold?.toFixed(2) ?? "0.00"} &euro;
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <ActionButton
                href="/posts/create?type=money"
                label="Faire un Don"
                icon={Heart}
                variant="blue"
              />
              <ActionButton
                href="/posts/create?type=product"
                label="Proposer des Biens"
                icon={Package}
                variant="blue"
              />
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                Vos Contributions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-800">
                    {user.donationsCount ?? 0}
                  </p>
                  <p className="text-[10px] text-gray-500">Dons R&eacute;alis&eacute;s</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                  <Building className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-800">
                    {user.volunteerHours ?? 0}h
                  </p>
                  <p className="text-[10px] text-gray-500">Volontariat</p>
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            {recentPosts.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-blue-500" />
                  Offres R&eacute;centes
                </h3>
                <div className="space-y-2">
                  {recentPosts.slice(0, 3).map((post) => (
                    <a
                      key={post._id}
                      href="/posts"
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-50 hover:border-gray-200 hover:bg-gray-50/50 transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {post.photos && post.photos.length > 0 ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={`/api/files/${post.photos[0]}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : post.type === "money" ? (
                          <CircleDollarSign className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Package className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {post.type === "money"
                            ? `${post.amount} \u20AC`
                            : post.title}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Par {post.giverName}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* =================== AGENT HOME =================== */}
        {user.role === "agent" && (
          <>
            {/* Agent Status Banner */}
            {user.agentStatus === "pending" && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-3 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-700 leading-relaxed">
                  Votre compte est en attente de v&eacute;rification par
                  l&apos;administrateur.
                </p>
              </div>
            )}
            {user.agentStatus === "rejected" && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-3 flex items-start gap-2.5">
                <LifeBuoy className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 leading-relaxed">
                  Votre v&eacute;rification a &eacute;t&eacute; rejet&eacute;e.
                  Contactez l&apos;administrateur.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <ActionButton
                href="/posts"
                label="Demander de l'Aide"
                icon={HandHelping}
                variant="green"
              />
              <ActionButton
                href="/posts?type=product"
                label="Chercher des Dons"
                icon={Search}
                variant="green"
              />
              <ActionButton
                href="/posts?type=housing"
                label="Trouver H\u00E9bergement"
                icon={HomeIcon}
                variant="green"
              />
            </div>

            {/* Agent Stats */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                Votre Situation
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-pink-50 rounded-lg border border-pink-100">
                  <span className="flex items-center gap-2 text-xs text-gray-600">
                    <Heart className="w-4 h-4 text-pink-500" />
                    Besoin Actuel
                  </span>
                  <strong className="text-xs text-gray-800">
                    {user.currentNeed ?? "Aucun"}
                  </strong>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Demandes en Cours
                  </span>
                  <strong className="text-xs text-gray-800">
                    {user.activeRequests ?? 0}
                  </strong>
                </div>
              </div>
            </div>

            {/* Available Help */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-green-500" />
                Aide Disponible
              </h3>
              {recentPosts.length > 0 ? (
                <div className="space-y-2">
                  {recentPosts.slice(0, 3).map((post) => (
                    <a
                      key={post._id}
                      href="/posts"
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-50 hover:border-gray-200 hover:bg-gray-50/50 transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {post.photos && post.photos.length > 0 ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={`/api/files/${post.photos[0]}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : post.type === "money" ? (
                          <CircleDollarSign className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Package className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {post.type === "money"
                            ? `${post.amount} \u20AC`
                            : post.title}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Par {post.giverName}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl border border-gray-100 h-20 flex flex-col items-center justify-center">
                  <Package className="w-5 h-5 text-gray-300 mb-1" />
                  <p className="text-xs text-gray-400">
                    Aucune offre pour le moment
                  </p>
                </div>
              )}
              <a
                href="/posts"
                className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-xl font-semibold shadow-md shadow-green-500/20 transition-all active:scale-[0.97]"
              >
                <Eye className="w-3.5 h-3.5" />
                Voir toutes les Offres
              </a>
            </div>
          </>
        )}

        {/* =================== ADMIN HOME =================== */}
        {user.role === "admin" && (
          <>
            {/* Dashboard Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center mx-auto mb-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {user.donationsCount ?? 0}
                </p>
                <p className="text-[9px] text-gray-400 font-medium">Dons</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-1.5">
                  <HandHelping className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {user.activeRequests ?? 0}
                </p>
                <p className="text-[9px] text-gray-400 font-medium">
                  Demandes
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center mx-auto mb-1.5">
                  <Building className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {user.volunteerHours ?? 0}
                </p>
                <p className="text-[9px] text-gray-400 font-medium">Agents</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <ActionButton
                href="/admin"
                label="Panel Administration"
                icon={Building}
                variant="green"
              />
              <ActionButton
                href="/posts"
                label="Voir les Offres"
                icon={Eye}
                variant="blue"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-xs font-bold text-gray-700 mb-3">
                Actions rapides
              </h3>
              <div className="space-y-1">
                <a
                  href="/admin"
                  className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2.5 text-xs text-gray-600">
                    <Search className="w-4 h-4 text-green-500" />
                    Agents en attente
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </a>
                <div className="border-t border-gray-50" />
                <a
                  href="/admin"
                  className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2.5 text-xs text-gray-600">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Demandes en attente
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </a>
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNav role={user.role} />
    </div>
  );
}
