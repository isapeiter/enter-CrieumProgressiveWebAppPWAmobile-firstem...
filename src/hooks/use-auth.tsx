import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  EMAIL_INSTITUCIONAL_REGEX,
  MSG_EMAIL_INSTITUCIONAL,
  type Profile,
} from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  /** Restauração inicial da sessão em andamento */
  initialLoading: boolean;
  profileLoading: boolean;
  isProfessor: boolean;
  isEstagiario: boolean;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (email: string, senha: string, nome: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const tentativasRef = useRef(0);

  const carregarPerfil = useCallback((userId: string) => {
    setProfileLoading(true);
    // Chamada do cliente adiada para evitar deadlock no callback de auth
    setTimeout(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (data) {
        setProfile(data as Profile);
        setProfileLoading(false);
        tentativasRef.current = 0;
        return;
      }
      // Perfil pode levar alguns instantes para ser criado pelo trigger
      tentativasRef.current += 1;
      if (error || tentativasRef.current < 8) {
        setTimeout(() => carregarPerfil(userId), 1200);
      } else {
        setProfileLoading(false);
      }
    }, 0);
  }, []);

  useEffect(() => {
    // Registrar o listener ANTES de checar a sessão existente
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setUser(s?.user ?? null);
      setSession(s);
      if (s?.user) {
        carregarPerfil(s.user.id);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
        setSession(data.session);
        carregarPerfil(data.session.user.id);
      }
      setInitialLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [carregarPerfil]);

  const openAuthModal = useCallback(() => setAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const signIn = useCallback(async (email: string, senha: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (error) throw error;
  }, []);

  const signUp = useCallback(
    async (email: string, senha: string, nome: string) => {
      if (!EMAIL_INSTITUCIONAL_REGEX.test(email)) {
        throw new Error(MSG_EMAIL_INSTITUCIONAL);
      }
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: { full_name: nome },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    profile,
    initialLoading,
    profileLoading,
    isProfessor: profile?.papel === "professor",
    isEstagiario: profile?.papel === "estagiario",
    authModalOpen,
    openAuthModal,
    closeAuthModal,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
