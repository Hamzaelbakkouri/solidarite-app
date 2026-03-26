"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useUser } from "@/lib/useUser";
import { Coins, Package, Camera, X, AlertCircle, PlusCircle } from "lucide-react";

function CreatePostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const defaultType = searchParams.get("type") || "money";

  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePhotos(fileList: FileList) {
    const newFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (photos.length + newFiles.length > 5) {
      setError("Maximum 5 photos");
      return;
    }
    setPhotos((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  // Only givers can create posts
  if (user && user.role !== "giver") {
    router.push("/");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body: Record<string, unknown> = { type };
    if (type === "money") {
      body.amount = parseFloat(amount);
    } else {
      body.title = title;
      body.description = description;

      // Upload photos
      if (photos.length > 0) {
        const uploadedIds: string[] = [];
        for (const photo of photos) {
          const formData = new FormData();
          formData.append("file", photo);
          const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) {
            setError(uploadData.error || "Erreur lors de l'upload");
            setLoading(false);
            return;
          }
          uploadedIds.push(uploadData.fileId);
        }
        body.images = uploadedIds;
      }
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }

    router.push("/posts");
  }

  return (
    <main className="flex-1 px-6 py-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          type === "money" ? "bg-blue-50" : "bg-green-50"
        }`}>
          {type === "money" ? (
            <Coins className="w-5 h-5 text-blue-500" />
          ) : (
            <Package className="w-5 h-5 text-green-500" />
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          {type === "money" ? "Faire un Don" : "Proposer des Biens"}
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("money")}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                type === "money"
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Coins className={`w-6 h-6 mx-auto mb-1.5 ${type === "money" ? "text-blue-500" : "text-gray-400"}`} />
              <span className="text-xs block font-semibold">Argent</span>
            </button>
            <button
              type="button"
              onClick={() => setType("product")}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                type === "product"
                  ? "border-green-500 bg-green-50 text-green-700 shadow-sm shadow-green-100"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Package className={`w-6 h-6 mx-auto mb-1.5 ${type === "product" ? "text-green-500" : "text-gray-400"}`} />
              <span className="text-xs block font-semibold">Produit</span>
            </button>
          </div>

          {type === "money" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Montant (EUR)</label>
              <div className="relative">
                <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-lg bg-gray-50 focus:bg-white transition-colors"
                  placeholder="100.00"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Ex: Table en bois, Sac de vetements..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Decrivez votre don..."
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Photos <span className="text-gray-400 font-normal">(max 5)</span>
                </label>

                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden aspect-square border border-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {photos.length < 5 && (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                    <Camera className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Ajouter des photos</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) handlePhotos(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold text-lg shadow-md shadow-green-200 hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              "Publication..."
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                Publier le Don
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function CreatePostPage() {
  const { user } = useUser();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" /></div>}>
        <CreatePostForm />
      </Suspense>
      <BottomNav role={user?.role} />
    </div>
  );
}
