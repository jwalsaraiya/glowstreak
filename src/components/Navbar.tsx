
import React from 'react';
import { Bell, Calendar, Home, PieChart, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useLocation, Link } from 'react-router-dom';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, to, active }) => {
  return (
    <Link to={to}>
      <Button
        variant={active ? "default" : "ghost"}
        className={cn(
          "w-full justify-start",
          active ? "bg-primary text-primary-foreground" : ""
        )}
      >
        <Icon className="mr-2 h-5 w-5" />
        {label}
      </Button>
    </Link>
  );
};

const Navbar: React.FC<{ onCreateHabit: () => void }> = ({ onCreateHabit }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="h-screen border-r flex flex-col justify-between p-4">
      <div className="space-y-4">
        <div className="flex items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">GS</span>
            </div>
            <h1 className="text-xl font-bold">GlowStreak</h1>
          </div>
        </div>

        <Button
          onClick={onCreateHabit}
          className="w-full gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          New Habit
        </Button>

        <div className="space-y-1 mt-6">
          <NavItem
            icon={Home}
            label="Dashboard"
            to="/"
            active={currentPath === "/"}
          />
          <NavItem
            icon={Calendar}
            label="Calendar"
            to="/calendar"
            active={currentPath === "/calendar"}
          />
          <NavItem
            icon={PieChart}
            label="Analytics"
            to="/analytics"
            active={currentPath === "/analytics"}
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
          />
        </div>

        <div className="pt-4 border-t flex items-center">
          <Avatar className="h-9 w-9 mr-2">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div className="font-medium">User</div>
            <div className="text-muted-foreground text-xs">user@example.com</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
