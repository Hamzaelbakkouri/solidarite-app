"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import {
  Heart, HandHelping, Mail, Lock, User, AlertCircle, Upload,
  Image, FileText, X, Phone, MapPin, Calendar, Building, Briefcase,
  Clock, Wrench, CreditCard,
} from "lucide-react";

const inputClass =
  "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50 transition-colors focus:bg-white text-sm";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "giver";

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [role, setRole] = useState(defaultRole);

  // Giver fields
  const [organization, setOrganization] = useState("");

  // Agent fields
  const [cin, setCin] = useState("");
  const [availability, setAvailability] = useState("");
  const [skills, setSkills] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Upload agent documents first
    let agentDocuments: string[] = [];
    if (role === "agent") {
      if (files.length === 0) {
        setError("Veuillez ajouter au moins un document de vérification.");
        setLoading(false);
        return;
      }
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(uploadData.error || "Erreur lors de l'upload");
          setLoading(false);
          return;
        }
        agentDocuments.push(uploadData.fileId);
      }
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, email, password, role, phone, city, address, birthDate,
        agentDocuments,
        ...(role === "giver" && { organization }),
        ...(role === "agent" && { cin, availability, skills }),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur d'inscription");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex-1 px-6 py-8">
      {/* Header Icon */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4 shadow-lg shadow-green-200">
          <User className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Créer un Compte</h2>
        <p className="text-sm text-gray-400 mt-1">Rejoignez la communauté</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ===== Role Selection ===== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Je suis...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("giver")}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  role === "giver"
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <Heart className={`w-6 h-6 mx-auto mb-1.5 ${role === "giver" ? "text-blue-500" : "text-gray-400"}`} />
                <span className="text-xs font-semibold">Donateur</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("agent")}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  role === "agent"
                    ? "border-green-500 bg-green-50 text-green-700 shadow-sm shadow-green-100"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <HandHelping className={`w-6 h-6 mx-auto mb-1.5 ${role === "agent" ? "text-green-500" : "text-gray-400"}`} />
                <span className="text-xs font-semibold">Bénévole</span>
              </button>
            </div>
          </div>

          {/* ===== Section: Informations Personnelles ===== */}
          <div className="pt-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informations personnelles</p>

            <div className="space-y-3">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom complet *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Prénom et Nom" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="votre@email.com" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Min. 6 caractères" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+212 6XX XXX XXX" />
                </div>
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date de naissance</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ville *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Casablanca, Rabat, Marrakech..." />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Adresse</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50 transition-colors focus:bg-white text-sm resize-none"
                    placeholder="Adresse complète"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ===== Section: Giver-specific fields ===== */}
          {role === "giver" && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                Informations Donateur
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Organisation / Entreprise</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className={inputClass} placeholder="Nom de votre organisation (optionnel)" />
                </div>
              </div>
            </div>
          )}

          {/* ===== Section: Agent-specific fields ===== */}
          {role === "agent" && (
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <HandHelping className="w-3.5 h-3.5" />
                Informations Bénévole
              </p>

              <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-xl text-xs text-amber-700 border border-amber-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Les comptes Bénévole nécessitent une vérification par l&apos;administrateur.</span>
              </div>

              {/* CIN */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">N° CIN *</label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" required value={cin} onChange={(e) => setCin(e.target.value)} className={inputClass} placeholder="AB123456" />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Disponibilité</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Choisir...</option>
                    <option value="full-time">Temps plein</option>
                    <option value="part-time">Temps partiel</option>
                    <option value="weekends">Week-ends uniquement</option>
                    <option value="evenings">Soirs uniquement</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Compétences / Expérience</label>
                <div className="relative">
                  <Wrench className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50 transition-colors focus:bg-white text-sm resize-none"
                    placeholder="Ex: Distribution alimentaire, logistique, transport..."
                  />
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Document de vérification *
                </label>
                <p className="text-[10px] text-gray-400 mb-2">
                  CIN, passeport ou justificatif professionnel (JPG, PNG, PDF — max 5MB)
                </p>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Ajouter un fichier</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                      }
                    }}
                  />
                </label>
                {files.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 min-w-0">
                          {file.type.startsWith("image/") ? (
                            <Image className="w-4 h-4 text-blue-500 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                          )}
                          <span className="text-xs text-gray-700 truncate">{file.name}</span>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {(file.size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600 ml-2 shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold text-base shadow-md shadow-green-200 hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Inscription...
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4" />
                S&apos;inscrire
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-500 mt-5">
        Déjà un compte ?{" "}
        <a href="/login" className="text-green-600 font-semibold hover:underline">Se connecter</a>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" /></div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
