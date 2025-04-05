
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, Monitor, User, Bell, Clock } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customize your application preferences
        </p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 md:max-w-2xl">
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
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer hover:border-primary ${theme === 'light' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-6 w-6 mb-2" />
                    <span>Light</span>
                  </div>
                  <div 
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer hover:border-primary ${theme === 'dark' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-6 w-6 mb-2" />
                    <span>Dark</span>
                  </div>
                  <div 
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer hover:border-primary ${theme === 'system' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="h-6 w-6 mb-2" />
                    <span>System</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduce-animations">Reduce animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Disable animations for improved performance
                    </p>
                  </div>
                  <Switch id="reduce-animations" />
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
                  <Switch id="compact-view" />
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
                  <Switch id="reminder-notifications" defaultChecked />
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
                  <Switch id="streak-notifications" defaultChecked />
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
                  <Switch id="achievement-notifications" defaultChecked />
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
                        Manage your profile information
                      </p>
                    </div>
                  </div>
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
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <div>
                      <h4 className="font-medium">Time zone</h4>
                      <p className="text-sm text-muted-foreground">
                        Current: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
                  <Switch id="streak-calculation" defaultChecked />
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
                  <Switch id="auto-archive" />
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
                  <Switch id="default-view" defaultChecked />
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
