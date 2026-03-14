import { useState } from 'react';
import { Download, Upload, Save, ShieldAlert, LogOut } from 'lucide-react';
import { getAllData, exportToKdbx, importFromKdbx, importAllData } from '../lib/database';
import { PasswordEntry, UserProfile } from '../types';

interface SettingsViewProps {
  masterKey: string;
  onLogout?: () => void;
}

export function SettingsView({ masterKey, onLogout }: SettingsViewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await getAllData();
      
      const blob = await exportToKdbx(data, masterKey);
      
      // Crear un enlace temporal para descargar el archivo
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SecureVault_Backup_${new Date().toISOString().split('T')[0]}.kdbx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage('success', 'Base de datos exportada exitosamente.');
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error al exportar la base de datos.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      
      // En una implementación real pediríamos la contraseña del archivo,
      // pero aquí usamos la masterKey actual por simplicidad en esta fase.
      const data = await importFromKdbx<{ passwords: PasswordEntry[], user?: UserProfile }>(file, masterKey);
      
      await importAllData(data);
      
      showMessage('success', 'Base de datos importada exitosamente. Recarga la página para ver los cambios.');
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error al importar. ¿La clave maestra es correcta?');
    } finally {
      setIsImporting(false);
      // Limpiar input file
      e.target.value = '';
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
              onClick={handleExport}
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
                onChange={handleImport}
                disabled={isImporting}
              />
            </label>
          </div>
        </div>
      </div>

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
      </div>
    </div>
  );
}
