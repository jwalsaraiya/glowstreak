
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BarChart, CalendarDays, ChevronRight, Home, Menu, Plus, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavbarProps {
  onCreateHabit?: () => void;
}

const Navbar = ({ onCreateHabit }: NavbarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const routes = [
    {
      href: '/',
      label: 'Dashboard',
      icon: Home,
      active: location.pathname === '/',
    },
    {
      href: '/calendar',
      label: 'Calendar',
      icon: CalendarDays,
      active: location.pathname === '/calendar',
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: BarChart,
      active: location.pathname === '/analytics',
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
      active: location.pathname === '/settings',
    },
  ];

  const renderNavLinks = () => (
    <div className="flex flex-col space-y-2">
      {routes.map((route) => (
        <Link
          key={route.href}
          to={route.href}
          onClick={() => setIsOpen(false)}
        >
          <Button
            variant={route.active ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start text-base font-normal',
              route.active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''
            )}
          >
            <route.icon className="h-5 w-5 mr-3" />
            {route.label}
            {route.active && <ChevronRight className="h-4 w-4 ml-auto" />}
          </Button>
        </Link>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 px-2 py-2">
        <div className="flex justify-between items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col h-full">
                <div className="py-4">
                  <h2 className="text-xl font-bold mb-6">Habit Tracker</h2>
                  {renderNavLinks()}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex space-x-1">
            {routes.slice(0, 3).map((route) => (
              <Link key={route.href} to={route.href}>
                <Button
                  variant={route.active ? 'default' : 'ghost'}
                  size="icon"
                  className={cn(
                    route.active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''
                  )}
                >
                  <route.icon className="h-5 w-5" />
                </Button>
              </Link>
            ))}
          </div>

          {onCreateHabit && (
            <Button
              onClick={onCreateHabit}
              className="rounded-full"
              size="icon"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-full p-4 hidden md:block">
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Habit Tracker</h2>
        </div>

        {renderNavLinks()}

        <div className="mt-auto pt-6">
          {onCreateHabit && (
            <Button onClick={onCreateHabit} className="w-full gap-2">
              <Plus className="h-5 w-5" />
              New Habit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
