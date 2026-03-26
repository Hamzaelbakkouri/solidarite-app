"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { useUser } from "@/lib/useUser";
import { Coins, Package, Inbox, User, HandHelping, ArrowRight } from "lucide-react";

interface Post {
  _id: string;
  giverName: string;
  type: string;
  status: string;
  amount?: number;
  title?: string;
  description?: string;
  photos?: string[];
  createdAt: string;
}

export default function PostsPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleRequest(postId: string) {
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erreur");
      return;
    }
    alert("Demande envoyee !");
    const updated = await fetch("/api/posts").then((r) => r.json());
    setPosts(updated.posts || []);
  }

  // Only agents can request — givers see their own posts, admin sees all
  const canRequest = user?.role === "agent";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 px-4 py-4 pb-20">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Offres Disponibles</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-4">
              <Inbox className="w-9 h-9 text-gray-300" />
            </div>
            <p className="text-gray-600 font-medium">Aucune offre disponible</p>
            <p className="text-xs text-gray-400 mt-1">Les nouvelles offres apparaitront ici</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Post Images */}
                {post.photos && post.photos.length > 0 && (
                  <div className={`grid ${post.photos.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-0.5`}>
                    {post.photos.slice(0, 4).map((photoId, i) => (
                      <div key={i} className={`relative ${post.photos!.length === 1 ? "h-44" : "h-24"} bg-gray-100`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/files/${photoId}`}
                          alt={`${post.title} - photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {i === 3 && post.photos!.length > 4 && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-semibold">
                            +{post.photos!.length - 4}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                        post.type === "money"
                          ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : "bg-green-50 text-green-600 border border-green-100"
                      }`}>
                        {post.type === "money" ? (
                          <Coins className="w-3 h-3" />
                        ) : (
                          <Package className="w-3 h-3" />
                        )}
                        {post.type === "money" ? "Argent" : "Produit"}
                      </span>
                      <h3 className="font-semibold text-gray-800 mt-2 text-base">
                        {post.type === "money" ? `${post.amount} EUR` : post.title}
                      </h3>
                      {post.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <p className="text-[11px] text-gray-400">
                          Par {post.giverName}
                        </p>
                      </div>
                    </div>
                  </div>
                  {canRequest && (
                    <button
                      onClick={() => handleRequest(post._id)}
                      className="mt-3 w-full py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all active:scale-[0.98] shadow-sm shadow-green-200 flex items-center justify-center gap-2"
                    >
                      <HandHelping className="w-4 h-4" />
                      Demander
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav role={user?.role} />
    </div>
  );
}
