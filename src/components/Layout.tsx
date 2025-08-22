
import { ReactNode, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EmergencyButton } from './EmergencyButton';
import { 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Home, 
  LogOut, 
  Users, 
  BarChart, 
  SmilePlus,
  ChevronLeft,
  Menu,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = user?.role === 'student'
    ? [
        { path: '/student', icon: <Home size={20} />, label: 'Dashboard' },
        { path: '/student/counselors', icon: <Users size={20} />, label: 'Counselors' },
        { path: '/student/resources', icon: <BookOpen size={20} />, label: 'Resources' },
        { path: '/student/mood', icon: <SmilePlus size={20} />, label: 'Mood Check-in' },
        { path: '/student/profile', icon: <User size={20} />, label: 'Profile' },
      ]
     : [
        { path: '/counselor/students', icon: <Users size={20} />, label: 'Students' },
        { path: '/counselor/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
        { path: '/counselor/resources', icon: <BookOpen size={20} />, label: 'Resources' },
        { path: '/counselor/mood-insights', icon: <BarChart size={20} />, label: 'Mood Insights' },
        { path: '/counselor/profile', icon: <User size={20} />, label: 'Profile' },
      ];

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 md:hidden flex flex-col shadow-lg"
            >
              <div className="p-5 flex items-center space-x-3 border-b border-muted/30">
                <img 
                  src="/lovable-uploads/c07e7cef-cb7e-48d7-a0eb-c68a0c5f5175.png" 
                  alt="Groton School Crest" 
                  className="w-10 h-10"
                />
                <h1 className="text-lg font-medium text-primary">Counseling Center</h1>
                
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="ml-auto hover:bg-muted/20 rounded-full p-2"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
              
              <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                          isActive(item.path)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-foreground hover:bg-muted/50'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              
              <div className="p-4 border-t border-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 bg-accent text-primary">
                      <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.name || 'User'}</p>
                      <p className="text-sm text-foreground/70">{user?.role === 'student' ? 'Student' : 'Counselor'}</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => signOut()}
                  className="w-full flex items-center space-x-2 px-4 py-2 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  variant="ghost"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 lg:w-72 bg-white border-r border-muted/30 flex-col shadow-sm">
        <div className="p-6 flex items-center space-x-3 border-b border-muted/30">
          <img 
            src="/lovable-uploads/c07e7cef-cb7e-48d7-a0eb-c68a0c5f5175.png" 
            alt="Groton School Crest" 
            className="w-10 h-10"
          />
          <h1 className="text-lg font-medium text-primary">Counseling Center</h1>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <motion.li 
                key={item.path}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-muted/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-muted/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 bg-accent text-primary">
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name || 'User'}</p>
                <p className="text-sm text-foreground/70">{user?.role === 'student' ? 'Student' : 'Counselor'}</p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => signOut()}
            className="w-full flex items-center space-x-2 px-4 py-2 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            variant="ghost"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-muted/30 p-4 sticky top-0 z-30 shadow-sm">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-muted/20"
            >
              <Menu size={22} />
            </Button>
            
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/c07e7cef-cb7e-48d7-a0eb-c68a0c5f5175.png" 
                alt="Groton School Crest" 
                className="w-8 h-8"
              />
              <h1 className="text-base font-medium text-primary">Counseling</h1>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/20">
                  <Avatar className="h-8 w-8 bg-accent text-primary">
                    <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
          <EmergencyButton />
        </main>
        
        {/* Mobile Nav */}
        <nav className="md:hidden bg-white border-t border-muted/30 py-2 sticky bottom-0 z-30 shadow-sm">
          <ul className="grid grid-cols-5 gap-1">
            {navItems.slice(0, 5).map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex flex-col items-center justify-center p-2 ${
                    isActive(item.path)
                      ? 'text-primary'
                      : 'text-foreground/70'
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
