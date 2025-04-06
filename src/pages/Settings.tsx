import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, Monitor, User, Bell, Clock, LogOut, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserSettings {
  compactView: boolean;
  reminderNotifications: boolean;
  streakAlerts: boolean;
  achievementNotifications: boolean;
  strictStreakCalculation: boolean;
  autoArchive: boolean;
  showCompleted: boolean;
  timeZone: string;
  firstDayOfWeek: "sunday" | "monday";
}

const defaultSettings: UserSettings = {
  compactView: false,
  reminderNotifications: true,
  streakAlerts: true,
  achievementNotifications: true,
  strictStreakCalculation: true,
  autoArchive: false,
  showCompleted: true,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  firstDayOfWeek: "sunday"
};

const timeZones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Rome",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Australia/Sydney",
  "Pacific/Auckland"
];

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      const savedSettings = localStorage.getItem(`settings_${user.id}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`settings_${user.id}`, JSON.stringify(settings));
    }
  }, [settings, user]);

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
      
      return newSettings;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customize your application preferences
        </p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 overflow-auto md:overflow-visible max-w-full md:max-w-2xl">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the app looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer hover:border-primary ${theme === 'light' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-6 w-6 mb-2" />
                    <span>Light</span>
                  </div>
                  <div 
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer hover:border-primary ${theme === 'dark' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-6 w-6 mb-2" />
                    <span>Dark</span>
                  </div>
                  <div 
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer hover:border-primary ${theme === 'system' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="h-6 w-6 mb-2" />
                    <span>System</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-0.5 flex items-start flex-col">
                  <div className="flex items-center mb-2">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <h4 className="font-medium">First Day of Week</h4>
                  </div>
                  
                  <Select 
                    value={settings.firstDayOfWeek} 
                    onValueChange={(value) => updateSetting('firstDayOfWeek', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select first day of week" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose which day should be shown as the first day of the week in calendars
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compact-view">Compact view</Label>
                    <p className="text-sm text-muted-foreground">
                      Show more items on screen with a compact layout
                    </p>
                  </div>
                  <Switch 
                    id="compact-view" 
                    checked={settings.compactView}
                    onCheckedChange={(checked) => updateSetting('compactView', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reminder-notifications">Habit reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for uncompleted habits
                    </p>
                  </div>
                  <Switch 
                    id="reminder-notifications" 
                    checked={settings.reminderNotifications}
                    onCheckedChange={(checked) => updateSetting('reminderNotifications', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="streak-notifications">Streak alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you're about to break a streak
                    </p>
                  </div>
                  <Switch 
                    id="streak-notifications" 
                    checked={settings.streakAlerts}
                    onCheckedChange={(checked) => updateSetting('streakAlerts', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="achievement-notifications">Achievement notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you reach a milestone
                    </p>
                  </div>
                  <Switch 
                    id="achievement-notifications" 
                    checked={settings.achievementNotifications}
                    onCheckedChange={(checked) => updateSetting('achievementNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    <div>
                      <h4 className="font-medium">Profile</h4>
                      <p className="text-sm text-muted-foreground">
                        {user ? user.username : 'Loading...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-0.5 flex items-start flex-col">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 mr-2" />
                    <h4 className="font-medium">Time zone</h4>
                  </div>
                  
                  <Select 
                    value={settings.timeZone} 
                    onValueChange={(value) => updateSetting('timeZone', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                        System: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      </SelectItem>
                      {timeZones.map(zone => (
                        <SelectItem key={zone} value={zone}>
                          {zone.replace('_', ' ').replace('/', ': ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your time zone is used to display dates and times correctly
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    <div>
                      <h4 className="font-medium">Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Manage your notification preferences
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <Button 
                variant="destructive"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="habits">
          <Card>
            <CardHeader>
              <CardTitle>Habits & Tasks</CardTitle>
              <CardDescription>
                Customize your habit tracking preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="streak-calculation">Strict streak calculation</Label>
                    <p className="text-sm text-muted-foreground">
                      Break streaks if habits are not completed on their scheduled day
                    </p>
                  </div>
                  <Switch 
                    id="streak-calculation" 
                    checked={settings.strictStreakCalculation}
                    onCheckedChange={(checked) => updateSetting('strictStreakCalculation', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-archive">Auto-archive completed one-time tasks</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically archive one-time tasks after completion
                    </p>
                  </div>
                  <Switch 
                    id="auto-archive" 
                    checked={settings.autoArchive}
                    onCheckedChange={(checked) => updateSetting('autoArchive', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="default-view">Show completed habits</Label>
                    <p className="text-sm text-muted-foreground">
                      Show completed habits in your daily view
                    </p>
                  </div>
                  <Switch 
                    id="default-view" 
                    checked={settings.showCompleted}
                    onCheckedChange={(checked) => updateSetting('showCompleted', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
