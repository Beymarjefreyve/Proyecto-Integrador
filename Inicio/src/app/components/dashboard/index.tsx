import { useState } from 'react';
import {
  Shield,
  Lock,
  Key,
  Activity,
  Smartphone,
  Settings,
  Search,
  Plus,
  Bell,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface NavItem {
  name: string;
  icon: React.ElementType;
  active?: boolean;
}

interface PasswordEntry {
  id: number;
  site: string;
  username: string;
  lastAccessed: string;
  strength: 'strong' | 'medium' | 'weak';
}

function App() {
  const [activeSection, setActiveSection] = useState('Dashboard');

  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, active: activeSection === 'Dashboard' },
    { name: 'Vault', icon: Lock, active: activeSection === 'Vault' },
    { name: 'Generador', icon: Key, active: activeSection === 'Generador' },
    { name: 'Monitoreo', icon: Activity, active: activeSection === 'Monitoreo' },
    { name: 'Dispositivos', icon: Smartphone, active: activeSection === 'Dispositivos' },
    { name: 'Configuración', icon: Settings, active: activeSection === 'Configuración' },
  ];

  const securityData = [
    { name: 'Fuertes', value: 42, color: '#10B981' },
    { name: 'Medias', value: 15, color: '#F59E0B' },
    { name: 'Débiles', value: 8, color: '#EF4444' },
  ];

  const recentPasswords: PasswordEntry[] = [
    { id: 1, site: 'GitHub', username: 'user@email.com', lastAccessed: 'Hace 2 horas', strength: 'strong' },
    { id: 2, site: 'Gmail', username: 'personal@gmail.com', lastAccessed: 'Hace 5 horas', strength: 'strong' },
    { id: 3, site: 'LinkedIn', username: 'professional@mail.com', lastAccessed: 'Hace 1 día', strength: 'medium' },
    { id: 4, site: 'Twitter', username: '@username', lastAccessed: 'Hace 2 días', strength: 'weak' },
    { id: 5, site: 'Netflix', username: 'family@email.com', lastAccessed: 'Hace 3 días', strength: 'strong' },
    { id: 6, site: 'Dropbox', username: 'work@company.com', lastAccessed: 'Hace 3 días', strength: 'strong' },
    { id: 7, site: 'Amazon', username: 'shopping@email.com', lastAccessed: 'Hace 4 días', strength: 'medium' },
    { id: 8, site: 'Spotify', username: 'music@email.com', lastAccessed: 'Hace 5 días', strength: 'strong' },
    { id: 9, site: 'PayPal', username: 'payments@email.com', lastAccessed: 'Hace 6 días', strength: 'strong' },
    { id: 10, site: 'Slack', username: 'team@workspace.com', lastAccessed: 'Hace 1 semana', strength: 'medium' },
    { id: 11, site: 'Facebook', username: 'social@email.com', lastAccessed: 'Hace 1 semana', strength: 'weak' },
    { id: 12, site: 'Instagram', username: '@myhandle', lastAccessed: 'Hace 2 semanas', strength: 'medium' },
    { id: 13, site: 'Discord', username: 'gamer#1234', lastAccessed: 'Hace 2 semanas', strength: 'strong' },
    { id: 14, site: 'Figma', username: 'designer@studio.com', lastAccessed: 'Hace 2 semanas', strength: 'strong' },
    { id: 15, site: 'Notion', username: 'notes@email.com', lastAccessed: 'Hace 3 semanas', strength: 'weak' },
  ];

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'weak': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'strong': return 'Fuerte';
      case 'medium': return 'Media';
      case 'weak': return 'Débil';
      default: return '';
    }
  };

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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${item.active
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
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent cursor-pointer hover:bg-sidebar-accent/80 transition-colors" onClick={() => window.location.href = "/"}>
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-sidebar-foreground truncate">Cerrar Sesión</p>
              <p className="text-xs text-muted-foreground truncate">Volver al inicio</p>
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
                  className="w-full pl-12 pr-4 py-3 bg-input-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 ml-8">
              <button className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-primary/30">
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

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Passwords */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <div className="text-right">
                  <p className="text-3xl text-foreground">65</p>
                  <p className="text-xs text-muted-foreground mt-1">Total</p>
                </div>
              </div>
              <h3 className="text-sm text-muted-foreground">Contraseñas guardadas</h3>
              <div className="mt-3 flex items-center gap-1 text-green-500 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>+5 este mes</span>
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
                <span>Hace 5 minutos</span>
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

            <div className="space-y-3">
              {recentPasswords.map((password) => (
                <div
                  key={password.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-all group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm text-foreground truncate">{password.site}</h4>
                      <p className="text-xs text-muted-foreground truncate">{password.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">{password.lastAccessed}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStrengthColor(password.strength)}`}></div>
                      <span className="text-xs text-muted-foreground w-14">{getStrengthText(password.strength)}</span>
                    </div>
                    <button className="p-2 hover:bg-card rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;