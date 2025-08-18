import { clearServerAuthCookies } from "@/lib/cookies";
import { DummyLoginResponse, User } from "@/types";
import { redirect } from "next/navigation";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (userData: DummyLoginResponse) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (userData: DummyLoginResponse) => {
        const user: User = {
          id: userData.id.toString(),
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          avatar: userData.image,
          role: "user", // Default role, can be adjusted based on API response
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
        };
        set({ user });
        set({
          user,
          token: userData.accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: async () => {
        set(initialState);
        await clearServerAuthCookies();
        redirect("/login");
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearAuth: () => {
        set(initialState);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
