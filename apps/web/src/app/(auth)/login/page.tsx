"use client";

import { useState, useEffect } from "react";
import { useCurrentUser, useSignIn, useSignUp, useSignOut } from "@/hooks";
import { Loader2, Mail, Lock, ArrowRight, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const signIn = useSignIn();
  const signUp = useSignUp();
  const signOut = useSignOut();
  const { isAuthenticated, isLoading, role } = useCurrentUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [showMotherError, setShowMotherError] = useState(false);

  // Handle mother role detection and auto sign-out
  useEffect(() => {
    if (!isLoading && isAuthenticated && role === "mother") {
      setShowMotherError(true);
      // Auto sign out after delay
      const timer = setTimeout(async () => {
        await signOut();
        setShowMotherError(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, role, signOut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "signIn") {
        await signIn({ email, password });
      } else {
        await signUp({ email, password, fullName });
      }
      // After successful auth, keep isSubmitting true - the layout will handle redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setIsSubmitting(false);
    }
  };

  // Show mother error screen
  if (showMotherError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-8">
        <div className="max-w-md w-full rounded-2xl bg-[var(--background-white)] border border-[var(--border)] p-8 shadow-sm text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--primary)] mb-3">
            Web Portal Access Restricted
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            The web portal is for healthcare providers only. Please use the{" "}
            <span className="font-medium text-[var(--primary)]">MaternaMD mobile app</span>{" "}
            to access your health records and track your pregnancy journey.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Signing you out automatically...
          </p>
          <button
            onClick={async () => {
              await signOut();
              setShowMotherError(false);
            }}
            className="mt-6 w-full rounded-xl bg-[var(--primary)] px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-[var(--primary-light)]"
          >
            Sign Out Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between bg-[var(--primary)] p-12">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">MaternaMD</h1>
          <p className="text-xs text-white/60">Digital Mother&apos;s Book</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-light text-white leading-tight">
            Healthcare Provider<br />
            <span className="font-semibold">Portal</span>
          </h2>
          <p className="text-lg text-white/70 max-w-md">
            Manage patient records, track maternal health, and coordinate care with your patients seamlessly.
          </p>

          {/* Feature highlights */}
          <div className="grid gap-4 pt-4">
            {[
              "Patient records management",
              "Prenatal visit tracking",
              "Lab requests & results",
              "Medication prescriptions",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                  <div className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                </div>
                <span className="text-white/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/40">
          &copy; 2024 MaternaMD. All rights reserved.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-2xl font-semibold text-[var(--primary)]">MaternaMD</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Healthcare Provider Portal</p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl bg-[var(--background-white)] border border-[var(--border)] p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[var(--primary)]">
                {mode === "signIn" ? "Welcome back" : "Create account"}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {mode === "signIn"
                  ? "Sign in to access your account"
                  : "Sign up to get started"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signUp" && (
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-3.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                    placeholder="Juan Dela Cruz"
                    required={mode === "signUp"}
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Mail className="h-5 w-5 text-[var(--text-muted)]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl bg-[var(--background)] border border-[var(--border)] pl-12 pr-4 py-3.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Lock className="h-5 w-5 text-[var(--text-muted)]" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl bg-[var(--background)] border border-[var(--border)] pl-12 pr-4 py-3.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-[var(--primary-light)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {mode === "signIn" ? "Sign In" : "Create Account"}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signIn" ? "signUp" : "signIn");
                  setError("");
                }}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
              >
                {mode === "signIn"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <span className="text-[var(--primary)] font-medium">
                  {mode === "signIn" ? "Sign up" : "Sign in"}
                </span>
              </button>
            </div>
          </div>

          {/* Info hint */}
          <div className="mt-6 rounded-xl bg-[var(--background-white)] border border-[var(--border)] p-4 shadow-sm">
            <p className="text-xs text-[var(--text-muted)] text-center">
              This portal is for healthcare providers. Patients should use the mobile app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
