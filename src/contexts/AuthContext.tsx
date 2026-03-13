import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthActionResponse {
  error: Error | null;
}

interface SignUpResponse extends AuthActionResponse {
  emailAlreadyRegistered: boolean;
  needsEmailVerification: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<SignUpResponse>;
  signIn: (email: string, password: string) => Promise<AuthActionResponse>;
  resendVerification: (email: string) => Promise<AuthActionResponse>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Safety net: never let the app hang indefinitely on auth loading.
    const fallback = window.setTimeout(() => {
      if (!isMounted) return;
      console.warn("Auth loading fallback triggered (getSession/onAuthStateChange may have stalled)");
      setLoading(false);
    }, 4000);

    let subscription: { unsubscribe: () => void } | null = null;

    try {
      // Set up auth state listener FIRST
      const sub = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!isMounted) return;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);
      });
      subscription = sub.data.subscription;
    } catch (e) {
      console.error("Failed to initialize auth state listener:", e);
      setLoading(false);
    }

    // THEN check for existing session
    supabase.auth
      .getSession()
      .then(({ data: { session: existingSession } }) => {
        if (!isMounted) return;
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to get auth session:", e);
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
      window.clearTimeout(fallback);
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string): Promise<SignUpResponse> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return {
        error: error as Error,
        emailAlreadyRegistered: false,
        needsEmailVerification: false,
      };
    }

    const emailAlreadyRegistered = (data.user?.identities?.length ?? 0) === 0;
    const needsEmailVerification = !data.session && !emailAlreadyRegistered;

    return {
      error: null,
      emailAlreadyRegistered,
      needsEmailVerification,
    };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const resendVerification = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, resendVerification, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
