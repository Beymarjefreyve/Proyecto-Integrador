import { useState } from 'react';
import { Scan, ShieldAlert } from 'lucide-react';
import { encrypt } from '../lib/crypto';
import { getUserProfile } from '../lib/database';
import { FaceRegistrationModal } from './FaceRegistrationModal';

const DEVICE_STATIC_KEY = "device-static-face-auth-key-3920";
const DEVICE_STATIC_SALT = "c3RhdGljLXNhbHQtb2s="; // Static Base64 salt

interface FaceIDSettingsViewProps {
  masterKey: string;
  userId: string;
}

export function FaceIDSettingsView({ masterKey, userId }: FaceIDSettingsViewProps) {
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [faceConfigured, setFaceConfigured] = useState(() => {
    const users = JSON.parse(localStorage.getItem('secureFace_users') || '[]');
    return users.some((u: any) => u.id === userId && u.descriptors);
  });

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFaceRegistrationSuccess = async (descriptors: Float32Array[]) => {
    try {
      setIsFaceModalOpen(false);
      // Encrypt the master key so it can be unlocked by face id natively in localStorage
      const { encrypted, iv } = await encrypt(masterKey, DEVICE_STATIC_KEY, DEVICE_STATIC_SALT);
      
      const usersData = JSON.parse(localStorage.getItem('secureFace_users') || '[]');
      let userIndex = usersData.findIndex((u: any) => u.id === userId);
      
      const facePayload = {
        descriptors: descriptors.map(d => Array.from(d)),
        wrappedMasterKey: `${iv}:${encrypted}`
      };

      if (userIndex >= 0) {
        usersData[userIndex] = { ...usersData[userIndex], ...facePayload };
      } else {
        const profile = await getUserProfile(userId);
        usersData.push({
          id: userId,
          name: profile?.name || 'Local User',
          email: profile?.email || '',
          ...facePayload
        });
      }
      
      localStorage.setItem('secureFace_users', JSON.stringify(usersData));
      setFaceConfigured(true);
      showMessage('success', 'Face ID configurado correctamente para esta cuenta.');
    } catch (err) {
       console.error(err);
       showMessage('error', 'Error configurando Face ID.');
    }
  };

  const handleRemoveFaceId = () => {
    const usersData = JSON.parse(localStorage.getItem('secureFace_users') || '[]');
    const userIndex = usersData.findIndex((u: any) => u.id === userId);
    if (userIndex >= 0) {
       delete usersData[userIndex].descriptors;
       delete usersData[userIndex].wrappedMasterKey;
       localStorage.setItem('secureFace_users', JSON.stringify(usersData));
       setFaceConfigured(false);
       showMessage('success', 'Face ID deshabilitado.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
          'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {message.type === 'error' && <ShieldAlert className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Face Registration Modal */}
      <FaceRegistrationModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        onSuccess={handleFaceRegistrationSuccess}
      />

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Scan className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">Acceso Biométrico Rápido</h3>
              <p className="text-sm text-muted-foreground">Usa reconocimiento facial para iniciar sesión y desbloquear tu bóveda más rápido en este dispositivo.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
          <div>
            <h4 className="font-medium text-foreground">Ajustes de Face ID Local</h4>
            <p className="text-sm text-muted-foreground">Tus rasgos faciales se guardan localmente para este dispositivo.</p>
          </div>
          {faceConfigured ? (
             <button onClick={handleRemoveFaceId} className="px-5 py-2.5 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white rounded-lg text-sm font-medium transition-all">
                Remover Face ID
             </button>
          ) : (
             <button onClick={() => setIsFaceModalOpen(true)} className="px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg text-sm font-medium transition-all">
                Configurar Face ID
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
