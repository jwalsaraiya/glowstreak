
import React, { useState } from 'react';
import { Bell, Calendar, Home, Menu, PieChart, Plus, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useLocation, Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

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
}

const Navbar: React.FC<NavbarProps> = ({ onCreateHabit }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const closeMenu = () => {
    if (isMobile) setIsOpen(false);
  };

  const sidebarClasses = cn(
    "h-screen border-r flex flex-col justify-between p-2 md:p-4 transition-all duration-300",
    isMobile ? (
      isOpen 
        ? "fixed inset-y-0 left-0 w-64 z-50 bg-background shadow-lg transform translate-x-0" 
        : "fixed inset-y-0 left-0 w-64 z-50 bg-background shadow-lg transform -translate-x-full"
    ) : "w-16 md:w-64 relative"
  );

  return (
    <>
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-4 left-4 z-40 md:hidden bg-background/80 backdrop-blur-sm border"
          onClick={toggleMenu}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}
      
      <div className={sidebarClasses}>
        <div className="space-y-4">
          <div className="flex items-center mb-6 justify-center md:justify-start">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">GS</span>
              </div>
              {(!isMobile || isOpen) && <h1 className="text-xl font-bold hidden md:block">GlowStreak</h1>}
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => {
                onCreateHabit();
                closeMenu();
              }}
              className="w-full gap-1 md:gap-2 bg-primary hover:bg-primary/90 px-2 md:px-4"
            >
              <Plus className="h-5 w-5" />
              {(!isMobile || isOpen) && <span className="hidden md:inline">New Habit</span>}
            </Button>
            
            <Button
              onClick={() => {
                onCreateHabit();
                closeMenu();
              }}
              variant="outline"
              className="w-full gap-1 md:gap-2 px-2 md:px-4"
            >
              <Plus className="h-5 w-5" />
              {(!isMobile || isOpen) && <span className="hidden md:inline">One-time Task</span>}
            </Button>
          </div>

          <div className="space-y-1 mt-6">
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
          <div className="space-y-1">
            <NavItem
              icon={Settings}
              label="Settings"
              to="/settings"
              active={currentPath === "/settings"}
              compact={isMobile && !isOpen}
              onClick={closeMenu}
            />
          </div>

          <div className="pt-4 border-t flex items-center justify-center md:justify-start">
            <Avatar className="h-9 w-9 mr-2">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
            {(!isMobile || isOpen) && (
              <div className="text-sm hidden md:block">
                <div className="font-medium">User</div>
                <div className="text-muted-foreground text-xs">user@example.com</div>
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
