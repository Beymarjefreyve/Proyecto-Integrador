import { useState, useRef, useEffect } from 'react';
import { Camera, Check, AlertCircle, X } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { loadModels } from '../utils/loadModels';

interface FaceRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (descriptors: Float32Array[]) => void;
}

export function FaceRegistrationModal({ isOpen, onClose, onSuccess }: FaceRegistrationModalProps) {
  const [step, setStep] = useState<"frontal" | "left" | "right">("frontal");
  const [completed, setCompleted] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [descriptors, setDescriptors] = useState<Float32Array[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const stepRef = useRef(step);
  const completedRef = useRef(completed);
  const descriptorsRef = useRef(descriptors);

  useEffect(() => {
    if (!isOpen) {
      setStep("frontal");
      setCompleted([]);
      setDescriptors([]);
      setError(null);
      setModelsLoaded(false);
    }
  }, [isOpen]);

  useEffect(() => {
    stepRef.current = step;
    completedRef.current = completed;
    descriptorsRef.current = descriptors;
  }, [step, completed, descriptors]);

  useEffect(() => {
    let isActive = true;
    let scanTimeout: any;
    let stream: MediaStream | null = null;

    if (!isOpen) return;

    const startCamera = async () => {
      try {
        await loadModels();
        if (!isActive) return;
        setModelsLoaded(true);

        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current && isActive) {
          videoRef.current.srcObject = stream;
        }

        const scanFace = async () => {
          if (!isActive) return;
          if (videoRef.current && videoRef.current.readyState === 4) {
            const currentStep = stepRef.current;
            if (currentStep && !completedRef.current.includes(currentStep)) {
              try {
                const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options())
                  .withFaceLandmarks()
                  .withFaceDescriptor();

                if (detection) {
                  setError(null);
                  const newDescriptors = [...descriptorsRef.current, detection.descriptor];
                  setDescriptors(newDescriptors);
                  const newCompleted = [...completedRef.current, currentStep];
                  setCompleted(newCompleted);

                  if (currentStep === "frontal") setStep("left");
                  else if (currentStep === "left") setStep("right");
                  else if (currentStep === "right") {
                    setTimeout(() => onSuccess(newDescriptors), 1000);
                    return;
                  }
                } else {
                  setError("No se detecta rostro. Ajusta tu posición.");
                }
              } catch (err) {
                console.error("Error detecting face", err);
              }
            }
          }
          scanTimeout = setTimeout(scanFace, 1500);
        };

        scanTimeout = setTimeout(scanFace, 1000);
      } catch (err) {
         setError("Error al acceder a la cámara.");
      }
    };

    startCamera();

    return () => {
      isActive = false;
      if (scanTimeout) clearTimeout(scanTimeout);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isOpen, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1E293B] border border-[#00D4FF]/30 rounded-3xl overflow-hidden w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/80 transition-all">
          <X className="w-5 h-5"/>
        </button>

        <div className="p-6">
          <h3 className="text-xl text-[#00D4FF] text-center mb-6">Configurar Face ID</h3>
          
          <div className="relative aspect-[3/4] bg-[#0F172A] rounded-2xl overflow-hidden border border-[#00D4FF]/30 mb-6">
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover shadow-inner" style={{ transform: "scaleX(-1)" }} />
            
            {!modelsLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F172A]/80 z-10">
                 <div className="w-8 h-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-[#00D4FF] text-sm">Iniciando cámara y AI...</p>
              </div>
            )}
            
            <div className="absolute inset-0 m-6 border-2 border-[#00FF9D]/50 rounded-2xl pointer-events-none">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#00FF9D] rounded-tl-xl animate-pulse"></div>
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#00FF9D] rounded-tr-xl animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#00FF9D] rounded-bl-xl animate-pulse"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#00FF9D] rounded-br-xl animate-pulse"></div>
            </div>
            
            {completed.length === 3 && (
              <div className="absolute inset-0 bg-[#00FF9D] opacity-20 z-20"></div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm justify-center mb-4">
              <AlertCircle className="w-4 h-4" /> <span>{error}</span>
            </div>
          )}

          <div className="text-center space-y-4">
             <h4 className="text-lg text-[#00FF9D] animate-pulse">
               {step === "frontal" && "Vista Frontal"}
               {step === "left" && "Gira a la Izquierda"}
               {step === "right" && "Gira a la Derecha"}
             </h4>
             <div className="flex justify-center gap-4">
                {["frontal", "left", "right"].map((pos) => (
                  <div key={pos} className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      completed.includes(pos) ? "bg-[#00FF9D] border-[#00FF9D]" : step === pos ? "border-[#00FF9D] animate-pulse" : "border-[#0F172A]"
                    }`}
                  >
                    {completed.includes(pos) && <Check className="w-5 h-5 text-black" />}
                  </div>
                ))}
             </div>
             <p className="text-sm text-[#F1F5F9]/70">Mantén tu posición dentro del marco...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
