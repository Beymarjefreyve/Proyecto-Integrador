import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Camera, Mail, User, Check, AlertCircle } from "lucide-react";
import * as faceapi from "face-api.js";
import { loadModels } from "../utils/loadModels";

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [captureStep, setCaptureStep] = useState<"frontal" | "left" | "right" | null>(null);
  const [completedCaptures, setCompletedCaptures] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [descriptors, setDescriptors] = useState<Float32Array[]>([]);

  const captureStepRef = useRef(captureStep);
  const completedCapturesRef = useRef(completedCaptures);
  const descriptorsRef = useRef(descriptors);

  useEffect(() => {
    captureStepRef.current = captureStep;
    completedCapturesRef.current = completedCaptures;
    descriptorsRef.current = descriptors;
  }, [captureStep, completedCaptures, descriptors]);

  const handleCapture = () => {
    if (step === 2 && name && email) {
      setStep(3);
      setCaptureStep("frontal");
    }
  };

  const finalizeRegistration = useCallback((finalDescriptors: Float32Array[]) => {
    const userId = crypto.randomUUID();
    const userToSave = {
      id: userId,
      name,
      email,
      descriptors: finalDescriptors.map(d => Array.from(d))
    };

    const existingUsers = JSON.parse(localStorage.getItem("secureFace_users") || "[]");
    existingUsers.push(userToSave);
    localStorage.setItem("secureFace_users", JSON.stringify(existingUsers));

    setTimeout(() => {
      navigate("/success", { state: { userId, userName: name } });
    }, 1000);
  }, [name, email, navigate]);

  useEffect(() => {
    let isActive = true;
    let scanTimeout: any;

    const startWebcamAndScan = async () => {
      try {
        await loadModels();
        if (!isActive) return;
        setModelsLoaded(true);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current && isActive) {
          videoRef.current.srcObject = stream;
        }

        const scanFace = async () => {
          if (!isActive) return;
          if (videoRef.current && videoRef.current.readyState === 4) {
            const currentStep = captureStepRef.current;
            if (currentStep && !completedCapturesRef.current.includes(currentStep)) {
              try {
                const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options())
                  .withFaceLandmarks()
                  .withFaceDescriptor();

                if (detection) {
                  setDetectError(null);
                  
                  const newDescriptors = [...descriptorsRef.current, detection.descriptor];
                  setDescriptors(newDescriptors);
                  descriptorsRef.current = newDescriptors;

                  const newCompleted = [...completedCapturesRef.current, currentStep];
                  setCompletedCaptures(newCompleted);
                  completedCapturesRef.current = newCompleted;

                  if (currentStep === "frontal") {
                    setCaptureStep("left");
                  } else if (currentStep === "left") {
                    setCaptureStep("right");
                  } else if (currentStep === "right") {
                    finalizeRegistration(newDescriptors);
                    return; 
                  }
                } else {
                  setDetectError("No se detecta rostro. Ajusta tu posición e iluminación.");
                }
              } catch (err) {
                console.error("Error during detection", err);
              }
            }
          }
          // Scan again after a brief pause
          scanTimeout = setTimeout(scanFace, 1500); 
        };

        scanTimeout = setTimeout(scanFace, 1000);
      } catch (err) {
        setDetectError("Error al acceder a la cámara o cargar modelos.");
        console.error(err);
      }
    };

    if (step === 3) {
      startWebcamAndScan();
    }

    return () => {
      isActive = false;
      if (scanTimeout) clearTimeout(scanTimeout);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step, finalizeRegistration]);

  const steps = [
    { number: 1, label: "Datos", icon: User },
    { number: 2, label: "Captura", icon: Camera },
    { number: 3, label: "Verificación", icon: Check },
  ];

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
          Registro de Usuario
        </motion.h2>

        {/* Indicador de pasos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      step >= s.number
                        ? "bg-[#00D4FF] border-[#00D4FF] text-white"
                        : "bg-[#1E293B] border-[#1E293B] text-[#F1F5F9]/50"
                    }`}
                    animate={{
                      scale: step === s.number ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: step === s.number ? Infinity : 0,
                      repeatDelay: 1,
                    }}
                  >
                    <s.icon className="w-6 h-6" />
                  </motion.div>
                  <span className="text-xs mt-2 text-[#F1F5F9]/70">{s.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-[#1E293B] mx-2 mt-[-24px]">
                    <motion.div
                      className="h-full bg-[#00D4FF]"
                      initial={{ width: 0 }}
                      animate={{ width: step > s.number ? "100%" : "0%" }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Paso 1: Datos del usuario */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#00D4FF]/30">
              <h3 className="text-lg mb-6 text-[#F1F5F9]">Información Personal</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#F1F5F9]/70 mb-2">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00D4FF]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ingresa tu nombre"
                      className="w-full bg-[#0F172A] border border-[#00D4FF]/30 rounded-xl py-3 pl-12 pr-4 text-[#F1F5F9] placeholder:text-[#F1F5F9]/30 focus:outline-none focus:border-[#00D4FF] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#F1F5F9]/70 mb-2">
                    Correo Electrónico o ID
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00D4FF]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full bg-[#0F172A] border border-[#00D4FF]/30 rounded-xl py-3 pl-12 pr-4 text-[#F1F5F9] placeholder:text-[#F1F5F9]/30 focus:outline-none focus:border-[#00D4FF] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => name && email && setStep(2)}
              disabled={!name || !email}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
                name && email
                  ? "bg-gradient-to-r from-[#00D4FF] to-[#00A0CC] text-white shadow-lg shadow-[#00D4FF]/30 hover:shadow-[#00D4FF]/50"
                  : "bg-[#1E293B] text-[#F1F5F9]/50 cursor-not-allowed"
              }`}
            >
              <span className="text-lg">Continuar</span>
            </motion.button>
          </motion.div>
        )}

        {/* Paso 2: Instrucciones de captura */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#00D4FF]/30">
              <h3 className="text-lg mb-6 text-[#F1F5F9]">Captura Biométrica</h3>
              
              <p className="text-sm text-[#F1F5F9]/70 mb-6">
                Vamos a capturar tu rostro desde 3 ángulos diferentes para garantizar
                la máxima seguridad.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-[#0F172A] rounded-xl p-3">
                  <div className="w-10 h-10 rounded-full bg-[#00D4FF]/20 flex items-center justify-center">
                    <span className="text-[#00D4FF]">1</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-[#F1F5F9]">Vista Frontal</div>
                    <div className="text-xs text-[#F1F5F9]/50">Mira directamente a la cámara</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#0F172A] rounded-xl p-3">
                  <div className="w-10 h-10 rounded-full bg-[#00D4FF]/20 flex items-center justify-center">
                    <span className="text-[#00D4FF]">2</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-[#F1F5F9]">Vista Izquierda</div>
                    <div className="text-xs text-[#F1F5F9]/50">Gira tu rostro a la izquierda</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#0F172A] rounded-xl p-3">
                  <div className="w-10 h-10 rounded-full bg-[#00D4FF]/20 flex items-center justify-center">
                    <span className="text-[#00D4FF]">3</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-[#F1F5F9]">Vista Derecha</div>
                    <div className="text-xs text-[#F1F5F9]/50">Gira tu rostro a la derecha</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#00D4FF]/10 rounded-xl border border-[#00D4FF]/30">
                <div className="flex items-start gap-3">
                  <span className="text-[#00D4FF] text-xl">ℹ</span>
                  <div className="text-xs text-[#F1F5F9]/70">
                    Asegúrate de estar en un lugar bien iluminado y mantén tu rostro
                    dentro del marco en todo momento.
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCapture}
              className="w-full bg-gradient-to-r from-[#00D4FF] to-[#00A0CC] text-white py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-[#00D4FF]/30 hover:shadow-[#00D4FF]/50 transition-all"
            >
              <Camera className="w-6 h-6" />
              <span className="text-lg">Capturar Rostro</span>
            </motion.button>
          </motion.div>
        )}

        {/* Paso 3: Captura en progreso */}
        {step === 3 && captureStep && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Vista de cámara */}
            <div className="relative aspect-[3/4] bg-gradient-to-b from-[#1E293B] to-[#0F172A] rounded-3xl overflow-hidden border border-[#00D4FF]/30">
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
                  <p className="text-[#00D4FF] text-sm">Iniciando cámara y AI...</p>
                </div>
              )}

              {/* Marco de captura */}
              <div className="absolute inset-0 m-8 border-2 border-[#00FF9D] rounded-2xl z-20 pointer-events-none">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#00FF9D] rounded-tl-2xl animate-pulse"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#00FF9D] rounded-tr-2xl animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#00FF9D] rounded-bl-2xl animate-pulse"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#00FF9D] rounded-br-2xl animate-pulse"></div>
              </div>

              {/* Efecto de flash por estado completo */}
              <AnimatePresence>
                {completedCaptures.length > 0 && (
                  <motion.div
                    key={completedCaptures.length}
                    className="absolute inset-0 bg-[#00FF9D] z-30 pointer-events-none"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error Message */}
            {detectError && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm justify-center"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{detectError}</span>
              </motion.div>
            )}

            {/* Instrucciones */}
            <div className="text-center space-y-4">
              <motion.h3
                className="text-xl text-[#00FF9D]"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {captureStep === "frontal" && "Vista Frontal"}
                {captureStep === "left" && "Gira a la Izquierda"}
                {captureStep === "right" && "Gira a la Derecha"}
              </motion.h3>

              {/* Checkmarks de progreso */}
              <div className="flex justify-center gap-4">
                {["frontal", "left", "right"].map((pos) => (
                  <div
                    key={pos}
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      completedCaptures.includes(pos)
                        ? "bg-[#00FF9D] border-[#00FF9D]"
                        : captureStep === pos
                        ? "border-[#00FF9D] animate-pulse"
                        : "border-[#1E293B]"
                    }`}
                  >
                    {completedCaptures.includes(pos) && (
                      <Check className="w-6 h-6 text-white" />
                    )}
                  </div>
                ))}
              </div>

              <p className="text-sm text-[#F1F5F9]/70">
                Mantén tu posición...
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
