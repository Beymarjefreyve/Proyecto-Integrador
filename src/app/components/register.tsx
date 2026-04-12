import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowLeft, Mail, User, Lock, AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import { encrypt, generateSalt } from "../lib/crypto";

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordsMatch = password === confirmPassword;
  const canProceed = name.trim().length > 0 && isValidEmail && password.length >= 8 && passwordsMatch && !isLoading;

  const handleRegister = async () => {
    if (!canProceed) return;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Register User in Backend
      const userRes = await api.register(email, password);
      
      // 2. We need to optionally login to get the access token to init the vault
      await api.login(email, password);

      // 3. Initialize the Zero-Knowledge Vault for this user
      // Create empty vault structure
      const emptyData = { passwords: [] };
      const salt = generateSalt();
      const { encrypted, iv } = await encrypt(JSON.stringify(emptyData), password, salt);

      const vaultInit = await api.initVault({
        encrypted_vault: `${iv}:${encrypted}`,
        salt: salt,
        iterations: 100000 // our PBKDF2 iterations standard
      });

      // 4. Save User Info Locally (Simulating local auth so the app flows naturally)
      const userToSave = {
        id: userRes.id,
        name: name,
        email: email,
        masterKeySalt: salt,
        // we do not store the master password here!
      };

      // In original code, users are pushed to localStorage array, we do the same for compatibility
      const existingUsers = JSON.parse(localStorage.getItem("secureFace_users") || "[]");
      existingUsers.push(userToSave);
      localStorage.setItem("secureFace_users", JSON.stringify(existingUsers));

      // Successfully processed all the flow
      setTimeout(() => {
        navigate("/dashboard", { state: { userId: userRes.id, userName: name, masterPassword: password } });
      }, 500);

    } catch (err: any) {
      setError(err.message || "Error al completar el registro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <button 
          onClick={() => navigate("/")}
          className="absolute z-10 top-6 left-6 p-3 bg-[#1E293B] rounded-full text-white hover:bg-[#1E293B]/80 transition-all border border-[#00D4FF]/30 hover:scale-105"
      >
          <ArrowLeft className="w-6 h-6 text-[#00D4FF]" />
      </button>

      <div className="max-w-md w-full relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl text-center mb-8 text-[#00D4FF]"
        >
          Registro de Bóveda Maestra
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#00D4FF]/30">
            <h3 className="text-lg mb-6 text-[#F1F5F9]">Crear Cuenta</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#F1F5F9]/70 mb-2">Nombre o Alias</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00D4FF]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre"
                    className="w-full bg-[#0F172A] border border-[#00D4FF]/30 rounded-xl py-3 pl-12 pr-4 text-[#F1F5F9] focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#F1F5F9]/70 mb-2">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00D4FF]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo Electrónico"
                    className="w-full bg-[#0F172A] border border-[#00D4FF]/30 rounded-xl py-3 pl-12 pr-4 text-[#F1F5F9] focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#F1F5F9]/70 mb-2">Contraseña Maestra (Min 8 carácteres)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00D4FF]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full bg-[#0F172A] border border-[#00D4FF]/30 rounded-xl py-3 pl-12 pr-4 text-[#F1F5F9] focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#F1F5F9]/70 mb-2">Confirmar Contraseña Maestra</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00D4FF]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar Contraseña"
                    className={`w-full bg-[#0F172A] border rounded-xl py-3 pl-12 pr-4 text-[#F1F5F9] focus:outline-none transition-colors ${
                      confirmPassword.length > 0 && !passwordsMatch
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#00D4FF]/30 focus:border-[#00D4FF]"
                    }`}
                  />
                </div>
              </div>

            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm justify-center">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRegister}
            disabled={!canProceed}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
              canProceed
                ? "bg-gradient-to-r from-[#00D4FF] to-[#00A0CC] text-white shadow-lg shadow-[#00D4FF]/30 hover:shadow-[#00D4FF]/50"
                : "bg-[#1E293B] text-[#F1F5F9]/50 cursor-not-allowed"
            }`}
          >
            <span className="text-lg">{isLoading ? "Cifrando Bóveda..." : "Registrar Bóveda"}</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
