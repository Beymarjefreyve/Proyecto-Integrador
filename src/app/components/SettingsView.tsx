import { useState } from 'react';
import { Download, Upload, Save, ShieldAlert, LogOut, Key } from 'lucide-react';
import { getAllData, exportToKdbxReal, importFromKdbxReal, importAllData, getUserProfile } from '../lib/database';
import { encrypt } from '../lib/crypto';
import { PasswordEntry, UserProfile } from '../types';

interface SettingsViewProps {
  masterKey: string;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

export function SettingsView({ masterKey, onLogout, onDeleteAccount }: SettingsViewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [modalPassword, setModalPassword] = useState('');
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExportConfirm = async () => {
    if (!modalPassword) {
      showMessage('error', 'Debes ingresar una contraseña para cifrar el archivo.');
      return;
    }
    try {
      setExportModalOpen(false);
      setIsExporting(true);
      const data = await getAllData('user-1');
      
      const blob = await exportToKdbxReal(data, masterKey, modalPassword);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SecureVault_Backup_${new Date().toISOString().split('T')[0]}.kdbx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage('success', 'Base de datos KDBX exportada exitosamente.');
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error al exportar a KDBX.');
    } finally {
      setIsExporting(false);
      setModalPassword('');
    }
  };

  const openImportDialog = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImportFile(file);
    setImportModalOpen(true);
    e.target.value = '';
  };

  const handleImportConfirm = async () => {
    if (!modalPassword || !pendingImportFile) {
      showMessage('error', 'Debes ingresar la contraseña del archivo a cargar.');
      return;
    }
    try {
      setImportModalOpen(false);
      setIsImporting(true);
      
      const rawEntries = await importFromKdbxReal(pendingImportFile, modalPassword);
      
      const user = await getUserProfile('user-1');
      const salt = user?.masterKeySalt || 'default-salt';
      
      const importedPasswords: PasswordEntry[] = [];
      for (const entry of rawEntries) {
        const { encrypted, iv } = await encrypt(entry.password, masterKey, salt);
        importedPasswords.push({
          id: crypto.randomUUID(),
          userId: 'user-1',
          siteId: 'custom',
          siteName: entry.title || 'Importado',
          siteUrl: entry.url || '',
          siteIcon: '',
          siteColor: '#64748b',
          username: entry.username || '',
          encryptedPassword: encrypted,
          iv: iv,
          group: 'Importado',
          strength: 'medium',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastAccessedAt: Date.now()
        });
      }

      await importAllData({ passwords: importedPasswords });
      
      showMessage('success', 'Bóveda importada exitosamente desde KDBX. Recarga para ver los cambios.');
    } catch (err: any) {
      console.error(err);
      showMessage('error', `Error al importar: ${err.message || 'Contraseña incorrecta o archivo inválido'}.`);
    } finally {
      setIsImporting(false);
      setPendingImportFile(null);
      setModalPassword('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configuración</h2>
        <p className="text-muted-foreground mt-1">
          Administra tu bóveda de seguridad, exporta copias de respaldo y ajusta tus preferencias.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
          {message.text}
        </div>
      )}

      {/* Backup & Restore */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Save className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Respaldo y Restauración</h3>
          </div>
          <p className="text-sm text-muted-foreground ml-13">
            Mantén tus contraseñas seguras exportando una copia local encriptada de tu bóveda.
          </p>
        </div>
        
        <div className="p-6 grid gap-6 sm:grid-cols-2">
          {/* Export */}
          <div className="bg-muted/30 p-5 rounded-xl border border-border space-y-4">
            <div>
              <h4 className="font-medium text-foreground">Exportar Bóveda</h4>
              <p className="text-sm text-muted-foreground mt-1">Descarga un archivo .kdbx encriptado con todas tus contraseñas.</p>
            </div>
            <button 
              onClick={() => setExportModalOpen(true)}
              disabled={isExporting}
              className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exportando...' : 'Exportar a .kdbx'}
            </button>
          </div>

          {/* Import */}
          <div className="bg-muted/30 p-5 rounded-xl border border-border space-y-4">
            <div>
              <h4 className="font-medium text-foreground">Importar Bóveda</h4>
              <p className="text-sm text-muted-foreground mt-1">Restaura tus contraseñas desde un archivo de respaldo previo.</p>
            </div>
            
            <label className="w-full py-2.5 bg-muted hover:bg-muted/80 border border-border text-foreground hover:text-primary rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{isImporting ? 'Importando...' : 'Seleccionar archivo .kdbx'}</span>
              <input 
                type="file" 
                accept=".kdbx" 
                className="hidden" 
                onChange={openImportDialog}
                disabled={isImporting}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Password Prompt Modal */}
      {(exportModalOpen || importModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {exportModalOpen ? 'Proteger Archivo KDBX' : 'Desbloquear Archivo KDBX'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ingrese la contraseña maestra que se usará para {exportModalOpen ? 'cifrar' : 'abrir'} el archivo KDBX.
            </p>
            <div className="relative mb-6">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                autoFocus
                value={modalPassword}
                onChange={(e) => setModalPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-lg py-2.5 pl-10 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                placeholder="Contraseña del archivo"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    exportModalOpen ? handleExportConfirm() : handleImportConfirm();
                  }
                }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setExportModalOpen(false);
                  setImportModalOpen(false);
                  setPendingImportFile(null);
                  setModalPassword('');
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={exportModalOpen ? handleExportConfirm : handleImportConfirm}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg text-sm transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">Zona de Peligro</h3>
              <p className="text-sm text-muted-foreground">Acciones irreversibles para tu cuenta.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
          <div>
            <h4 className="font-medium text-foreground">Cerrar Sesión</h4>
            <p className="text-sm text-muted-foreground">Bloquea tu bóveda y sale de la aplicación.</p>
          </div>
          <button 
            onClick={onLogout}
            className="px-5 py-2.5 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
          <div>
            <h4 className="font-medium text-foreground">Eliminar Cuenta</h4>
            <p className="text-sm text-muted-foreground">Borra todos tus datos permanentemente (Irreversible).</p>
          </div>
          <button 
            onClick={onDeleteAccount}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-red-500/20"
          >
            <ShieldAlert className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
