
import React, { useState } from 'react';
import { Bell, Calendar, Home, Menu, PieChart, Plus, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useLocation, Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, to, active, compact, onClick }) => {
  return (
    <Link to={to} onClick={onClick}>
      <Button
        variant={active ? "default" : "ghost"}
        className={cn(
          "w-full justify-start",
          active ? "bg-primary text-primary-foreground" : "",
          compact ? "px-2" : ""
        )}
      >
        <Icon className="h-5 w-5" />
        {!compact && <span className="ml-2">{label}</span>}
      </Button>
    </Link>
  );
};

interface NavbarProps {
  onCreateHabit: () => void;
  onCreateOneTime: () => void;
  onCreateEvent: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onCreateHabit, onCreateOneTime, onCreateEvent }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const closeMenu = () => {
    if (isMobile) setIsOpen(false);
  };

  const sidebarClasses = cn(
    "h-screen border-r flex flex-col justify-between p-2 md:p-4 transition-all duration-300 bg-background z-50",
    isMobile ? (
      isOpen 
        ? "fixed inset-y-0 left-0 right-0 max-w-[280px] ml-auto w-full shadow-lg transform translate-x-0" 
        : "fixed inset-y-0 left-0 right-0 max-w-[280px] ml-auto w-full shadow-lg transform translate-x-full"
    ) : "w-16 md:w-64 relative"
  );

  return (
    <>
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-4 right-4 z-40 md:hidden bg-background/80 backdrop-blur-sm border shadow-sm"
          onClick={toggleMenu}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}
      
      <div className={sidebarClasses}>
        <div className="space-y-6">
          <div className="flex items-center mb-6 justify-center md:justify-start">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">GS</span>
              </div>
              {(!isMobile || isOpen) && <h1 className="text-xl font-bold hidden md:block">GlowStreak</h1>}
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => {
                onCreateHabit();
                closeMenu();
              }}
              className="w-full gap-1 md:gap-2 bg-primary/20 hover:bg-primary/30 text-primary-foreground px-2 md:px-4"
            >
              <Plus className="h-5 w-5" />
              {(!isMobile || isOpen) && <span className={cn("md:inline", isOpen ? "inline" : "hidden")}>New Habit</span>}
            </Button>
            
            <Button
              onClick={() => {
                onCreateOneTime();
                closeMenu();
              }}
              className="w-full gap-1 md:gap-2 px-2 md:px-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-900"
            >
              <Plus className="h-5 w-5" />
              {(!isMobile || isOpen) && <span className={cn("md:inline", isOpen ? "inline" : "hidden")}>New Task</span>}
            </Button>
            
            <Button
              onClick={() => {
                onCreateEvent();
                closeMenu();
              }}
              className="w-full gap-1 md:gap-2 px-2 md:px-4 bg-blue-100 hover:bg-blue-200 text-blue-900"
            >
              <Calendar className="h-5 w-5" />
              {(!isMobile || isOpen) && <span className={cn("md:inline", isOpen ? "inline" : "hidden")}>New Event</span>}
            </Button>
          </div>

          <div className="space-y-3 mt-6">
            <NavItem
              icon={Home}
              label="Dashboard"
              to="/"
              active={currentPath === "/"}
              compact={isMobile && !isOpen}
              onClick={closeMenu}
            />
            <NavItem
              icon={Calendar}
              label="Calendar"
              to="/calendar"
              active={currentPath === "/calendar"}
              compact={isMobile && !isOpen}
              onClick={closeMenu}
            />
            <NavItem
              icon={PieChart}
              label="Analytics"
              to="/analytics"
              active={currentPath === "/analytics"}
              compact={isMobile && !isOpen}
              onClick={closeMenu}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <NavItem
              icon={Settings}
              label="Settings"
              to="/settings"
              active={currentPath === "/settings"}
              compact={isMobile && !isOpen}
              onClick={closeMenu}
            />
          </div>

          <div className="pt-4 border-t flex items-center justify-start">
            <Avatar className="h-9 w-9 mr-2">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>{user?.username?.substring(0, 2) || 'US'}</AvatarFallback>
            </Avatar>
            {(!isMobile || isOpen) && (
              <div className="text-sm">
                <div className="font-medium">{user?.username || 'User'}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={closeMenu}
        />
      )}
    </>
  );
};

export default Navbar;
