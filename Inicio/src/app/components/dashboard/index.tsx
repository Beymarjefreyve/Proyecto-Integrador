import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { 
  Shield, 
  Lock, 
  Settings,
  Search,
  Plus,
  Bell,
  User,
  CheckCircle2,
  Clock,
  TrendingUp,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import { SiteCatalogModal } from '../SiteCatalogModal';
import { PasswordGeneratorModal } from '../PasswordGeneratorModal';
import { SiteGroup } from '../SiteGroup';
import { SettingsView } from '../SettingsView';
import { CatalogSite, PasswordEntry, SiteGroupData } from '../../types';
import { 
  getAllPasswordEntries, 
  addPasswordEntry, 
  updatePasswordEntry,
  getUserProfile, 
  saveUserProfile 
} from '../../lib/database';
import { encrypt, generateSalt, hashMasterPassword } from '../../lib/crypto';

// Clave maestra temporal estática (hasta que se implemente el login)
const MASTER_KEY = 'mi-clave-maestra-super-secreta';

interface NavItem {
  name: string;
  icon: React.ElementType;
  active?: boolean;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedUserName = location.state?.userName || 'Usuario';
  const userId = location.state?.userId || 'user-1';

  const [activeSection, setActiveSection] = useState('Dashboard');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<CatalogSite | { id: string, name: string, url: string, icon: string, category?: string, color?: string } | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Inicializar DB y cargar contraseñas
  const loadData = async () => {
    try {
      let user = await getUserProfile(userId);
      if (!user) {
        // Migration check: if there's only one user in localStorage, 
        // maybe we can reuse their profile or just create a new one for this ID
        const salt = generateSalt();
        const hash = await hashMasterPassword(MASTER_KEY, salt);
        user = {
          id: userId,
          name: loggedUserName,
          email: '',
          masterKeyHash: hash,
          masterKeySalt: salt,
          createdAt: Date.now()
        };
        await saveUserProfile(user);
      }

      const entries = await getAllPasswordEntries(userId);
      
      // Basic Migration: If this user has 0 passwords but there are "old" passwords 
      // with no userId (undefined), assign them to this user if they are the first user.
      if (entries.length === 0) {
        const allPossible = await getAllPasswordEntries('user-1'); // Check default user-1
        if (allPossible.length > 0) {
          for (const entry of allPossible) {
            await updatePasswordEntry(entry.id, { userId: userId });
          }
          const migrated = await getAllPasswordEntries(userId);
          setPasswords(migrated);
        } else {
          setPasswords(entries);
        }
      } else {
        setPasswords(entries);
      }
      
      setLastSync(new Date());
    } catch (err) {
      console.error('Error cargando datos de DB', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectSite = (site: CatalogSite | { id: string, name: string, url: string, icon: string, category?: string, color?: string }) => {
    setSelectedSite(site);
    setIsCatalogOpen(false);
    setIsGeneratorOpen(true);
  };

  const handleSavePassword = async (username: string, password: string, siteProps: any) => {
    try {
      const user = await getUserProfile();
      const salt = user?.masterKeySalt || 'default-salt';
      
      const { encrypted, iv } = await encrypt(password, MASTER_KEY, salt);

      await addPasswordEntry({
        userId,
        siteId: siteProps.id,
        siteName: siteProps.name,
        siteUrl: siteProps.url,
        siteIcon: siteProps.icon,
        siteColor: siteProps.color || '#cccccc',
        username,
        encryptedPassword: encrypted,
        iv,
        group: 'personal',
        strength: 'strong'
      });

      await loadData();
      
      setIsGeneratorOpen(false);
      setSelectedSite(null);
    } catch (err) {
      console.error('Error guardando contraseña', err);
    }
  };

  // Group passwords by site
  const groupedSites = useMemo(() => {
    const groupsMap = new Map<string, SiteGroupData>();
    
    const filtered = passwords.filter(p => 
      p.siteName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    for (const entry of filtered) {
      const key = entry.siteId;
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          siteId: key,
          siteName: entry.siteName,
          siteUrl: entry.siteUrl,
          siteIcon: entry.siteIcon,
          siteColor: entry.siteColor,
          accounts: []
        });
      }
      groupsMap.get(key)!.accounts.push(entry);
    }

    return Array.from(groupsMap.values()).sort((a, b) => a.siteName.localeCompare(b.siteName));
  }, [passwords, searchQuery]);

  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, active: activeSection === 'Dashboard' },
    { name: 'Configuración', icon: Settings, active: activeSection === 'Configuración' },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E293B] border-r border-[#00D4FF]/20 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-[#00D4FF]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00D4FF] to-[#00A0CC] rounded-xl flex items-center justify-center shadow-lg shadow-[#00D4FF]/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg tracking-tight text-white">SecureVault</h1>
              <p className="text-xs text-[#F1F5F9]/50">Password Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <button
                    onClick={() => setActiveSection(item.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      item.active
                        ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30'
                        : 'text-[#F1F5F9]/60 hover:bg-[#00D4FF]/10 hover:text-[#00D4FF]'
                    }`}
                    style={item.active ? { boxShadow: '0 0 20px rgba(0, 212, 255, 0.15)' } : {}}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section + Logout */}
        <div className="p-4 border-t border-[#00D4FF]/20 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#0F172A]">
            <div className="w-9 h-9 bg-gradient-to-br from-[#00D4FF] to-[#00FF9D] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{loggedUserName}</p>
              <p className="text-xs text-[#F1F5F9]/50 truncate">Autenticado</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#F1F5F9]/60 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-[#1E293B]/95 border-b border-[#00D4FF]/20 sticky top-0 z-10 backdrop-blur-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F1F5F9]/40" />
                <input
                  type="text"
                  placeholder="Buscar contraseñas, sitios, usuarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0F172A] border border-[#00D4FF]/30 rounded-xl text-sm text-white placeholder:text-[#F1F5F9]/30 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 ml-8">
              <button 
                onClick={() => setIsCatalogOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#00A0CC] hover:from-[#00D4FF]/90 hover:to-[#00A0CC]/90 text-white rounded-lg flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-[#00D4FF]/30"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Agregar contraseña</span>
              </button>

              <button className="relative p-2.5 hover:bg-[#00D4FF]/10 rounded-lg transition-all">
                <Bell className="w-5 h-5 text-[#F1F5F9]/70" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00FF9D] rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeSection === 'Dashboard' ? (
            <>
              {/* Stats Cards — only 2 now */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Total Passwords */}
                <div className="bg-[#1E293B] border border-[#00D4FF]/20 rounded-xl p-6 hover:shadow-lg hover:shadow-[#00D4FF]/10 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-[#00D4FF]/10 rounded-lg flex items-center justify-center">
                      <Lock className="w-6 h-6 text-[#00D4FF]" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl text-white">{passwords.length}</p>
                      <p className="text-xs text-[#F1F5F9]/50 mt-1">Total</p>
                    </div>
                  </div>
                  <h3 className="text-sm text-[#F1F5F9]/60">Contraseñas guardadas</h3>
                  <div className="mt-3 flex items-center gap-1 text-[#00FF9D] text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>+0 este mes</span>
                  </div>
                </div>

                {/* Last Sync */}
                <div className="bg-[#1E293B] border border-[#00FF9D]/20 rounded-xl p-6 hover:shadow-lg hover:shadow-[#00FF9D]/10 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-[#00FF9D]/10 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-[#00FF9D]" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#00FF9D]">Actualizado</p>
                      <p className="text-xs text-[#F1F5F9]/50 mt-1">Estado</p>
                    </div>
                  </div>
                  <h3 className="text-sm text-[#F1F5F9]/60">Última sincronización</h3>
                  <div className="mt-3 flex items-center gap-1 text-[#F1F5F9]/50 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {/* Main Password List */}
              <div className="bg-[#1E293B] border border-[#00D4FF]/20 rounded-xl p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg text-white mb-1">Todas las Contraseñas</h2>
                    <p className="text-sm text-[#F1F5F9]/50">Gestiona tu bóveda de contraseñas</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select className="px-4 py-2 bg-[#0F172A] border border-[#00D4FF]/30 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00D4FF]/50">
                      <option>Todas</option>
                      <option>Fuertes</option>
                      <option>Medias</option>
                      <option>Débiles</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {groupedSites.length > 0 ? (
                    groupedSites.map((group) => (
                      <SiteGroup 
                        key={group.siteId} 
                        groupData={group} 
                        masterKey={MASTER_KEY} 
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-[#0F172A] border border-dashed border-[#00D4FF]/30 rounded-xl">
                      <Lock className="w-12 h-12 text-[#00D4FF]/30 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-white mb-1">No hay contraseñas</h3>
                      <p className="text-sm text-[#F1F5F9]/50 max-w-sm mx-auto mb-4">
                        Agrega tu primera contraseña para comenzar a proteger tus cuentas con SecureVault.
                      </p>
                      <button 
                        onClick={() => setIsCatalogOpen(true)}
                        className="px-5 py-2.5 bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 text-[#00D4FF] rounded-lg text-sm transition-colors border border-[#00D4FF]/30"
                      >
                        Agregar mi primera contraseña
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <SettingsView masterKey={MASTER_KEY} onLogout={handleLogout} />
          )}
        </div>
      </main>

      {/* Modals */}
      <SiteCatalogModal 
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectSite={handleSelectSite}
      />
      
      <PasswordGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => {
          setIsGeneratorOpen(false);
          setSelectedSite(null);
        }}
        site={selectedSite}
        onSave={handleSavePassword}
      />
    </div>
  );
}

export default App;