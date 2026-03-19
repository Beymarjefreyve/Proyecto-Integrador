import { useState } from 'react';
import { ChevronDown, Copy, ExternalLink, Check, Trash2 } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
import { SiteGroupData, PasswordEntry } from '../types';
import { decrypt } from '../lib/crypto';
import { getUserProfile } from '../lib/database';

interface SiteGroupProps {
  groupData: SiteGroupData;
  masterKey: string;
  onDelete?: (id: string) => void;
}

export function SiteGroup({ groupData, masterKey, onDelete }: SiteGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (entry: PasswordEntry) => {
    try {
      const user = await getUserProfile();
      const salt = user?.masterKeySalt || 'default-salt'; // Fallback
      
      const decrypted = await decrypt(entry.encryptedPassword, entry.iv, masterKey, salt);
      await navigator.clipboard.writeText(decrypted);
      
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Error al desencriptar la contraseña', err);
      // Podríamos mostrar un toast de error
    }
  };

  const handleLaunch = (url: string) => {
    window.open(url, '_blank');
  };

  const hasMultiple = groupData.accounts.length > 1;

  // Render a single account row
  const renderAccount = (entry: PasswordEntry, showSiteName = false) => {
    const isCopied = copiedId === entry.id;
    return (
      <div 
        key={entry.id} 
        className={`flex items-center justify-between p-3 rounded-xl transition-all ${hasMultiple ? 'bg-background border border-border mt-2' : ''} group`}
      >
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-medium text-foreground truncate">
            {showSiteName ? `${groupData.siteName} - ${entry.username}` : entry.username}
          </p>
          <p className="text-xs text-muted-foreground truncate">Editado hace poco</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleCopy(entry); }}
            title="Copiar Contraseña"
            className={`p-2 rounded-lg transition-all ${
              isCopied 
                ? 'bg-green-500/20 text-green-500' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground opacity-0 group-hover:opacity-100'
            }`}
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleLaunch(entry.siteUrl); }}
            title="Ir al Sitio Oficial"
            className="p-2 text-muted-foreground hover:bg-muted hover:text-primary rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
              title="Eliminar Contraseña"
              className="p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-muted/30 border border-border rounded-xl p-2 transition-all hover:border-primary/30">
      {hasMultiple ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer text-left">
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm overflow-hidden"
                  style={{ border: `1px solid ${groupData.siteColor || '#ccc'}20` }}
                >
                  {groupData.siteIcon ? (
                    <img 
                      src={groupData.siteIcon} 
                      alt="" // Alt vacío para evitar superposición si falla el src
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
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{groupData.siteName}</h4>
                  <p className="text-xs text-muted-foreground">{groupData.accounts.length} cuentas guardadas</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-2 pb-2">
            <div className="pt-2 pl-[3.25rem] space-y-2 border-l-2 border-border/50 ml-7 mt-2">
              {groupData.accounts.map((acc) => renderAccount(acc, false))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        /* Single Account View */
        <div className="flex items-center p-3">
          <div className="flex items-center gap-4 flex-1">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm overflow-hidden flex-shrink-0"
              style={{ border: `1px solid ${groupData.siteColor || '#ccc'}20` }}
            >
              {groupData.siteIcon ? (
                <img 
                  src={groupData.siteIcon} 
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
            {renderAccount(groupData.accounts[0], true)}
          </div>
        </div>
      )}
    </div>
  );
}
