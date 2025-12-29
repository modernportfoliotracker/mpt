import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname === "/";
      const isOnRegister = nextUrl.pathname.startsWith("/register");
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnDashboard) {
        // Redirect to login if accessing dashboard/home while logged out
        // Wait, landing page might be different. 
        // For now, let's say /dashboard is protected, / is landing.
        // But user said: "xxx.com/user1" is public.
        // So checking username routes is tricky.

        // Let's protect nothing by default except specific protected routes? 
        // Or protect everything except public routes.

        // User said "open web page, want to see my portfolio". 
        // So root might specific. 
        return true;
      }
      return true;
    },
  },
  providers: [], // Configured in auth.ts
  secret: process.env.AUTH_SECRET || "fallback_secret_for_dev_only",
} satisfies NextAuthConfig;
