"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { ShieldAlert, ArrowRight, Lock, Mail } from "lucide-react";

interface LoginFormProps {
  callbackUrl: string | undefined;
  errorMessage?: string;
}

export default function LoginForm({
  errorMessage: initialErrorMessage,
  callbackUrl,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    initialErrorMessage
  );
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingCredentials(true);
    setErrorMessage(undefined);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: callbackUrl || "/",
      });

      if (res?.error) {
        if (
          res.error === "CredentialsSignin" ||
          res.error === "CallbackRouteError"
        ) {
          setErrorMessage("Invalid email or password.");
        } else {
          setErrorMessage("An error occurred during authentication.");
        }
      } else if (res?.ok || res?.url) {
        window.location.href = res?.url || callbackUrl || "/";
      }
    } catch {
      setErrorMessage("An error occurred during authentication.");
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setIsLoadingGoogle(true);
    setErrorMessage(undefined);
    try {
      await signIn("google", {
        callbackUrl: callbackUrl || "/",
      });
    } catch {
      setErrorMessage("An error occurred during authentication.");
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-4">
      {/* Header Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d0e12] tracking-tight">
          Sign In to Noticeboard
        </h1>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-2xl text-xs font-bold bg-red-50 text-red-600 border border-red-200 text-center flex items-center justify-center gap-2 animate-in fade-in duration-200">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Google SSO Button */}
      <div className="mb-6">
        <button
          type="button"
          disabled={isLoadingGoogle}
          onClick={handleGoogleSubmit}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 bg-white border border-[#E6E2D8] hover:border-slate-300 rounded-2xl hover:bg-slate-50 active:scale-[0.99] transition shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isLoadingGoogle ? "Connecting to Google..." : "Continue with Google"}</span>
        </button>
      </div>

      {/* OR Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E6E2D8]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
            or sign in with email
          </span>
        </div>
      </div>

      {/* Credentials Form */}
      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold text-slate-700 mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="email"
              name="email"
              type="email"
              required
              suppressHydrationWarning
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@student.nst.edu.in"
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-[#E6E2D8] bg-[#FAF9F6] text-[#0d0e12] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-bold text-slate-700 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="password"
              name="password"
              type="password"
              required
              suppressHydrationWarning
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-[#E6E2D8] bg-[#FAF9F6] text-[#0d0e12] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoadingCredentials}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#121316] hover:bg-black text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer disabled:opacity-50 shadow-md"
          >
            <span>{isLoadingCredentials ? "Authenticating..." : "Sign In to Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
