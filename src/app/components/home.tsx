import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Scan, UserPlus, Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";
import { api } from "../lib/api";

export function Home() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<"initial" | "login">("initial");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canProceed = isValidEmail && password.length >= 8 && !isLoading;

  const handleLogin = async () => {
    if (!canProceed) return;
    setIsLoading(true);
    setError(null);

    try {
      const resp = await api.login(email, password);
      
      const existingUsers = JSON.parse(localStorage.getItem("secureFace_users") || "[]");
      const matchedUser = existingUsers.find((u: any) => u.email === email);
      
      // Use JWT provided userId natively if we lack local records on this machine
      const userId = resp.userId || matchedUser?.id || "unknown";
      const userName = matchedUser?.name || email;

      navigate("/success", { state: { userId, userName, masterPassword: password, isBiometric: false } });
    } catch (err: any) {
      setError(err.message || "Usuario o contraseña incorrectos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceScanClick = () => {
    navigate("/scan");
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent"></div>
        <div className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent"></div>
        <div className="absolute top-40 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent"></div>
        <div className="absolute bottom-40 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent"></div>
        <div className="absolute bottom-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6 inline-block"
          >
            <div className="relative">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#00D4FF] to-[#1E293B] rounded-3xl flex items-center justify-center shadow-lg shadow-[#00D4FF]/50">
                <Lock className="w-16 h-16 text-white" />
              </div>
              <div className="absolute inset-0 w-32 h-32 mx-auto bg-[#00D4FF] rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl mb-3"
          >
            <span className="bg-gradient-to-r from-[#00D4FF] to-[#00FF9D] bg-clip-text text-transparent">
              SecureVault
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[#F1F5F9]/70 text-sm"
          >
            Sincronización Transparente y Premium
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 relative"
        >
          {viewState === "initial" ? (
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewState("login")}
                className="w-full py-4 rounded-xl flex items-center justify-center gap-3 bg-gradient-to-r from-[#00D4FF] to-[#00A0CC] text-white shadow-lg shadow-[#00D4FF]/30 hover:shadow-[#00D4FF]/50 transition-all font-medium"
              >
                <Lock className="w-5 h-5" />
                <span className="text-lg">Iniciar Sesión</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/register")}
                className="w-full bg-transparent text-[#F1F5F9] py-4 rounded-xl border border-[#00D4FF]/30 flex items-center justify-center gap-2 hover:bg-[#1E293B] transition-all"
              >
                <UserPlus className="w-5 h-5 text-[#00D4FF]" />
                <span className="text-sm">Registrar Nuevo Usuario</span>
              </motion.button>
            </div>
          ) : (
            <>
              <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#00D4FF]/30 space-y-4 relative mt-2">
                <button 
                  onClick={() => setViewState("initial")}
                  className="absolute -top-12 left-0 p-2 bg-[#1E293B] rounded-full text-white hover:bg-[#1E293B]/80 transition-all border border-[#00D4FF]/30"
                >
                  <ArrowLeft className="w-5 h-5 text-[#00D4FF] "/>
                </button>
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00D4FF]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Correo electrónico"
                      className="w-full bg-[#0F172A] border border-[#00D4FF]/30 rounded-xl py-3 pl-12 pr-4 text-[#F1F5F9] focus:outline-none focus:border-[#00D4FF] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00D4FF]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Contraseña"
                      className="w-full bg-[#0F172A] border border-[#00D4FF]/30 rounded-xl py-3 pl-12 pr-4 text-[#F1F5F9] focus:outline-none focus:border-[#00D4FF] transition-colors"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="text-red-400 text-sm text-center flex items-center justify-center gap-1 mt-2">
                     <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  disabled={!canProceed}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
                    canProceed
                      ? "bg-gradient-to-r from-[#00D4FF] to-[#00A0CC] text-white shadow-lg shadow-[#00D4FF]/30 hover:shadow-[#00D4FF]/50"
                      : "bg-[#0F172A] text-[#F1F5F9]/50 cursor-not-allowed border border-[#00D4FF]/30"
                  }`}
                >
                  <span className="text-lg">{isLoading ? "Verificando..." : "Acceder a Bóveda"}</span>
                </motion.button>
              </div>

              <div className="flex justify-center mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFaceScanClick}
                  className="w-full max-w-sm bg-[#1E293B] text-[#00FF9D] py-3 rounded-xl border border-[#00FF9D]/30 flex items-center justify-center gap-2 hover:bg-[#1E293B]/80 hover:border-[#00FF9D] transition-all"
                >
                  <Scan className="w-5 h-5" />
                  <span>Iniciar con Escaneo Facial</span>
                </motion.button>
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-xs text-[#F1F5F9]/50"
        >
          <p>Powered by Advanced Hybrid Technology</p>
          <p className="mt-1">© 2026 SecureVault Multi-Device</p>
        </motion.div>
      </div>
    </div>
  );
}
