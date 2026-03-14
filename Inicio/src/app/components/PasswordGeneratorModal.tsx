import { useState, useEffect } from 'react';
import { Copy, RefreshCw, ExternalLink, Check, EyeOff, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { generatePassword } from '../lib/password-generator';
import { PasswordGeneratorOptions, CatalogSite } from '../types';

interface PasswordGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: CatalogSite | { id: string, name: string, url: string, icon: string } | null;
  onSave: (username: string, password: string, siteProps: any) => void;
}

export function PasswordGeneratorModal({ isOpen, onClose, site, onSave }: PasswordGeneratorModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  
  const [strength, setStrength] = useState<'strong'|'medium'|'weak'>('strong');

  const regenerate = () => {
    const generated = generatePassword(options);
    setPassword(generated.password);
    setStrength(generated.strength);
  };

  // Generate initial password when modal opens
  useEffect(() => {
    if (isOpen) {
      regenerate();
      setUsername('');
      setCopied(false);
    }
  }, [isOpen]);

  // Handle options changes
  useEffect(() => {
    regenerate();
  }, [options]);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenSite = () => {
    if (site?.url) {
      window.open(site.url, '_blank');
    }
  };

  const handleSave = () => {
    if (!username || !password || !site) return;
    onSave(username, password, site);
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 'strong': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'weak': return 'text-red-500 bg-red-500/10 border-red-500/20';
    }
  };

  const strengthLabels = {
    strong: 'Fuerte',
    medium: 'Media',
    weak: 'Débil',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {site?.icon && (
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm overflow-hidden"
              style={{ border: `1px solid ${'color' in site && site.color ? site.color : '#ccc'}20` }}
            >
              {site.icon ? (
                <img 
                  src={site.icon} 
                  alt=""
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2NDc0OGIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxsaW5lIHgxPSIyIiB5MT0iMTIiIHgyPSIyMiIgeTE9IjEyIi8+PHBhdGggZD0iTTEyIDJhMTUuMyAxNS4zIDAgMCAxIDQgMTBhMTUuMyAxNS4zIDAgMCAxLTQgMTBhMTUuMyAxNS4zIDAgMCAxLTQtMTBBMTUuMyAxNS4zIDAgMCAxIDEyIDJ6Ii8+PC9zdmc+';
                  }}
                />
              ) : (
                <div className="text-muted-foreground/40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
              )}
            </div>
            )}
            <div>
              <DialogTitle className="text-xl">Cuenta para {site?.name}</DialogTitle>
              <DialogDescription className="text-xs">
                Genera una contraseña segura y regístrate en el sitio.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email / Username Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Correo o Usuario</label>
            <input
              type="text"
              placeholder="ej. usuario@email.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Password Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Contraseña sugerida</label>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStrengthColor()}`}>
                {strengthLabels[strength]}
              </span>
            </div>
            
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                readOnly
                className="w-full pl-4 pr-12 py-3 bg-card border-2 border-border rounded-xl text-lg font-mono tracking-wider focus:outline-none focus:border-primary/50"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button 
                  type="button"
                  onClick={regenerate}
                  className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Generar otra"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Generator Options */}
          <div className="bg-muted/50 p-4 rounded-xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-foreground font-medium">Longitud: {options.length}</label>
              <input 
                type="range" 
                min="8" max="64" 
                value={options.length}
                onChange={(e) => setOptions({...options, length: parseInt(e.target.value)})}
                className="w-1/2 accent-primary"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={options.uppercase}
                  onChange={(e) => setOptions({...options, uppercase: e.target.checked})}
                  className="rounded text-primary focus:ring-primary"
                />
                Mayúsculas (A-Z)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={options.lowercase}
                  onChange={(e) => setOptions({...options, lowercase: e.target.checked})}
                  className="rounded text-primary focus:ring-primary"
                />
                Minúsculas (a-z)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={options.numbers}
                  onChange={(e) => setOptions({...options, numbers: e.target.checked})}
                  className="rounded text-primary focus:ring-primary"
                />
                Números (0-9)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={options.symbols}
                  onChange={(e) => setOptions({...options, symbols: e.target.checked})}
                  className="rounded text-primary focus:ring-primary"
                />
                Símbolos (!@#)
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4 border-t border-border mt-2">
          <div className="flex gap-3">
            <button 
              onClick={handleCopy}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '¡Copiada!' : 'Copiar Contraseña'}
            </button>
            <button 
              onClick={handleOpenSite}
              className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4 text-primary" />
              Ir al Sitio Oficial
            </button>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={!username || !password}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all"
          >
            Guardar en mi bóveda
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
