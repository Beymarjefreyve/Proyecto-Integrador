import { useState, useEffect, useMemo } from 'react';
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
  Smartphone,
  LayoutDashboard
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import { SiteCatalogModal } from './components/SiteCatalogModal';
import { PasswordGeneratorModal } from './components/PasswordGeneratorModal';
import { SiteGroup } from './components/SiteGroup';
import { SettingsView } from './components/SettingsView';
import { CatalogSite, PasswordEntry, SiteGroupData } from './types';
import { getAllPasswordEntries, addPasswordEntry, getUserProfile, saveUserProfile } from './lib/database';
import { encrypt, generateSalt, hashMasterPassword } from './lib/crypto';

// Clave maestra temporal estática (hasta que se implemente el login)
const MASTER_KEY = 'mi-clave-maestra-super-secreta';

interface NavItem {
  name: string;
  icon: React.ElementType;
  active?: boolean;
}

function App() {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<CatalogSite | { id: 'custom', name: string, url: string, icon: string } | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Inicializar DB y cargar contraseñas
  const loadData = async () => {
    try {
      // 1. Asegurar que existe un perfil de usuario para tener algo de salt
      let user = await getUserProfile();
      if (!user) {
        const salt = generateSalt();
        const hash = await hashMasterPassword(MASTER_KEY, salt);
        user = {
          id: 'user-1',
          name: 'Usuario Pro',
          email: 'user@email.com',
          masterKeyHash: hash,
          masterKeySalt: salt,
          createdAt: Date.now()
        };
        await saveUserProfile(user);
      }

      // 2. Cargar contraseñas
      const entries = await getAllPasswordEntries();
      setPasswords(entries);
      setLastSync(new Date());
    } catch (err) {
      console.error('Error cargando datos de DB', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectSite = (site: CatalogSite | { id: 'custom', name: string, url: string, icon: string }) => {
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
        siteId: siteProps.id,
        siteName: siteProps.name,
        siteUrl: siteProps.url,
        siteIcon: siteProps.icon,
        siteColor: siteProps.color || '#cccccc',
        username,
        encryptedPassword: encrypted,
        iv,
        group: 'personal',
        strength: 'strong' // En un caso real vendría del generador
      });

      // Refrescar lista
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
    
    // Filtrar primero
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

  const securityData = [
    { name: 'Fuertes', value: 42, color: '#10B981' },
    { name: 'Medias', value: 15, color: '#F59E0B' },
    { name: 'Débiles', value: 8, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg tracking-tight text-sidebar-foreground">SecureVault</h1>
              <p className="text-xs text-muted-foreground">Password Manager</p>
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
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/30'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                    style={item.active ? { boxShadow: '0 0 20px rgba(37, 99, 235, 0.3)' } : {}}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-sidebar-foreground truncate">Usuario Pro</p>
              <p className="text-xs text-muted-foreground truncate">user@email.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-card/95">
          <div className="px-8 py-4 flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar contraseñas, sitios, usuarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 ml-8">
              <button 
                onClick={() => setIsCatalogOpen(true)}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-primary/30"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Agregar contraseña</span>
              </button>

              <button className="relative p-2.5 hover:bg-muted rounded-lg transition-all">
                <Bell className="w-5 h-5 text-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
              </button>

              <button className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-primary/30 transition-all">
                <User className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeSection === 'Dashboard' ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Total Passwords */}
                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl text-foreground">{passwords.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total</p>
                    </div>
                  </div>
                  <h3 className="text-sm text-muted-foreground">Contraseñas guardadas</h3>
                  <div className="mt-3 flex items-center gap-1 text-green-500 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>+0 este mes</span>
                  </div>
                </div>

                {/* Last Sync */}
                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-accent/10 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-accent">Actualizado</p>
                      <p className="text-xs text-muted-foreground mt-1">Estado</p>
                    </div>
                  </div>
                  <h3 className="text-sm text-muted-foreground">Última sincronización</h3>
                  <div className="mt-3 flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Devices */}
                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl text-foreground">4</p>
                      <p className="text-xs text-muted-foreground mt-1">Activos</p>
                    </div>
                  </div>
                  <h3 className="text-sm text-muted-foreground">Dispositivos conectados</h3>
                  <div className="mt-3">
                    <button className="text-xs text-primary hover:underline">Gestionar →</button>
                  </div>
                </div>
              </div>

              {/* Main Password List */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg text-foreground mb-1">Todas las Contraseñas</h2>
                    <p className="text-sm text-muted-foreground">Gestiona tu bóveda de contraseñas</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select className="px-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>Todas</option>
                      <option>Fuertes</option>
                      <option>Medias</option>
                      <option>Débiles</option>
                    </select>
                    <button className="text-sm text-primary hover:underline">Ordenar</button>
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
                    <div className="text-center py-12 bg-muted/30 border border-dashed border-border rounded-xl">
                      <Lock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-foreground mb-1">No hay contraseñas</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                        Agrega tu primera contraseña para comenzar a proteger tus cuentas con SecureVault.
                      </p>
                      <button 
                        onClick={() => setIsCatalogOpen(true)}
                        className="px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
                      >
                        Agregar mi primera contraseña
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <SettingsView masterKey={MASTER_KEY} />
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