import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { api } from "../lib/api";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "SUPER_ADMIN";
  organizationId: string;
  departmentId: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const sessionUser = sessionStorage.getItem("user");

    if (sessionUser) {
      try {
        return JSON.parse(sessionUser);
      } catch {
        sessionStorage.removeItem("user");
      }
    }

    const rememberedUser = localStorage.getItem("user");

    if (rememberedUser) {
      try {
        return JSON.parse(rememberedUser);
      } catch {
        localStorage.removeItem("user");
      }
    }

    return null;
  });

  async function login(
    email: string,
    password: string,
    rememberMe: boolean
  ) {
    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    const storage = rememberMe ? localStorage : sessionStorage;

    // Clear old authentication data from both storages
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Save according to Remember Me
    storage.setItem("token", data.token);
    storage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);
  }

  function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}
