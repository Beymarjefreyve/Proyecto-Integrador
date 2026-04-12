import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import * as faceapi from "face-api.js";
import { loadModels } from "../utils/loadModels";
import { decrypt } from "../lib/crypto";

const DEVICE_STATIC_KEY = "device-static-face-auth-key-3920";
const DEVICE_STATIC_SALT = "c3RhdGljLXNhbHQtb2s=";

export function FaceScan() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [laserPosition, setLaserPosition] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    let scanTimeout: any;

    const startScanner = async () => {
      try {
        await loadModels();
        if (!isActive) return;
        setModelsLoaded(true);

        const usersData = JSON.parse(localStorage.getItem('secureFace_users') || '[]');
        const usersWithDescriptors = usersData.filter((u: any) => u.descriptors && u.descriptors.length > 0);

        if (usersWithDescriptors.length === 0) {
          setScanMessage("Aún no se ha añadido un perfil biométrico.");
          setTimeout(() => navigate(-1), 2500);
          return;
        }

        const labeledDescriptors = usersWithDescriptors.map((u: any) => {
          const descriptors = u.descriptors.map((d: number[]) => new Float32Array(d));
          return new faceapi.LabeledFaceDescriptors(u.name, descriptors);
        });

        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current && isActive) {
          videoRef.current.srcObject = stream;
        }

        let attempts = 0;
        const maxAttempts = 20;

        const scanFace = async () => {
          if (!isActive) return;
          if (videoRef.current && videoRef.current.readyState === 4) {
            try {
              const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options())
                .withFaceLandmarks()
                .withFaceDescriptor();

              if (detection) {
                const match = faceMatcher.findBestMatch(detection.descriptor);
                
                if (match.label !== "unknown") {
                  const matchedUser = usersData.find((u: any) => u.name === match.label);
                  const userId = matchedUser?.id || "unknown-user";
                  const confidence = Math.round((1 - match.distance) * 100 * 10) / 10;
                  
                  let unlockedPassword = null;
                  if (matchedUser?.wrappedMasterKey) {
                     const [iv, encrypted] = matchedUser.wrappedMasterKey.split(":");
                     if (iv && encrypted) {
                       try {
                         unlockedPassword = await decrypt(encrypted, iv, DEVICE_STATIC_KEY, DEVICE_STATIC_SALT);
                       } catch (e) {
                         console.error("Error al descifrar master key con faceId", e);
                       }
                     }
                  }

                  if (!unlockedPassword) {
                     setScanMessage("Error interno: Contraseña maestra no configurada correctamente.");
                     setTimeout(() => navigate("/error"), 2000);
                     return;
                  }

                  setProgress(100);
                  setScanning(false);
                  setScanMessage(`¡Rostro reconocido! Bienvenido.`);
                  
                  setTimeout(() => {
                    navigate("/success", { state: { userId, userName: match.label, confidence, masterPassword: unlockedPassword, isBiometric: true } });
                  }, 1500);
                  return; // Stop scanning
                } else {
                  attempts++;
                  setProgress(Math.min((attempts / maxAttempts) * 100, 99));
                  if (attempts >= maxAttempts) {
                    setScanMessage("Rostro no reconocido. Acceso denegado.");
                    setTimeout(() => navigate("/error"), 2000);
                    return;
                  }
                }
              } else {
                 attempts++;
                 setProgress(Math.min((attempts / maxAttempts) * 100, 99));
                 if (attempts >= maxAttempts) {
                    setScanMessage("Tiempo de espera agotado.");
                    setTimeout(() => navigate("/error"), 2000);
                    return;
                 }
              }
            } catch (err) {
              console.error(err);
            }
          }
          scanTimeout = setTimeout(scanFace, 1500);
        };

        scanTimeout = setTimeout(scanFace, 1500);

      } catch (err) {
        setScanMessage("Error al inicializar la cámara o modelos.");
        console.error(err);
      }
    };

    startScanner();

    // Animación de láser
    const laserInterval = setInterval(() => {
      setLaserPosition((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 30);

    return () => {
      isActive = false;
      clearInterval(laserInterval);
      if (scanTimeout) clearTimeout(scanTimeout);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
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

        {/* Visor de cámara real con overlays */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-[3/4] bg-gradient-to-b from-[#1E293B] to-[#0F172A] rounded-3xl overflow-hidden mb-8 border border-[#00D4FF]/30"
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }} // mirror
          />

          {!modelsLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F172A]/80 z-10">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-[#00D4FF] border-t-transparent rounded-full mb-4"></motion.div>
              <p className="text-[#00D4FF] text-sm">Cargando FaceMatcher...</p>
            </div>
          )}

          {/* Marco biométrico con esquinas luminosas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute inset-0 m-8 border-2 border-[#00D4FF] rounded-2xl pointer-events-none"
          >
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#00FF9D] rounded-tl-2xl animate-pulse"></div>
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#00FF9D] rounded-tr-2xl animate-pulse"></div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#00FF9D] rounded-bl-2xl animate-pulse"></div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#00FF9D] rounded-br-2xl animate-pulse"></div>
            <div className="absolute inset-0 border-2 border-[#00D4FF] rounded-2xl blur-sm opacity-70"></div>
          </motion.div>

          {/* Línea láser de escaneo */}
          {scanning && (
            <motion.div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00FF9D] to-transparent shadow-lg shadow-[#00FF9D] pointer-events-none"
              style={{ top: `${laserPosition}%` }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FF9D] to-transparent blur-md"></div>
            </motion.div>
          )}

          {/* Efectos si terminamos de escanear (éxito) */}
          {!scanning && (
            <motion.div
              className="absolute inset-0 bg-[#00FF9D]/30 z-30 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          )}
        </motion.div>

        {scanMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="mb-4 bg-[#00D4FF]/10 border border-[#00D4FF]/50 text-[#00D4FF] p-3 rounded-xl flex items-center gap-2 text-sm justify-center"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{scanMessage}</span>
          </motion.div>
        )}

        {/* Estado del escaneo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-4"
        >
          {scanning ? (
            <div className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-[#00D4FF] border-t-transparent rounded-full"
              ></motion.div>
              <p className="text-[#F1F5F9] text-lg">Analizando rostro...</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <p className="text-[#00FF9D] text-lg">Análisis completado</p>
            </div>
          )}

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
            animate={scanning ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {Math.round(progress)}%
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
              <span className="text-[#00FF9D]">{progress > 30 ? "✓ Detectado" : "Analizando..."}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-center justify-between"
            >
              <span>Profundidad 3D</span>
              <span className="text-[#00FF9D]">{progress > 60 ? "✓ Verificado" : "Pendiente"}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              className="flex items-center justify-between"
            >
              <span>Análisis biométrico</span>
              <span className="text-[#00D4FF]">{!scanning ? "Aprobado" : "Procesando..."}</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
