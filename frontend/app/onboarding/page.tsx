'use client';

import { useState, useEffect, useRef } from "react";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import GradualBlur from "@/components/GradualBlur";
import { ArrowLeft, UserPlus, ShieldAlert, Key, Mail, Lock, User, Sparkles, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";

type FlowState = "SELECT" | "NEW_USER" | "OTP_VERIFY" | "EXISTING_CLIENT";

export default function Onboarding() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Navigation Flow State
  const [flow, setFlow] = useState<FlowState>("SELECT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [panNumber, setPanNumber] = useState("");

  const [otpSentMsg, setOtpSentMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  // Admins sign in with a password by default and can fall back to an email OTP
  const [adminMode, setAdminMode] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [isUserLogin, setIsUserLogin] = useState(false);
  // Client passwordless login state
  const [clientStep, setClientStep] = useState<"EMAIL" | "OTP_VERIFY" | "ACCOUNT_SELECT" | "PAN_VERIFY">("EMAIL");
  const [clientEmail, setClientEmail] = useState("");
  const [clientOtp, setClientOtp] = useState("");
  const [clientSuccessMsg, setClientSuccessMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [clientAccounts, setClientAccounts] = useState<any[]>([]);
  const [clientTempToken, setClientTempToken] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [enteredPan, setEnteredPan] = useState("");
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const setAuthSession = (token: string, user: any, remember: boolean) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    const expiry = remember ? `max-age=${30 * 24 * 60 * 60}` : ""; // 30 days or session cookie
    document.cookie = `token=${token}; path=/; ${expiry}; SameSite=Lax; Secure`;
    document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; ${expiry}; SameSite=Lax; Secure`;
  };
  // Mount animation & query param parsing
  useEffect(() => {
    document.title = "Book a Call | FinAnalysis - Arijit De";
    
    // Parse query parameters to direct the user flow
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlFlow = params.get("flow");
      if (urlFlow === "login" || urlFlow === "existing") {
        setFlow("EXISTING_CLIENT");
      } else if (urlFlow === "new" || urlFlow === "signup") {
        setFlow("NEW_USER");
      }
    }

    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Load Google GSI Script dynamically for Google Sign-In
  useEffect(() => {
    if (flow === "NEW_USER" || flow === "EXISTING_CLIENT") {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');

      const renderBtn = () => {
        if (typeof window !== "undefined" && (window as any).google) {
          initializeGoogleSignIn();
        } else {
          const interval = setInterval(() => {
            if (typeof window !== "undefined" && (window as any).google) {
              initializeGoogleSignIn();
              clearInterval(interval);
            }
          }, 100);
          return () => clearInterval(interval);
        }
      };

      let cleanupInterval: (() => void) | undefined;

      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          cleanupInterval = renderBtn();
        };
        document.body.appendChild(script);
      } else {
        const timer = setTimeout(() => {
          cleanupInterval = renderBtn();
        }, 50);
        return () => {
          clearTimeout(timer);
          if (cleanupInterval) cleanupInterval();
        };
      }

      return () => {
        if (cleanupInterval) cleanupInterval();
      };
    }
  }, [flow]);

  const initializeGoogleSignIn = () => {
    if (typeof window !== "undefined" && (window as any).google) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleLoginSuccess,
        });

        const newUserBtn = document.getElementById("google-signin-button");
        if (newUserBtn) {
          (window as any).google.accounts.id.renderButton(
            newUserBtn,
            {
              theme: "dark",
              size: "large",
              width: "100%",
              text: "signup_with",
              shape: "pill"
            }
          );
        }

        const clientBtn = document.getElementById("google-signin-button-client");
        if (clientBtn) {
          (window as any).google.accounts.id.renderButton(
            clientBtn,
            {
              theme: "dark",
              size: "large",
              width: "100%",
              text: "signin_with",
              shape: "pill"
            }
          );
        }
      } catch (err) {
        console.error("Failed to initialize Google Sign In: ", err);
      }
    }
  };

  const handleGoogleLoginSuccess = async (response: any) => {
    setLoading(true);
    setError(null);
    const idToken = response.credential;

    try {
      const res = await fetch(`${backendUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.data.requiresSelection) {
          setClientAccounts(data.data.accounts || []);
          setClientTempToken(data.data.tempToken || "");
          setClientEmail(data.data.email || "");
          setClientStep("ACCOUNT_SELECT");
          setFlow("EXISTING_CLIENT");
          setLoading(false);
          return;
        }
        // Save token and user details to cookies/localStorage
        setAuthSession(data.data.token, data.data.user, true);

        // Redirect dynamically based on user role
        if (data.data.user?.role === "ADMIN") {
          window.location.href = "/dashboard/admin";
        } else if (data.data.user?.role === "CLIENT") {
          window.location.href = "/dashboard/client";
        } else {
          window.location.href = "/dashboard/user";
        }
      } else {
        setError(data.error || "Google Authentication failed");
        setLoading(false);
      }
    } catch (err) {
      setError("Unable to reach authentication server");
      setLoading(false);
    }
  };

  // Submit Send OTP (New User Flow)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Admin password sign-in is handled by its own endpoint
    if (isAdminLogin && adminMode === "PASSWORD") {
      if (!email || !password) {
        setError("Please enter your administrator email and password.");
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const res = await fetch(`${backendUrl}/api/auth/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (data.success) {
          setAuthSession(data.data.token, {
            ...data.data.user,
            name: data.data.user.name || "Administrator",
          }, rememberMe);
          window.location.href = "/dashboard/admin";
          return;
        }

        setError(data.error || "Invalid administrator email or password.");
      } catch (err) {
        setError("Unable to connect to authentication server. Is the backend running?");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Admin OTP fallback only requires email, normal signup requires name/email/password
    if (isAdminLogin) {
      if (!email) {
        setError("Please enter your administrator email address.");
        return;
      }
    } else {
      if (!name || !email || !password) {
        setError("Please fill in all registration fields.");
        return;
      }
    }

    setError(null);
    setLoading(true);

    try {
      // Step 1: Call endpoint to send OTP
      const res = await fetch(`${backendUrl}/api/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          isRegistration: !isUserLogin && !isAdminLogin
        }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpSentMsg(`Verification OTP has been sent to ${email}`);
        setFlow("OTP_VERIFY");
      } else {
        setError(data.error || "Failed to send verification email");
      }
    } catch (err) {
      setError("Unable to connect to authentication server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP (New User Flow)
  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Step 2: Call endpoint to verify OTP
      const res = await fetch(`${backendUrl}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          name: (!isUserLogin && !isAdminLogin) ? name : undefined,
          password: (!isUserLogin && !isAdminLogin) ? password : undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Save registration details in cookies/localStorage
        setAuthSession(data.data.token, {
          ...data.data.user,
          name: isAdminLogin ? (data.data.user.name || "Administrator") : name // Use custom name provided in form or default to admin
        }, rememberMe);

        // Redirect dynamically based on user role
        if (data.data.user?.role === "ADMIN") {
          window.location.href = "/dashboard/admin";
        } else {
          window.location.href = "/dashboard/user";
        }
      } else {
        setError(data.error || "Incorrect or expired OTP verification code");
      }
    } catch (err) {
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Client Passwordless Login – Send OTP
  const handleClientSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = clientEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setError(null);
    setClientSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/client/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();

      if (data.success) {
        setClientSuccessMsg(`Verification code sent to ${trimmedEmail}`);
        setClientStep('OTP_VERIFY');
      } else {
        setError(data.error || "Failed to send verification code.");
      }
    } catch (err) {
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Client Passwordless Login – Verify OTP
  const handleClientVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = clientEmail.trim().toLowerCase();
    const trimmedOtp = clientOtp.trim();

    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }

    setError(null);
    setClientSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/client/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, otp: trimmedOtp }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setClientAccounts(data.data.accounts || []);
        setClientTempToken(data.data.tempToken || "");
        setClientStep("ACCOUNT_SELECT");
      } else {
        setError(data.error || "Verification failed. Please try again.");
      }
    } catch (err) {
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Client Passwordless Login – Verify PAN
  const handleClientPanVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPan = enteredPan.trim().toUpperCase();

    if (!trimmedPan || trimmedPan.length !== 10) {
      setError("Please enter a valid 10-character PAN number.");
      return;
    }

    setError(null);
    setClientSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/client/pan/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempToken: clientTempToken,
          accountId: selectedAccount.id,
          pan: trimmedPan,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAuthSession(data.data.token, data.data.user, rememberMe);
        window.location.href = "/dashboard/client";
      } else {
        setError(data.error || "PAN verification failed. Please check the number and try again.");
      }
    } catch (err) {
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-transparent text-foreground flex flex-col font-clash">
      {/* Fixed Background container with User's Gradient Theme */}
      <div className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none">
        <SoftBoxBlurBg />
      </div>

      {/* Reusable Navbar */}
      <Navbar isLoaded={isLoaded} activePath="/onboarding" />

      {/* Main Form/Content Section */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 pt-36 pb-24 max-w-5xl mx-auto w-full">

        {/* Back Button */}
        {flow !== "SELECT" && (
          <button
            onClick={() => {
              setFlow("SELECT");
              setError(null);
              setOtp("");
              setIsAdminLogin(false);
              setAdminMode("PASSWORD");
              setPassword("");
            }}
            className="self-start flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary mb-8 transition-colors duration-200 bg-white/30 border border-white/30 backdrop-blur-xl rounded-xl px-4 py-2 hover:bg-white/50 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Selection
          </button>
        )}

        {/* 1. SELECT FLOW */}
        {flow === "SELECT" && (
          <div
            className={`w-full text-center flex flex-col items-center justify-center transition-all duration-[1200ms] ease-out ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
          >
            <h1 className="text-4xl md:text-6xl font-normal leading-tight text-foreground mb-4 font-clash">
              Book a Call
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mb-12">
              Choose your profile below to enter your customized AMFI-registered Mutual Fund distribution dashboard.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mt-4">

              {/* Existing Client Card */}
              <button
                onClick={() => setFlow("EXISTING_CLIENT")}
                className="relative text-left rounded-3xl border border-white/30 bg-white/30 p-8 flex flex-col justify-between group hover:border-primary/30 transition-all duration-300 backdrop-blur-xl hover:shadow-md cursor-pointer"
              >
                <div className="flex flex-col gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/30 flex items-center justify-center text-primary group-hover:text-primary/80 group-hover:border-primary/40 transition-all duration-300">
                    <Key className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">Existing Client</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed font-sans mt-2 pr-4">
                      Registered portfolios under Arindam De or Arijit De. Log in using PAN and Password.
                    </p>
                  </div>
                </div>
                <div className="mt-8 text-xs font-mono text-primary opacity-60 group-hover:opacity-100 flex items-center gap-1.5 transition-all">
                  Access Portal &rarr;
                </div>
              </button>

              {/* New User Card */}
              <button
                onClick={() => setFlow("NEW_USER")}
                className="relative text-left rounded-3xl border border-white/30 bg-white/30 p-8 flex flex-col justify-between group hover:border-primary/30 transition-all duration-300 backdrop-blur-xl hover:shadow-md cursor-pointer"
              >
                <div className="flex flex-col gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/30 flex items-center justify-center text-primary group-hover:text-primary/80 group-hover:border-primary/40 transition-all duration-300">
                    <UserPlus className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground">New User</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed font-sans mt-2 pr-4">
                      Create an account to start analyzing, optimizing, and tracking your assets under management.
                    </p>
                  </div>
                </div>
                <div className="mt-8 text-xs font-mono text-primary opacity-60 group-hover:opacity-100 flex items-center gap-1.5 transition-all">
                  Register Account &rarr;
                </div>
              </button>

            </div>

            {/* Admin Login Prompts */}
            <div className="mt-12 text-xs text-muted-foreground font-sans">
              Are you an administrator?{" "}
              <button
                onClick={() => {
                  setIsAdminLogin(true);
                  setAdminMode("PASSWORD");
                  setPassword("");
                  setFlow("NEW_USER");
                  setError(null);
                }}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Click here to login
              </button>
            </div>
          </div>
        )}

        {/* 2. NEW USER FORM */}
        {flow === "NEW_USER" && (
          <div className="w-full max-w-md bg-white/30 border border-white/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <h2 className="text-2xl font-semibold text-foreground mb-2 font-clash">
              {isAdminLogin ? "Admin Sign In" : (isUserLogin ? "User Sign In" : "Create Account")}
            </h2>
            <p className="text-muted-foreground text-xs font-sans mb-6">
              {isAdminLogin
                ? (adminMode === "PASSWORD"
                    ? "Enter your administrator email and password to sign in."
                    : "Enter your administrator email to receive a 6-digit OTP code.")
                : (isUserLogin ? "Enter your email to receive a 6-digit OTP code." : "Complete details to receive an OTP and register your workspace.")}
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex gap-2 items-start text-left font-sans">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
              {!isAdminLogin && !isUserLogin && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-sans transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-sans transition-all"
                  />
                </div>
              </div>

              {((isAdminLogin && adminMode === "PASSWORD") || (!isAdminLogin && !isUserLogin)) && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder={isAdminLogin ? "Enter your password" : "Create account password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-sans transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {!isAdminLogin && (
                    <p className="text-[10px] text-muted-foreground mt-1.5 font-sans">Must be at least 8 characters with 1 uppercase letter and 1 number.</p>
                  )}
                </div>
              )}

              {/* Admin: switch between password sign-in and email OTP fallback */}
              {isAdminLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminMode(adminMode === "PASSWORD" ? "OTP" : "PASSWORD");
                      setPassword("");
                      setError(null);
                    }}
                    className="text-[11px] text-primary font-semibold hover:underline cursor-pointer font-sans"
                  >
                    {adminMode === "PASSWORD"
                      ? "Forgot password? Login with email OTP"
                      : "Back to password sign in"}
                  </button>
                </div>
              )}

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="userRememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                <label htmlFor="userRememberMe" className="text-xs text-muted-foreground select-none cursor-pointer font-sans">
                  Remember me on this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
              >
                {isAdminLogin && adminMode === "PASSWORD"
                  ? (loading ? "Signing In..." : "Sign In")
                  : (loading ? "Sending OTP..." : (isAdminLogin || isUserLogin ? "Send OTP Code" : "Verify & Register"))}
              </button>
            </form>

            {!isAdminLogin && (
              <>
                <div className="relative my-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <span className="relative z-10 px-3 bg-white/50 backdrop-blur-md text-[10px] font-mono text-muted-foreground uppercase tracking-widest rounded-full">Or Continue With</span>
                </div>

                {/* Google OAuth Button Container */}
                <div className="w-full flex flex-col items-center justify-center">
                  <div id="google-signin-button" className="w-full min-h-[40px] flex justify-center" />
                </div>

                <div className="mt-6 text-center text-xs text-muted-foreground font-sans">
                  {isUserLogin ? (
                    <>
                      New to FinAnalysis?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserLogin(false);
                          setError(null);
                        }}
                        className="text-primary font-semibold hover:underline cursor-pointer"
                      >
                        Register here
                      </button>
                    </>
                  ) : (
                    <>
                      Already registered as user?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserLogin(true);
                          setError(null);
                        }}
                        className="text-primary font-semibold hover:underline cursor-pointer"
                      >
                        Login here
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. OTP VERIFICATION */}
        {flow === "OTP_VERIFY" && (
          <div className="w-full max-w-md bg-white/30 border border-white/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/30 flex items-center justify-center text-primary mx-auto mb-6">
              <Sparkles className="w-6 h-6" />
            </div>

            <h2 className="text-2xl font-semibold text-foreground mb-2 font-clash">Verify Email</h2>
            <p className="text-muted-foreground text-xs font-sans mb-6">
              {otpSentMsg || "We sent a 6-digit OTP code to your registered email."}
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex gap-2 items-start text-left font-sans">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleOtpVerifySubmit} className="space-y-6 text-left">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 text-center">6-Digit OTP Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full tracking-[1.5em] text-center py-4 text-xl bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-mono transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Complete Verification"}
              </button>
            </form>
          </div>
        )}

        {/* 4. EXISTING CLIENT FORM – Passwordless Email OTP */}
        {flow === "EXISTING_CLIENT" && (
          <div className="w-full max-w-md bg-white/30 border border-white/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative text-left">
            <h2 className="text-2xl font-semibold text-foreground mb-2 font-clash">
              {clientStep === 'EMAIL' && "Client Log In"}
              {clientStep === 'OTP_VERIFY' && "Verify Your Email"}
              {clientStep === 'ACCOUNT_SELECT' && "Select Profile"}
              {clientStep === 'PAN_VERIFY' && "Verify Identity"}
            </h2>
            <p className="text-muted-foreground text-xs font-sans mb-6">
              {clientStep === 'EMAIL' && "Enter your registered email address to receive a secure one-time verification code."}
              {clientStep === 'OTP_VERIFY' && `Enter the 6-digit code sent to ${clientEmail}`}
              {clientStep === 'ACCOUNT_SELECT' && `Multiple portfolios found under ${clientEmail}. Select yours to proceed:`}
              {clientStep === 'PAN_VERIFY' && `Enter the PAN card number associated with ${selectedAccount?.name || 'your profile'}`}
            </p>
            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex gap-2 items-start text-left font-sans animate-in fade-in slide-in-from-top-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {clientSuccessMsg && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex gap-2 items-start text-left font-sans animate-in fade-in slide-in-from-top-2">
                <span className="font-bold shrink-0 mt-0.5">✓</span>
                <span>{clientSuccessMsg}</span>
              </div>
            )}

            {clientStep === 'EMAIL' && (
              <>
                <form onSubmit={handleClientSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Registered Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. client@example.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-sans transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Sending Code..." : "Send Verification Code"}
                  </button>
                </form>

                <div className="relative my-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <span className="relative z-10 px-3 bg-white/50 backdrop-blur-md text-[10px] font-mono text-muted-foreground uppercase tracking-widest rounded-full">Or Continue With</span>
                </div>

                {/* Google OAuth Button Container */}
                <div className="w-full flex flex-col items-center justify-center">
                  <div id="google-signin-button-client" className="w-full min-h-[40px] flex justify-center" />
                </div>
              </>
            )}
            {clientStep === 'OTP_VERIFY' && (
              <form onSubmit={handleClientVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 text-center">6-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="000000"
                    value={clientOtp}
                    onChange={(e) => setClientOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full tracking-[1.5em] text-center py-3.5 text-lg bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-mono transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setClientStep('EMAIL'); setError(null); setClientSuccessMsg(""); setClientOtp(""); }}
                    className="text-xs text-neutral-600 hover:text-primary font-semibold font-sans cursor-pointer"
                  >
                    &larr; Use a different email
                  </button>
                </div>
              </form>
            )}

            {clientStep === 'ACCOUNT_SELECT' && (
              <div className="space-y-4">
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {clientAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        setSelectedAccount(acc);
                        setClientStep('PAN_VERIFY');
                        setError(null);
                      }}
                      className="w-full text-left p-4 rounded-2xl border border-white/20 bg-white/40 hover:bg-white/60 hover:border-primary/20 hover:shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-3.5 group text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/60 border border-white/40 flex items-center justify-center text-primary group-hover:border-primary/20 transition-all shrink-0">
                        <User className="w-5 h-5 stroke-[1.5]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-neutral-900 group-hover:text-primary transition-colors leading-tight truncate">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono tracking-wider mt-0.5">
                          PAN: {acc.panMasked}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-center mt-4 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => { setClientStep('EMAIL'); setError(null); setClientSuccessMsg(""); setClientOtp(""); setClientAccounts([]); }}
                    className="text-xs text-neutral-600 hover:text-primary font-semibold font-sans cursor-pointer"
                  >
                    &larr; Use a different email
                  </button>
                </div>
              </div>
            )}

            {clientStep === 'PAN_VERIFY' && (
              <form onSubmit={handleClientPanVerify} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">PAN Card Number</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      maxLength={10}
                      required
                      placeholder="e.g. ABCDE1234F"
                      value={enteredPan}
                      onChange={(e) => setEnteredPan(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-mono tracking-wider transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>

                <div className="flex justify-between items-center mt-4 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => { setClientStep('ACCOUNT_SELECT'); setError(null); setEnteredPan(""); }}
                    className="text-xs text-neutral-600 hover:text-primary font-semibold font-sans cursor-pointer"
                  >
                    &larr; Back to Profiles
                  </button>
                  <button
                    type="button"
                    onClick={() => { setClientStep('EMAIL'); setError(null); setClientSuccessMsg(""); setClientOtp(""); setClientAccounts([]); setEnteredPan(""); }}
                    className="text-xs text-neutral-600 hover:text-primary font-semibold font-sans cursor-pointer"
                  >
                    Use different email
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
