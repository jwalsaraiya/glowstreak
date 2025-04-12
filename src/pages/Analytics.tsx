import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  CheckCheck, Clock, Flame, TrendingUp, 
  ArrowRight, ArrowUp, Zap, PieChart, Calendar,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import StreakAnalytics from '@/components/StreakAnalytics';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  format, 
  subDays, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  differenceInDays, 
  startOfYear, 
  endOfYear, 
  isWithinInterval,
  addYears,
  subYears,
  getYear
} from 'date-fns';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [habits, setHabits] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [habitStats, setHabitStats] = useState<any[]>([]);
  const [settings, setSettings] = useState<{firstDayOfWeek: "sunday" | "monday"}>({ firstDayOfWeek: "sunday" });
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));

  useEffect(() => {
    if (user) {
      const userData = localStorage.getItem(`userData_${user.id}`);
      const userSettings = localStorage.getItem(`settings_${user.id}`);
      
      if (userData) {
        const parsedData = JSON.parse(userData);
        const habitsData = parsedData.habits || [];
        setHabits(habitsData);
        setEvents(parsedData.events || []);
        setTasks(parsedData.tasks || []);
        
        if (habitsData.length > 0 && !selectedHabit) {
          setSelectedHabit(habitsData[0].id);
        }
      }
      
      if (userSettings) {
        const parsedSettings = JSON.parse(userSettings);
        setSettings({
          firstDayOfWeek: parsedSettings.firstDayOfWeek || "sunday"
        });
      }
    }
  }, [user, selectedHabit]);

  useEffect(() => {
    if (!habits.length) return;

    const today = new Date();
    const weekStartsOn = settings.firstDayOfWeek === "monday" ? 1 : 0;
    const statsArray = habits.map(habit => {
      const completionDates = habit.completionDates || [];
      const startDate = habit.startDate ? new Date(habit.startDate) : today;
      const daysToConsider = Math.max(1, differenceInDays(today, startDate) + 1);
      
      const successDays = new Set();
      completionDates.forEach((dateStr: string) => {
        const dateObj = new Date(dateStr);
        successDays.add(format(dateObj, 'yyyy-MM-dd'));
      });
      
      const successCount = successDays.size;
      const failCount = daysToConsider - successCount;
      
      let currentStreak = 0;
      if (successDays.has(format(today, 'yyyy-MM-dd'))) {
        currentStreak = 1;
        let checkDate = today;
        
        for (let i = 1; i < 1000; i++) {
          checkDate = subDays(checkDate, 1);
          if (successDays.has(format(checkDate, 'yyyy-MM-dd'))) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
      
      const thisWeek = eachDayOfInterval({
        start: startOfWeek(today, { weekStartsOn }),
        end: today
      });
      
      const thisMonth = eachDayOfInterval({
        start: startOfMonth(today),
        end: today
      });
      
      const thisYear = eachDayOfInterval({
        start: startOfYear(today),
        end: today
      });
      
      const weeklyCompletions = thisWeek.filter(day => 
        successDays.has(format(day, 'yyyy-MM-dd'))
      ).length;
      
      const monthlyCompletions = thisMonth.filter(day => 
        successDays.has(format(day, 'yyyy-MM-dd'))
      ).length;
      
      const yearlyCompletions = thisYear.filter(day => 
        successDays.has(format(day, 'yyyy-MM-dd'))
      ).length;
      
      const completionRate = Math.round((successCount / daysToConsider) * 100);
      
      const weeklyTrendData = [];
      const yearStart = new Date(selectedYear, 0, 1);
      const yearEnd = new Date(selectedYear, 11, 31);
      
      let currentWeekStart = startOfWeek(new Date(selectedYear, 0, 1), { weekStartsOn });
      while (currentWeekStart <= endOfYear(new Date(selectedYear, 0, 1))) {
        const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn });
        const weekDays = eachDayOfInterval({ 
          start: currentWeekStart, 
          end: weekEnd 
        });
        
        const weekInYear = Math.ceil((differenceInDays(currentWeekStart, new Date(selectedYear, 0, 1)) + 1) / 7);
        
        const completedDays = weekDays.filter(day => 
          successDays.has(format(day, 'yyyy-MM-dd'))
        ).length;
        
        const weekCompletionRate = weekDays.length > 0 ? Math.round((completedDays / weekDays.length) * 100) : 0;
        
        weeklyTrendData.push({
          name: `W${weekInYear}`,
          value: weekCompletionRate,
          tooltip: `${format(currentWeekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`
        });
        
        currentWeekStart = new Date(currentWeekStart);
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }
      
      const monthlyTrendData = [];
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(selectedYear, i, 1);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const effectiveEndDate = selectedYear === today.getFullYear() && i >= today.getMonth() 
          ? (i === today.getMonth() ? today : monthStart)
          : monthEnd;
        
        const monthDays = eachDayOfInterval({ 
          start: monthStart, 
          end: effectiveEndDate 
        });
        
        const completedDays = monthDays.filter(day => 
          successDays.has(format(day, 'yyyy-MM-dd'))
        ).length;
        
        const monthCompletionRate = monthDays.length > 0 ? Math.round((completedDays / monthDays.length) * 100) : 0;
        
        monthlyTrendData.push({
          name: format(monthDate, 'MMM'),
          value: monthCompletionRate,
          totalDays: monthDays.length,
          completedDays: completedDays
        });
      }
      
      let longestStreak = 0;
      const dateObjects = completionDates.map((d: string) => new Date(d))
        .sort((a: Date, b: Date) => a.getTime() - b.getTime());
      
      if (dateObjects.length > 0) {
        let currentStreakCount = 1;
        
        for (let i = 1; i < dateObjects.length; i++) {
          const prevDate = dateObjects[i-1];
          const currDate = dateObjects[i];
          
          const diffDays = differenceInDays(currDate, prevDate);
          
          if (diffDays === 1) {
            currentStreakCount++;
          } else {
            longestStreak = Math.max(longestStreak, currentStreakCount);
            currentStreakCount = 1;
          }
        }
        
        longestStreak = Math.max(longestStreak, currentStreakCount);
      }
      
      return {
        id: habit.id,
        name: habit.title,
        category: habit.category,
        priority: habit.priority,
        currentStreak,
        longestStreak,
        completionRate,
        successCount,
        failCount,
        weeklyCompletions,
        monthlyCompletions,
        yearlyCompletions,
        weeklyTrendData,
        monthlyTrendData
      };
    });
    
    setHabitStats(statsArray);
  }, [habits, selectedYear, settings.firstDayOfWeek]);

  const getSelectedHabitStats = () => {
    if (!selectedHabit || !habitStats.length) return null;
    return habitStats.find(stat => stat.id === selectedHabit) || habitStats[0];
  };

  const selectedStats = getSelectedHabitStats();

  const changeYear = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedYear(prevYear => prevYear - 1);
    } else {
      setSelectedYear(prevYear => prevYear + 1);
    }
  };

  if (!habits.length) {
    return (
      <div className="container mx-auto py-6 max-w-7xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your progress and see your habits analytics</p>
        </div>
        
        <Card className="h-64">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center py-8 space-y-2">
              <p className="text-lg font-medium">No habits to analyze yet</p>
              <p className="text-muted-foreground">Add some habits to see analytics!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your progress and see your habits analytics</p>
      </div>

      <div className="mb-6">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Select Habit to Analyze
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedHabit || ''} 
              onValueChange={setSelectedHabit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a habit" />
              </SelectTrigger>
              <SelectContent>
                {habits.map(habit => (
                  <SelectItem key={habit.id} value={habit.id}>
                    {habit.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {selectedStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <CheckCheck className="mr-2 h-5 w-5" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">{selectedStats.completionRate}%</div>
                <p className="text-sm text-muted-foreground mb-4">Overall habit completion</p>
                <Progress value={selectedStats.completionRate} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-1 text-primary" />
                  <span>Keep up the good work!</span>
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Flame className="mr-2 h-5 w-5" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">{selectedStats.currentStreak} days</div>
                <p className="text-sm text-muted-foreground mb-4">{selectedStats.name}</p>
                <Progress value={(selectedStats.currentStreak / 30) * 100} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2 flex items-center">
                  <Zap className="h-3 w-3 mr-1 text-primary" />
                  <span>Longest streak: {selectedStats.longestStreak} days</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />
                  Success vs Fail Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-2">
                  <div>
                    <div className="text-4xl font-bold text-green-500">{selectedStats.successCount}</div>
                    <p className="text-sm text-muted-foreground">Success</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-red-500">{selectedStats.failCount}</div>
                    <p className="text-sm text-muted-foreground">Fail</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2 mt-4">
                  <Badge className="bg-green-500">Success</Badge>
                  <span className="text-sm">vs</span>
                  <Badge variant="outline" className="text-red-500">Fail</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedStats.successCount > selectedStats.failCount ? 
                    "You're succeeding more than failing!" : 
                    "Try to increase your success rate!"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <CheckCheck className="mr-2 h-5 w-5" />
                  Weekly Completions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{selectedStats.weeklyCompletions}</div>
                <p className="text-sm text-muted-foreground">Days completed this week</p>
                <Progress 
                  value={(selectedStats.weeklyCompletions / 7) * 100} 
                  className="h-2 mt-4"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <CheckCheck className="mr-2 h-5 w-5" />
                  Monthly Completions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{selectedStats.monthlyCompletions}</div>
                <p className="text-sm text-muted-foreground">Days completed this month</p>
                <Progress 
                  value={(selectedStats.monthlyCompletions / 30) * 100} 
                  className="h-2 mt-4"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <CheckCheck className="mr-2 h-5 w-5" />
                  Yearly Completions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{selectedStats.yearlyCompletions}</div>
                <p className="text-sm text-muted-foreground">Days completed this year</p>
                <Progress 
                  value={(selectedStats.yearlyCompletions / 365) * 100} 
                  className="h-2 mt-4"
                />
              </CardContent>
            </Card>
          </div>

          {habitStats.length > 0 && (
            <div className="mb-8">
              <StreakAnalytics
                streaks={habitStats.map(stat => ({
                  name: stat.name,
                  currentStreak: stat.currentStreak,
                  longestStreak: stat.longestStreak,
                  completion: stat.completionRate
                }))}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <CardTitle className="text-xl font-semibold flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Completion Trend
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => changeYear('prev')}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="mx-2 text-sm font-medium">{selectedYear}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => changeYear('next')}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <Select 
                      value={range} 
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setRange(value)}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <div className={`${range === 'weekly' ? 'min-w-[1200px]' : 'min-w-[700px]'} h-full overflow-x-auto`}>
                    <ChartContainer 
                      className="mt-4"
                      config={{
                        primary: {
                          color: "#33C3F0"
                        }
                      }}
                    >
                      <BarChart
                        data={range === 'weekly' ? selectedStats.weeklyTrendData : selectedStats.monthlyTrendData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                        barSize={range === 'weekly' ? 35 : 50}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12 }} 
                          tickMargin={10}
                          padding={{ left: 20, right: 20 }}
                        />
                        <YAxis 
                          unit="%" 
                          domain={[0, 100]} 
                          tickMargin={10} 
                          tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent 
                            formatter={(value) => [`${value}%`, 'Completion Rate']}
                            labelFormatter={(label) => {
                              const item = (range === 'weekly' ? selectedStats.weeklyTrendData : selectedStats.monthlyTrendData)
                                .find((item: any) => item.name === label);
                              return range === 'weekly' 
                                ? item?.tooltip || label 
                                : `${label}: ${item?.completedDays || 0}/${item?.totalDays || 0} days`;
                            }}
                          />}
                        />
                        <Bar
                          dataKey="value"
                          fill="#33C3F0"
                          radius={[4, 4, 0, 0]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
