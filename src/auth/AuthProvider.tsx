import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  auth_method: string;
  current_streak: number;
  last_active_date: string;
};

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error.message);
      setProfile(null);
    } else {
      setProfile(data);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;

      if (userId) {
        await fetchProfile(userId);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    init();
    // const { data: listener } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     switch (event) {
    //       case "SIGNED_IN":
    //       case "USER_UPDATED":
    //         if (session?.user) fetchProfile(session.user.id);
    //         break;
    //       case "SIGNED_OUT":
    //         setProfile(null);
    //         break;
    //       case "TOKEN_REFRESHED":
    //         // ✅ silently update session so future queries still work
    //         if (session?.user && !profile) {
    //           // optional: only refetch if profile is missing
    //           fetchProfile(session.user.id);
    //         }
    //         break;
    //       default:
    //         break;
    //     }
    //   }
    // );

    // return () => {
    //   listener.subscription.unsubscribe();
    // };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
