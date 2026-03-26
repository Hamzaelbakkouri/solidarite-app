"use client";

import { useEffect, useState } from "react";

export interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  city?: string;
  address?: string;
  birthDate?: string;
  // Giver
  sold?: number;
  donationsCount?: number;
  organization?: string;
  // Agent
  agentStatus?: string;
  agentDocuments?: string[];
  activeRequests?: number;
  currentNeed?: string;
  volunteerHours?: number;
  availability?: string;
  skills?: string;
  cin?: string;
}

export function useUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { user, setUser, loading };
}
