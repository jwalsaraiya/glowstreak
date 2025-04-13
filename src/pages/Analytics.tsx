import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  CheckCheck, Clock, Flame, TrendingUp, 
  ArrowRight, ArrowUp, Zap, PieChart, Calendar,
  ChevronLeft, ChevronRight, BarChart2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import StreakAnalytics from '@/components/StreakAnalytics';
import { useTheme } from '@/hooks/use-theme';
import { CompletionTrendGraph } from '@/components/CompletionTrendGraph';
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
  getYear,
  addDays,
  isSameWeek
} from 'date-fns';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { isDarkTheme } = useTheme();
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [range, setRange] = useState<'weekly' | 'monthly'>('weekly');
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
      const recurrence = habit.recurrence || 'daily';
      
      let daysToConsider = 0;
      const daysSinceStart = Math.max(1, differenceInDays(today, startDate) + 1);
      
      if (recurrence === 'daily') {
        daysToConsider = daysSinceStart;
      } else if (recurrence === 'weekly') {
        daysToConsider = Math.floor(daysSinceStart / 7);
        if (today.getDay() === startDate.getDay()) {
          daysToConsider += 1;
        }
      } else if (recurrence === 'monthly') {
        let count = 0;
        let currentDate = new Date(startDate);
        while (currentDate <= today) {
          if (currentDate.getDate() === startDate.getDate()) {
            count++;
          }
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        daysToConsider = count;
      } else if (recurrence === 'yearly') {
        let count = 0;
        let currentDate = new Date(startDate);
        while (currentDate <= today) {
          if (currentDate.getDate() === startDate.getDate() && 
              currentDate.getMonth() === startDate.getMonth()) {
            count++;
          }
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
        daysToConsider = count;
      } else {
        daysToConsider = 1;
      }
      
      daysToConsider = Math.max(1, daysToConsider);
      
      const successDays = new Set();
      completionDates.forEach((dateStr: string) => {
        const dateObj = new Date(dateStr);
        successDays.add(format(dateObj, 'yyyy-MM-dd'));
      });
      
      let relevantDays: Date[] = [];
      
      if (recurrence === 'weekly') {
        const targetDayOfWeek = startDate.getDay();
        let currentDay = new Date(startDate);
        while (currentDay <= today) {
          if (currentDay.getDay() === targetDayOfWeek) {
            relevantDays.push(new Date(currentDay));
          }
          currentDay = addDays(currentDay, 1);
        }
      } else if (recurrence === 'monthly') {
        const targetDayOfMonth = startDate.getDate();
        let currentDay = new Date(startDate);
        while (currentDay <= today) {
          if (currentDay.getDate() === targetDayOfMonth) {
            relevantDays.push(new Date(currentDay));
          }
          currentDay = addDays(currentDay, 1);
        }
      } else if (recurrence === 'yearly') {
        const targetDayOfMonth = startDate.getDate();
        const targetMonth = startDate.getMonth();
        let currentDay = new Date(startDate);
        while (currentDay <= today) {
          if (currentDay.getDate() === targetDayOfMonth && 
              currentDay.getMonth() === targetMonth) {
            relevantDays.push(new Date(currentDay));
          }
          currentDay = addDays(currentDay, 1);
        }
      } else if (recurrence === 'none') {
        relevantDays = [new Date(startDate)];
      } else {
        relevantDays = eachDayOfInterval({ start: startDate, end: today });
      }
      
      let successCount = 0;
      relevantDays.forEach(day => {
        if (successDays.has(format(day, 'yyyy-MM-dd'))) {
          successCount++;
        }
      });
      
      const failCount = daysToConsider - successCount;
      
      let currentStreak = 0;
      
      if (recurrence === 'daily') {
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
        } else if (successDays.has(format(subDays(today, 1), 'yyyy-MM-dd'))) {
          currentStreak = 1;
          let checkDate = subDays(today, 1);
          
          for (let i = 1; i < 1000; i++) {
            checkDate = subDays(checkDate, 1);
            if (successDays.has(format(checkDate, 'yyyy-MM-dd'))) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      } else if (recurrence === 'weekly') {
        const dayOfWeek = startDate.getDay();
        const thisWeekDay = eachDayOfInterval({
          start: startOfWeek(today, { weekStartsOn }),
          end: endOfWeek(today, { weekStartsOn })
        }).find(day => day.getDay() === dayOfWeek);
        
        if (thisWeekDay && successDays.has(format(thisWeekDay, 'yyyy-MM-dd'))) {
          currentStreak = 1;
          let currentWeekStart = subDays(startOfWeek(today, { weekStartsOn }), 7);
          
          for (let i = 1; i < 52; i++) {
            const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn });
            const targetDay = eachDayOfInterval({
              start: currentWeekStart,
              end: weekEnd
            }).find(day => day.getDay() === dayOfWeek);
            
            if (targetDay && successDays.has(format(targetDay, 'yyyy-MM-dd'))) {
              currentStreak++;
              currentWeekStart = subDays(currentWeekStart, 7);
            } else {
              break;
            }
          }
        } else if (isSameDay(today, thisWeekDay || new Date()) === false) {
          const lastWeekDay = eachDayOfInterval({
            start: startOfWeek(subDays(today, 7), { weekStartsOn }),
            end: endOfWeek(subDays(today, 7), { weekStartsOn })
          }).find(day => day.getDay() === dayOfWeek);
          
          if (lastWeekDay && successDays.has(format(lastWeekDay, 'yyyy-MM-dd'))) {
            currentStreak = 1;
            let currentWeekStart = subDays(startOfWeek(subDays(today, 7), { weekStartsOn }), 7);
            
            for (let i = 1; i < 52; i++) {
              const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn });
              const targetDay = eachDayOfInterval({
                start: currentWeekStart,
                end: weekEnd
              }).find(day => day.getDay() === dayOfWeek);
              
              if (targetDay && successDays.has(format(targetDay, 'yyyy-MM-dd'))) {
                currentStreak++;
                currentWeekStart = subDays(currentWeekStart, 7);
              } else {
                break;
              }
            }
          }
        }
      } else if (recurrence === 'monthly') {
        const dayOfMonth = startDate.getDate();
        const thisMonthDay = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
        
        if (thisMonthDay <= today && successDays.has(format(thisMonthDay, 'yyyy-MM-dd'))) {
          currentStreak = 1;
          
          for (let i = 1; i < 100; i++) {
            const prevMonth = new Date(today.getFullYear(), today.getMonth() - i, dayOfMonth);
            const actualPrevMonth = new Date(prevMonth);
            
            if (actualPrevMonth.getDate() === dayOfMonth && 
                successDays.has(format(actualPrevMonth, 'yyyy-MM-dd'))) {
              currentStreak++;
            } else {
              break;
            }
          }
        } else if (dayOfMonth > today.getDate()) {
          const lastMonthDay = new Date(today.getFullYear(), today.getMonth() - 1, dayOfMonth);
          
          if (successDays.has(format(lastMonthDay, 'yyyy-MM-dd'))) {
            currentStreak = 1;
            
            for (let i = 2; i < 100; i++) {
              const prevMonth = new Date(today.getFullYear(), today.getMonth() - i, dayOfMonth);
              const actualPrevMonth = new Date(prevMonth);
              
              if (actualPrevMonth.getDate() === dayOfMonth && 
                  successDays.has(format(actualPrevMonth, 'yyyy-MM-dd'))) {
                currentStreak++;
              } else {
                break;
              }
            }
          }
        }
      } else if (recurrence === 'yearly') {
        const dayOfMonth = startDate.getDate();
        const month = startDate.getMonth();
        const thisYearDay = new Date(today.getFullYear(), month, dayOfMonth);
        
        if (thisYearDay <= today && successDays.has(format(thisYearDay, 'yyyy-MM-dd'))) {
          currentStreak = 1;
          
          for (let i = 1; i < 30; i++) {
            const prevYear = new Date(today.getFullYear() - i, month, dayOfMonth);
            if (successDays.has(format(prevYear, 'yyyy-MM-dd'))) {
              currentStreak++;
            } else {
              break;
            }
          }
        } else if (thisYearDay > today) {
          const lastYearDay = new Date(today.getFullYear() - 1, month, dayOfMonth);
          
          if (successDays.has(format(lastYearDay, 'yyyy-MM-dd'))) {
            currentStreak = 1;
            
            for (let i = 2; i < 30; i++) {
              const prevYear = new Date(today.getFullYear() - i, month, dayOfMonth);
              if (successDays.has(format(prevYear, 'yyyy-MM-dd'))) {
                currentStreak++;
              } else {
                break;
              }
            }
          }
        }
      } else {
        currentStreak = successDays.size > 0 ? 1 : 0;
      }
      
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
        
        let relevantWeekDays = weekDays;
        if (recurrence === 'weekly') {
          relevantWeekDays = weekDays.filter(day => day.getDay() === startDate.getDay());
        } else if (recurrence === 'monthly') {
          relevantWeekDays = weekDays.filter(day => day.getDate() === startDate.getDate());
        } else if (recurrence === 'yearly') {
          relevantWeekDays = weekDays.filter(day => 
            day.getDate() === startDate.getDate() && day.getMonth() === startDate.getMonth());
        }
        
        const completedDays = relevantWeekDays.filter(day => 
          successDays.has(format(day, 'yyyy-MM-dd'))
        ).length;
        
        const weekCompletionRate = relevantWeekDays.length > 0 ? 
          Math.round((completedDays / relevantWeekDays.length) * 100) : 0;
        
        const isCurrentWeek = selectedYear === today.getFullYear() && 
          isSameWeek(today, currentWeekStart, { weekStartsOn });
        
        weeklyTrendData.push({
          name: `W${weekInYear}`,
          value: weekCompletionRate,
          tooltip: `${format(currentWeekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
          isCurrent: isCurrentWeek
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
        
        let relevantMonthDays: Date[] = [];
        
        if (recurrence === 'daily') {
          relevantMonthDays = eachDayOfInterval({ start: monthStart, end: effectiveEndDate });
        } else if (recurrence === 'weekly') {
          let dayOfWeek = startDate.getDay();
          let currentDay = new Date(monthStart);
          while (currentDay <= effectiveEndDate) {
            if (currentDay.getDay() === dayOfWeek) {
              relevantMonthDays.push(new Date(currentDay));
            }
            currentDay = addDays(currentDay, 1);
          }
        } else if (recurrence === 'monthly') {
          let dayOfMonth = startDate.getDate();
          if (dayOfMonth <= new Date(selectedYear, i+1, 0).getDate()) {
            let targetDay = new Date(selectedYear, i, dayOfMonth);
            if (targetDay <= effectiveEndDate) {
              relevantMonthDays.push(targetDay);
            }
          }
        } else if (recurrence === 'yearly') {
          if (i === startDate.getMonth()) {
            let targetDay = new Date(selectedYear, i, startDate.getDate());
            if (targetDay <= effectiveEndDate) {
              relevantMonthDays.push(targetDay);
            }
          }
        }
        
        const completedDays = relevantMonthDays.filter(day => 
          successDays.has(format(day, 'yyyy-MM-dd'))
        ).length;
        
        const monthCompletionRate = relevantMonthDays.length > 0 ? 
          Math.round((completedDays / relevantMonthDays.length) * 100) : 0;
        
        const isCurrentMonth = selectedYear === today.getFullYear() && i === today.getMonth();
        
        monthlyTrendData.push({
          name: format(monthDate, 'MMM'),
          value: monthCompletionRate,
          totalDays: relevantMonthDays.length,
          completedDays: completedDays,
          isCurrent: isCurrentMonth
        });
      }
      
      let longestStreak = 0;
      if (recurrence === 'daily') {
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
      } else {
        longestStreak = Math.max(currentStreak, 1);
      }
      
      const completionRate = relevantDays.length > 0 
        ? Math.round((successCount / relevantDays.length) * 100)
        : 0;
      
      return {
        id: habit.id,
        name: habit.title,
        category: habit.category,
        priority: habit.priority,
        recurrence: recurrence,
        currentStreak,
        longestStreak,
        completionRate,
        successCount,
        failCount,
        weeklyCompletions: 0,
        monthlyCompletions: 0,
        yearlyCompletions: 0,
        weeklyTrendData,
        monthlyTrendData
      };
    });
    
    statsArray.forEach(stat => {
      const weekStart = startOfWeek(today, { weekStartsOn });
      stat.weeklyCompletions = stat.weeklyTrendData
        .find((w: any) => isWithinInterval(today, {
          start: new Date(w.tooltip.split(' - ')[0] + `, ${selectedYear}`), 
          end: new Date(w.tooltip.split(' - ')[1] + `, ${selectedYear}`)
        }))?.value || 0;
      
      stat.monthlyCompletions = stat.monthlyTrendData[today.getMonth()].completedDays || 0;
      
      stat.yearlyCompletions = stat.monthlyTrendData.reduce((sum: number, month: any) => 
        sum + (month.completedDays || 0), 0);
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
            <Card className="h-[420px]">
              <CardHeader>
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <CardTitle className="text-xl font-semibold flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5" />
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
                      onValueChange={(value: 'weekly' | 'monthly') => setRange(value)}
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
              <CardContent className="h-[calc(100%-80px)] pb-4">
                {selectedStats && (
                  <CompletionTrendGraph 
                    data={range === 'weekly' ? selectedStats.weeklyTrendData : selectedStats.monthlyTrendData}
                    range={range}
                    isDarkTheme={isDarkTheme}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
