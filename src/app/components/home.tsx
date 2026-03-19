import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Scan, UserPlus } from "lucide-react";

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Líneas digitales de fondo */}
      <div className="absolute inset-0 opacity-10">
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
          {/* Logo con ícono de rostro digital */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6 inline-block"
          >
            <div className="relative">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#00D4FF] to-[#1E293B] rounded-3xl flex items-center justify-center shadow-lg shadow-[#00D4FF]/50">
                <svg
                  className="w-20 h-20 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="8" r="3" />
                  <path d="M12 14c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" />
                  <path d="M3 12h2M19 12h2M12 3v2M12 19v2" strokeLinecap="round" />
                  <circle cx="6" cy="6" r="1" fill="currentColor" />
                  <circle cx="18" cy="6" r="1" fill="currentColor" />
                  <circle cx="6" cy="18" r="1" fill="currentColor" />
                  <circle cx="18" cy="18" r="1" fill="currentColor" />
                </svg>
              </div>
              {/* Glow effect */}
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
              SecureFace AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[#F1F5F9]/70 text-sm"
          >
            Autenticación biométrica de última generación
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {/* Botón principal */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/scan")}
            className="w-full bg-gradient-to-r from-[#00D4FF] to-[#00A0CC] text-white py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-[#00D4FF]/30 hover:shadow-[#00D4FF]/50 transition-all"
          >
            <Scan className="w-6 h-6" />
            <span className="text-lg">Iniciar Escaneo Facial</span>
          </motion.button>

          {/* Botón secundario */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/register")}
            className="w-full bg-[#1E293B] text-[#F1F5F9] py-4 rounded-xl border border-[#00D4FF]/30 flex items-center justify-center gap-3 hover:bg-[#1E293B]/80 hover:border-[#00D4FF]/60 transition-all"
          >
            <UserPlus className="w-6 h-6" />
            <span className="text-lg">Registrar Usuario</span>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-xs text-[#F1F5F9]/50"
        >
          <p>Powered by Advanced AI Technology</p>
          <p className="mt-1">© 2026 SecureFace AI</p>
        </motion.div>
      </div>
    </div>
  );
}
