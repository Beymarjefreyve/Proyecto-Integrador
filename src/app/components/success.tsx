import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { CheckCircle, ArrowRight } from "lucide-react";

export function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.userName || "Usuario Demo";
  const userId = location.state?.userId || "user-1";
  const confidence: number | null = location.state?.confidence ?? null;
  const authTime = new Date();

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Efecto de partículas de fondo */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#00FF9D] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <CheckCircle className="w-32 h-32 text-[#00FF9D]" strokeWidth={1.5} />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#00FF9D] rounded-full blur-3xl opacity-50 animate-pulse"></div>

            {/* Anillos de expansión */}
            <motion.div
              className="absolute inset-0 border-2 border-[#00FF9D] rounded-full"
              animate={{
                scale: [1, 1.5, 2],
                opacity: [1, 0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            ></motion.div>
            <motion.div
              className="absolute inset-0 border-2 border-[#00FF9D] rounded-full"
              animate={{
                scale: [1, 1.5, 2],
                opacity: [1, 0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5,
                ease: "easeOut",
              }}
            ></motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-6"
        >
          <h1 className="text-3xl text-[#00FF9D]">
            Identidad Verificada
          </h1>

          <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#00FF9D]/30 shadow-lg shadow-[#00FF9D]/10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              {/* Avatar simulado */}
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00D4FF] to-[#00FF9D] rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="8" r="3" />
                    <path d="M12 14c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#F1F5F9]/70 text-sm">Usuario:</span>
                  <span className="text-[#F1F5F9] font-medium">{userName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#F1F5F9]/70 text-sm">Nivel de confianza:</span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                    className="text-[#00FF9D] text-xl"
                  >
                    {confidence !== null ? `${confidence}%` : "–"}
                  </motion.span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#F1F5F9]/70 text-sm">Método:</span>
                  <span className="text-[#F1F5F9] font-medium">Face ID AI</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#F1F5F9]/70 text-sm">Fecha:</span>
                  <span className="text-[#F1F5F9] font-medium">
                    {authTime.toLocaleDateString('es-ES')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#F1F5F9]/70 text-sm">Hora:</span>
                  <span className="text-[#F1F5F9] font-medium">
                    {authTime.toLocaleTimeString('es-ES')}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Indicadores de seguridad */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-3 text-xs"
          >
            <div className="bg-[#1E293B] rounded-lg p-3 border border-[#00FF9D]/20">
              <div className="text-[#00FF9D] mb-1">✓</div>
              <div className="text-[#F1F5F9]/70">Autenticado</div>
            </div>
            <div className="bg-[#1E293B] rounded-lg p-3 border border-[#00FF9D]/20">
              <div className="text-[#00FF9D] mb-1">✓</div>
              <div className="text-[#F1F5F9]/70">Encriptado</div>
            </div>
            <div className="bg-[#1E293B] rounded-lg p-3 border border-[#00FF9D]/20">
              <div className="text-[#00FF9D] mb-1">✓</div>
              <div className="text-[#F1F5F9]/70">Seguro</div>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard", { state: { userId, userName } })}
            className="w-full bg-gradient-to-r from-[#00FF9D] to-[#00D4FF] text-[#0F172A] py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-[#00FF9D]/30 hover:shadow-[#00FF9D]/50 transition-all"
          >
            <span className="text-lg">Continuar</span>
            <ArrowRight className="w-6 h-6" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
