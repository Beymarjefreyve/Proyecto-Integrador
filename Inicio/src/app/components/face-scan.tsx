import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

export function FaceScan() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [laserPosition, setLaserPosition] = useState(0);

  useEffect(() => {
    // Simular progreso de escaneo
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            // 80% de probabilidad de éxito
            const success = Math.random() > 0.2;
            navigate(success ? "/success" : "/error");
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Simular movimiento del láser
    const laserInterval = setInterval(() => {
      setLaserPosition((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 30);

    return () => {
      clearInterval(progressInterval);
      clearInterval(laserInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Botón volver */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 text-[#F1F5F9]/70 hover:text-[#00D4FF] transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </motion.button>

      <div className="max-w-md w-full relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl text-center mb-8 text-[#00D4FF]"
        >
          Escaneo Biométrico
        </motion.h2>

        {/* Visor de cámara simulado */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-[3/4] bg-gradient-to-b from-[#1E293B] to-[#0F172A] rounded-3xl overflow-hidden mb-8 border border-[#00D4FF]/30"
        >
          {/* Simulación de imagen de rostro */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <svg
                className="w-48 h-48 text-[#00D4FF]/30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <circle cx="12" cy="10" r="3" />
                <path d="M12 14c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" />
                <ellipse cx="9" cy="9" rx="0.5" ry="0.8" fill="currentColor" />
                <ellipse cx="15" cy="9" rx="0.5" ry="0.8" fill="currentColor" />
              </svg>
            </motion.div>
          </div>

          {/* Marco biométrico con esquinas luminosas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute inset-0 m-8 border-2 border-[#00D4FF] rounded-2xl"
          >
            {/* Esquina superior izquierda */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#00FF9D] rounded-tl-2xl animate-pulse"></div>
            {/* Esquina superior derecha */}
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#00FF9D] rounded-tr-2xl animate-pulse"></div>
            {/* Esquina inferior izquierda */}
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#00FF9D] rounded-bl-2xl animate-pulse"></div>
            {/* Esquina inferior derecha */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#00FF9D] rounded-br-2xl animate-pulse"></div>

            {/* Glow effect del marco */}
            <div className="absolute inset-0 border-2 border-[#00D4FF] rounded-2xl blur-sm opacity-70"></div>
          </motion.div>

          {/* Línea láser de escaneo */}
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00FF9D] to-transparent shadow-lg shadow-[#00FF9D]"
            style={{
              top: `${laserPosition}%`,
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FF9D] to-transparent blur-md"></div>
          </motion.div>

          {/* Puntos de reconocimiento facial */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#00FF9D] rounded-full shadow-lg shadow-[#00FF9D]"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Estado del escaneo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-[#00D4FF] border-t-transparent rounded-full"
            ></motion.div>
            <p className="text-[#F1F5F9] text-lg">Analizando rostro...</p>
          </div>

          {/* Barra de progreso */}
          <div className="relative h-3 bg-[#1E293B] rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#00D4FF] to-[#00FF9D] rounded-full shadow-lg shadow-[#00D4FF]/50"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            ></motion.div>
          </div>

          {/* Porcentaje */}
          <motion.p
            className="text-3xl text-[#00D4FF]"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {progress}%
          </motion.p>

          {/* Indicadores de análisis */}
          <div className="mt-8 space-y-2 text-sm text-[#F1F5F9]/70">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-between"
            >
              <span>Geometría facial</span>
              <span className="text-[#00FF9D]">✓ Detectado</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-center justify-between"
            >
              <span>Profundidad 3D</span>
              <span className="text-[#00FF9D]">✓ Verificado</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              className="flex items-center justify-between"
            >
              <span>Análisis biométrico</span>
              <span className="text-[#00D4FF]">Procesando...</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
