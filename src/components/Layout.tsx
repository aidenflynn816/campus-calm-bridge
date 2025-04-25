
import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Home, 
  LogOut, 
  Users, 
  BarChart, 
  SmilePlus 
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Navigation items based on user role
  const navItems = user?.role === 'student' 
    ? [
        { path: '/student', icon: <Home size={20} />, label: 'Dashboard' },
        { path: '/student/book', icon: <Calendar size={20} />, label: 'Book Meeting' },
        { path: '/student/appointments', icon: <Calendar size={20} />, label: 'Appointments' },
        { path: '/student/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
        { path: '/student/resources', icon: <BookOpen size={20} />, label: 'Resources' },
        { path: '/student/mood', icon: <SmilePlus size={20} />, label: 'Mood Check-in' },
      ]
    : [
        { path: '/counselor', icon: <Home size={20} />, label: 'Dashboard' },
        { path: '/counselor/students', icon: <Users size={20} />, label: 'Students' },
        { path: '/counselor/appointments', icon: <Calendar size={20} />, label: 'Appointments' },
        { path: '/counselor/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
        { path: '/counselor/resources', icon: <BookOpen size={20} />, label: 'Resources' },
        { path: '/counselor/mood-insights', icon: <BarChart size={20} />, label: 'Mood Insights' },
      ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bridge-background">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 lg:w-72 bg-white border-r border-bridge-muted/30 flex-col">
        <div className="p-6 flex items-center space-x-3 border-b border-bridge-muted/30">
          <img 
            src="/lovable-uploads/ca0b6e19-c587-4ef5-9c6e-a46c2594cffc.png" 
            alt="Bridge Logo" 
            className="w-10 h-10"
          />
          <h1 className="text-xl font-medium text-bridge-primary">Bridge</h1>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                    isActive(item.path)
                      ? 'bg-bridge-primary text-white'
                      : 'text-bridge-text hover:bg-bridge-muted/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-bridge-muted/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-bridge-accent flex items-center justify-center text-bridge-primary font-medium">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium">{user?.name || 'User'}</p>
                <p className="text-sm text-bridge-text/70">{user?.role === 'student' ? 'Student' : 'Counselor'}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => signOut()}
            className="w-full flex items-center space-x-2 px-4 py-2 rounded-2xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden bg-white border-b border-bridge-muted/30 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/ca0b6e19-c587-4ef5-9c6e-a46c2594cffc.png" 
                alt="Bridge Logo" 
                className="w-8 h-8"
              />
              <h1 className="text-lg font-medium text-bridge-primary">Bridge</h1>
            </div>
            
            {/* Mobile user info */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-bridge-accent flex items-center justify-center text-bridge-primary font-medium">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
        
        {/* Mobile navigation */}
        <nav className="md:hidden bg-white border-t border-bridge-muted/30 py-2">
          <ul className="grid grid-cols-5 gap-1">
            {navItems.slice(0, 5).map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex flex-col items-center justify-center p-2 ${
                    isActive(item.path)
                      ? 'text-bridge-primary'
                      : 'text-bridge-text/70'
                  }`}
                >
                  {item.icon}
                  <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
