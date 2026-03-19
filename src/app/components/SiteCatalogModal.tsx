import React, { useState, useMemo, useEffect } from 'react';
import { Search, Globe, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { sitesCatalog } from '../data/sites-catalog';
import { CatalogSite, SiteCategory } from '../types';

interface SiteCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSite: (site: CatalogSite | { id: string; name: string; url: string; icon: string; category?: string; color?: string }) => void;
}

export function SiteCatalogModal({ isOpen, onClose, onSelectSite }: SiteCatalogModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');

  // Limpiar campos al cerrar o abrir el modal
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setCustomUrl('');
      setCustomName('');
    }
  }, [isOpen]);

  const filteredSites = useMemo(() => {
    if (!searchQuery) return sitesCatalog;
    return sitesCatalog.filter(site => 
      site.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl) return;
    
    let formattedUrl = customUrl;
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      const urlObj = new URL(formattedUrl);
      const name = customName || urlObj.hostname.replace('www.', '');
      onSelectSite({
        id: `custom-${name}-${Date.now()}`,
        name: name,
        url: formattedUrl,
        icon: '', // Usar icono por defecto para ingresos manuales
      });
    } catch (err) {
      // Si la URL es inválida
      const name = customName || customUrl;
      onSelectSite({
        id: `custom-${name}-${Date.now()}`,
        name: name,
        url: formattedUrl,
        icon: '',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col pt-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Agregar Contraseña</DialogTitle>
          <DialogDescription>
            Selecciona el sitio para el cual deseas crear una contraseña, o ingresa una URL personalizada.
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar sitios populares (ej. Netflix, GitHub)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Sites Grid */}
        <div className="flex-1 overflow-y-auto mt-4 px-1 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredSites.map((site) => (
              <button
                key={site.id}
                onClick={() => onSelectSite(site)}
                className="flex flex-col items-center justify-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-all group"
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm overflow-hidden"
                  style={{ border: `1px solid ${site.color}20` }}
                >
                  <img 
                    src={site.icon} 
                    alt={site.name} 
                    className="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PGxpbmUgeDE9IjIiIHkxPSIxMiIgeDI9IjIyIiB5MT0iMTIiLz48cGF0aCBkPSJNMTIgMmExNS4zIDE1LjMgMCAwIDEgNCAxMGExNS4zIDE1LjMgMCAwIDEtNCAxMGExNS4zIDE1LjMgMCAwIDEtNC0xMEExNS4zIDE1LjMgMCAwIDEgMTIgMnoiLz48L3N2Zz4=';
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground">{site.name}</span>
              </button>
            ))}
          </div>

          {filteredSites.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron sitios que coincidan con tu búsqueda.
            </div>
          )}
        </div>

        {/* Custom URL Section */}
        <div className="pt-4 border-t border-border mt-auto">
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-[1.5]">
                <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nombre del sitio (ej. Mi Empresa)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="relative flex-[2]">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="URL (ej. mi-empresa.com)"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!customUrl}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar Personalizado
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
