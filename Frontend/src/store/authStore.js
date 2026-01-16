import { create } from "zustand";
import { persist } from "zustand/middleware";


export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async () => {
        try {
          set({ isLoading: true, error: null });

          const res = await fetch('http://localhost:4000/api/me', {
            method: 'GET',
            credentials: 'include' // important to send cookies
            });

          if (!res.ok) throw new Error("Invalid credentials");

          const data = await res.json();

          console.log("inside the store",data.user);

          set({
            user: data.user,
           // token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
            
          set({
            error: err.message,
            isLoading: false,
          });
          console.log(err);
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });

        console.log("user logged out from store");
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);
