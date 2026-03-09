import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { XCircle, RotateCcw, Home } from "lucide-react";

export function Error() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Efecto de interferencia de fondo */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-full h-px bg-[#FF4D4D]"
            style={{
              top: `${i * 10}%`,
              opacity: 0.1,
            }}
            animate={{
              x: [-100, 100],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <XCircle className="w-32 h-32 text-[#FF4D4D]" strokeWidth={1.5} />
            </motion.div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#FF4D4D] rounded-full blur-3xl opacity-40 animate-pulse"></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-6"
        >
          <h1 className="text-3xl text-[#FF4D4D]">
            Rostro no reconocido
          </h1>

          <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#FF4D4D]/30 shadow-lg shadow-[#FF4D4D]/10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF4D4D] to-[#8B0000] rounded-full flex items-center justify-center opacity-50">
                  <svg
                    className="w-12 h-12 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="8" r="3" />
                    <path d="M12 14c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" />
                    <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 text-left">
                  <span className="text-[#FF4D4D] mt-1">⚠</span>
                  <span className="text-[#F1F5F9]/70">
                    No se pudo verificar tu identidad biométrica
                  </span>
                </div>

                <div className="flex items-start gap-3 text-left">
                  <span className="text-[#FF4D4D] mt-1">⚠</span>
                  <span className="text-[#F1F5F9]/70">
                    Asegúrate de estar en un lugar bien iluminado
                  </span>
                </div>

                <div className="flex items-start gap-3 text-left">
                  <span className="text-[#FF4D4D] mt-1">⚠</span>
                  <span className="text-[#F1F5F9]/70">
                    Mantén tu rostro centrado en el marco
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#FF4D4D]/20">
                <div className="text-[#F1F5F9]/50 text-xs">
                  Código de error: AUTH_FACE_001
                </div>
                <div className="text-[#F1F5F9]/50 text-xs mt-1">
                  Timestamp: {new Date().toLocaleString('es-ES')}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sugerencias */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-[#1E293B]/50 rounded-xl p-4 border border-[#00D4FF]/20"
          >
            <h3 className="text-[#00D4FF] text-sm mb-3">Sugerencias:</h3>
            <ul className="text-xs text-[#F1F5F9]/70 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-[#00D4FF]">•</span>
                <span>Retira cualquier accesorio que cubra tu rostro</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00D4FF]">•</span>
                <span>Asegúrate de que la cámara esté limpia</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00D4FF]">•</span>
                <span>Evita movimientos bruscos durante el escaneo</span>
              </li>
            </ul>
          </motion.div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/scan")}
              className="w-full bg-gradient-to-r from-[#FF4D4D] to-[#CC0000] text-white py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-[#FF4D4D]/30 hover:shadow-[#FF4D4D]/50 transition-all"
            >
              <RotateCcw className="w-6 h-6" />
              <span className="text-lg">Intentar nuevamente</span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/")}
              className="w-full bg-[#1E293B] text-[#F1F5F9] py-4 rounded-xl border border-[#00D4FF]/30 flex items-center justify-center gap-3 hover:bg-[#1E293B]/80 hover:border-[#00D4FF]/60 transition-all"
            >
              <Home className="w-6 h-6" />
              <span className="text-lg">Volver al inicio</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
