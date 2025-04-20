import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  CheckCheck, Clock, Flame, TrendingUp, 
  ArrowRight, ArrowUp, Zap, PieChart, Calendar
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import StreakAnalytics from '@/components/StreakAnalytics';
import { useTheme } from '@/hooks/use-theme';
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
  addDays,
  getYear,
  isSameWeek,
  addYears,
  subYears,
  isAfter,
  isBefore,
  isSameMonth
} from 'date-fns';

const getWeekStartsOn = (day: "sunday" | "monday"): 0 | 1 => {
  return day === "sunday" ? 0 : 1;
};

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { isDarkTheme } = useTheme();
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [habitStats, setHabitStats] = useState<any[]>([]);
  const [settings, setSettings] = useState<{firstDayOfWeek: "sunday" | "monday"}>({ firstDayOfWeek: "sunday" });

  const currentYear = new Date().getFullYear();

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

    const statsArray = habits.map(habit => {
      const completionDates = habit.completionDates || [];
      const startDate = habit.startDate ? new Date(habit.startDate) : new Date();
      const recurrence = habit.recurrence || 'daily';
      
      let daysToConsider = 0;
      const daysSinceStart = Math.max(1, differenceInDays(new Date(), startDate) + 1);
      
      if (recurrence === 'daily') {
        daysToConsider = daysSinceStart;
      } else if (recurrence === 'weekly') {
        daysToConsider = Math.floor(daysSinceStart / 7);
        if (new Date().getDay() === startDate.getDay()) {
          daysToConsider += 1;
        }
      } else if (recurrence === 'monthly') {
        let count = 0;
        let currentDate = new Date(startDate);
        while (currentDate <= new Date()) {
          if (currentDate.getDate() === startDate.getDate()) {
            count++;
          }
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        daysToConsider = count;
      } else if (recurrence === 'yearly') {
        let count = 0;
        let currentDate = new Date(startDate);
        while (currentDate <= new Date()) {
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
        while (currentDay <= new Date()) {
          if (currentDay.getDay() === targetDayOfWeek) {
            relevantDays.push(new Date(currentDay));
          }
          currentDay = addDays(currentDay, 1);
        }
      } else if (recurrence === 'monthly') {
        const targetDayOfMonth = startDate.getDate();
        let currentDay = new Date(startDate);
        while (currentDay <= new Date()) {
          if (currentDay.getDate() === targetDayOfMonth) {
            relevantDays.push(new Date(currentDay));
          }
          currentDay = addDays(currentDay, 1);
        }
      } else if (recurrence === 'yearly') {
        const targetDayOfMonth = startDate.getDate();
        const targetMonth = startDate.getMonth();
        let currentDay = new Date(startDate);
        while (currentDay <= new Date()) {
          if (currentDay.getDate() === targetDayOfMonth && 
              currentDay.getMonth() === targetMonth) {
            relevantDays.push(new Date(currentDay));
          }
          currentDay = addDays(currentDay, 1);
        }
      } else if (recurrence === 'none') {
        relevantDays = [new Date(startDate)];
      } else {
        relevantDays = eachDayOfInterval({ start: startDate, end: new Date() });
      }
      
      let successCount = 0;
      relevantDays.forEach(day => {
        if (successDays.has(format(day, 'yyyy-MM-dd'))) {
          successCount++;
        }
      });
      
      const failCount = relevantDays.length - successCount;
      
      let currentStreak = 0;
      
      if (recurrence === 'daily') {
        if (successDays.has(format(new Date(), 'yyyy-MM-dd'))) {
          currentStreak = 1;
          let checkDate = new Date();
          
          for (let i = 1; i < 1000; i++) {
            checkDate = subDays(checkDate, 1);
            if (isBefore(checkDate, startDate)) break;
            
            if (successDays.has(format(checkDate, 'yyyy-MM-dd'))) {
              currentStreak++;
            } else {
              break;
            }
          }
        } else if (successDays.has(format(subDays(new Date(), 1), 'yyyy-MM-dd'))) {
          currentStreak = 1;
          let checkDate = subDays(new Date(), 1);
          
          for (let i = 1; i < 1000; i++) {
            checkDate = subDays(checkDate, 1);
            if (isBefore(checkDate, startDate)) break;
            
            if (successDays.has(format(checkDate, 'yyyy-MM-dd'))) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      } else if (recurrence === 'weekly') {
        const dayOfWeek = startDate.getDay();
        const weekStartsOn = getWeekStartsOn(settings.firstDayOfWeek);
        const thisWeekDay = eachDayOfInterval({
          start: startOfWeek(new Date(), { weekStartsOn }),
          end: endOfWeek(new Date(), { weekStartsOn })
        }).find(day => day.getDay() === dayOfWeek);
        
        if (thisWeekDay && successDays.has(format(thisWeekDay, 'yyyy-MM-dd'))) {
          currentStreak = 1;
          let currentWeekStart = subDays(startOfWeek(new Date(), { weekStartsOn }), 7);
          
          for (let i = 1; i < 52; i++) {
            const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn });
            const targetDay = eachDayOfInterval({
              start: currentWeekStart,
              end: weekEnd
            }).find(day => day.getDay() === dayOfWeek);
            
            if (targetDay && isBefore(targetDay, startDate)) break;
            
            if (targetDay && successDays.has(format(targetDay, 'yyyy-MM-dd'))) {
              currentStreak++;
              currentWeekStart = subDays(currentWeekStart, 7);
            } else {
              break;
            }
          }
        } else if (isSameDay(new Date(), thisWeekDay || new Date()) === false) {
          const lastWeekDay = eachDayOfInterval({
            start: startOfWeek(subDays(new Date(), 7), { weekStartsOn }),
            end: endOfWeek(subDays(new Date(), 7), { weekStartsOn })
          }).find(day => day.getDay() === dayOfWeek);
          
          if (lastWeekDay && successDays.has(format(lastWeekDay, 'yyyy-MM-dd'))) {
            currentStreak = 1;
            let currentWeekStart = subDays(startOfWeek(subDays(new Date(), 7), { weekStartsOn }), 7);
            
            for (let i = 1; i < 52; i++) {
              const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn });
              const targetDay = eachDayOfInterval({
                start: currentWeekStart,
                end: weekEnd
              }).find(day => day.getDay() === dayOfWeek);
              
              if (targetDay && isBefore(targetDay, startDate)) break;
              
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
        const thisMonthDay = new Date(new Date().getFullYear(), new Date().getMonth(), dayOfMonth);
        
        if (thisMonthDay <= new Date() && successDays.has(format(thisMonthDay, 'yyyy-MM-dd'))) {
          currentStreak = 1;
          
          for (let i = 1; i < 100; i++) {
            const prevMonth = new Date(new Date().getFullYear(), new Date().getMonth() - i, dayOfMonth);
            const actualPrevMonth = new Date(prevMonth);
            
            if (actualPrevMonth.getDate() === dayOfMonth && 
                successDays.has(format(actualPrevMonth, 'yyyy-MM-dd'))) {
              currentStreak++;
            } else {
              break;
            }
          }
        } else if (dayOfMonth > new Date().getDate()) {
          const lastMonthDay = new Date(new Date().getFullYear(), new Date().getMonth() - 1, dayOfMonth);
          
          if (successDays.has(format(lastMonthDay, 'yyyy-MM-dd'))) {
            currentStreak = 1;
            
            for (let i = 2; i < 100; i++) {
              const prevMonth = new Date(new Date().getFullYear(), new Date().getMonth() - i, dayOfMonth);
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
        const thisYearDay = new Date(new Date().getFullYear(), month, dayOfMonth);
        
        if (thisYearDay <= new Date() && successDays.has(format(thisYearDay, 'yyyy-MM-dd'))) {
          currentStreak = 1;
          
          for (let i = 1; i < 30; i++) {
            const prevYear = new Date(new Date().getFullYear() - i, month, dayOfMonth);
            if (successDays.has(format(prevYear, 'yyyy-MM-dd'))) {
              currentStreak++;
            } else {
              break;
            }
          }
        } else if (thisYearDay > new Date()) {
          const lastYearDay = new Date(new Date().getFullYear() - 1, month, dayOfMonth);
          
          if (successDays.has(format(lastYearDay, 'yyyy-MM-dd'))) {
            currentStreak = 1;
            
            for (let i = 2; i < 30; i++) {
              const prevYear = new Date(new Date().getFullYear() - i, month, dayOfMonth);
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
      
      let longestStreak = 0;
      if (recurrence === 'daily') {
        const dateObjects = completionDates
          .map((d: string) => new Date(d))
          .filter((d: Date) => !isBefore(d, startDate))
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
      
      const weeklyTrendData = [];
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31);
      
      const effectiveYearStart = new Date(Math.max(startDate.getTime(), yearStart.getTime()));
      const effectiveYearEnd = new Date(Math.min(new Date().getTime(), yearEnd.getTime()));
      
      const weekStartsOn = getWeekStartsOn(settings.firstDayOfWeek);
      let currentWeekStart = startOfWeek(new Date(currentYear, 0, 1), { weekStartsOn });
      while (currentWeekStart <= endOfYear(new Date(currentYear, 0, 1))) {
        const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn });
        const weekDays = eachDayOfInterval({ 
          start: currentWeekStart, 
          end: weekEnd 
        });
        
        const weekInYear = Math.ceil((differenceInDays(currentWeekStart, new Date(currentYear, 0, 1)) + 1) / 7);
        
        let relevantWeekDays = [];
        if (recurrence === 'weekly') {
          relevantWeekDays = weekDays.filter(day => 
            day.getDay() === startDate.getDay() && 
            !isBefore(day, startDate) && 
            !isAfter(day, new Date())
          );
        } else if (recurrence === 'monthly') {
          relevantWeekDays = weekDays.filter(day => 
            day.getDate() === startDate.getDate() && 
            !isBefore(day, startDate) && 
            !isAfter(day, new Date())
          );
        } else if (recurrence === 'yearly') {
          relevantWeekDays = weekDays.filter(day => 
            day.getDate() === startDate.getDate() && 
            day.getMonth() === startDate.getMonth() && 
            !isBefore(day, startDate) && 
            !isAfter(day, new Date())
          );
        } else if (recurrence === 'daily') {
          relevantWeekDays = weekDays.filter(day => 
            !isBefore(day, startDate) && 
            !isAfter(day, new Date())
          );
        }
        
        const completedDays = relevantWeekDays.filter(day => 
          successDays.has(format(day, 'yyyy-MM-dd'))
        ).length;
        
        const weekCompletionRate = relevantWeekDays.length > 0 ? 
          Math.round((completedDays / relevantWeekDays.length) * 100) : 0;
        
        const isCurrentWeek = currentYear === new Date().getFullYear() && 
          isSameWeek(new Date(), currentWeekStart, { weekStartsOn });
        
        const isFutureWeek = isAfter(currentWeekStart, new Date());
        
        weeklyTrendData.push({
          name: `W${weekInYear}`,
          value: isFutureWeek ? 0 : weekCompletionRate,
          tooltip: `${format(currentWeekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
          isCurrent: isCurrentWeek,
          isFuture: isFutureWeek
        });
        
        currentWeekStart = new Date(currentWeekStart);
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }
      
      const monthlyTrendData = [];
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(currentYear, i, 1);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const effectiveEndDate = currentYear === new Date().getFullYear() && i >= new Date().getMonth() 
          ? (i === new Date().getMonth() ? new Date() : monthStart)
          : monthEnd;
        
        let relevantMonthDays: Date[] = [];
        
        if (recurrence === 'daily') {
          relevantMonthDays = eachDayOfInterval({ start: monthStart, end: effectiveEndDate })
            .filter(day => !isBefore(day, startDate) && !isAfter(day, new Date()));
        } else if (recurrence === 'weekly') {
          let dayOfWeek = startDate.getDay();
          let currentDay = new Date(monthStart);
          while (currentDay <= effectiveEndDate) {
            if (currentDay.getDay() === dayOfWeek && 
                !isBefore(currentDay, startDate) && 
                !isAfter(currentDay, new Date())) {
              relevantMonthDays.push(new Date(currentDay));
            }
            currentDay = addDays(currentDay, 1);
          }
        } else if (recurrence === 'monthly') {
          let dayOfMonth = startDate.getDate();
          if (dayOfMonth <= new Date(currentYear, i+1, 0).getDate()) {
            let targetDay = new Date(currentYear, i, dayOfMonth);
            if (targetDay <= effectiveEndDate && 
                !isBefore(targetDay, startDate) && 
                !isAfter(targetDay, new Date())) {
              relevantMonthDays.push(targetDay);
            }
          }
        } else if (recurrence === 'yearly') {
          if (i === startDate.getMonth()) {
            let targetDay = new Date(currentYear, i, startDate.getDate());
            if (targetDay <= effectiveEndDate && 
                !isBefore(targetDay, startDate) && 
                !isAfter(targetDay, new Date())) {
              relevantMonthDays.push(targetDay);
            }
          }
        }
        
        const completedDays = relevantMonthDays.filter(day => 
          successDays.has(format(day, 'yyyy-MM-dd'))
        ).length;
        
        const monthCompletionRate = relevantMonthDays.length > 0 ? 
          Math.round((completedDays / relevantMonthDays.length) * 100) : 0;
        
        const isCurrentMonth = currentYear === new Date().getFullYear() && i === new Date().getMonth();
        const isFutureMonth = currentYear > new Date().getFullYear() || 
          (currentYear === new Date().getFullYear() && i > new Date().getMonth());
        
        monthlyTrendData.push({
          name: `M${i+1}`,
          value: isFutureMonth ? 0 : monthCompletionRate,
          totalDays: relevantMonthDays.length,
          completedDays: completedDays,
          isCurrent: isCurrentMonth,
          isFuture: isFutureMonth
        });
      }
      
      let activeDaysInYear = 0;
      
      if (recurrence === 'daily') {
        activeDaysInYear = differenceInDays(effectiveYearEnd, effectiveYearStart) + 1;
      } else if (recurrence === 'weekly') {
        let dayOfWeek = startDate.getDay();
        let countDays = 0;
        let currentDay = new Date(effectiveYearStart);
        while (currentDay <= effectiveYearEnd) {
          if (currentDay.getDay() === dayOfWeek) {
            countDays++;
          }
          currentDay = addDays(currentDay, 1);
        }
        activeDaysInYear = countDays;
      } else if (recurrence === 'monthly') {
        let dayOfMonth = startDate.getDate();
        let countDays = 0;
        for (let month = 0; month < 12; month++) {
          const maxDaysInMonth = new Date(currentYear, month + 1, 0).getDate();
          if (dayOfMonth <= maxDaysInMonth) {
            const targetDay = new Date(currentYear, month, dayOfMonth);
            if (!isBefore(targetDay, effectiveYearStart) && !isAfter(targetDay, effectiveYearEnd)) {
              countDays++;
            }
          }
        }
        activeDaysInYear = countDays;
      } else if (recurrence === 'yearly') {
        const targetDay = new Date(currentYear, startDate.getMonth(), startDate.getDate());
        activeDaysInYear = !isBefore(targetDay, effectiveYearStart) && !isAfter(targetDay, effectiveYearEnd) ? 1 : 0;
      }
      
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
        monthlyTrendData,
        activeDaysInYear,
        yearlyAvgCompletion: 0
      };
    });
    
    statsArray.forEach(stat => {
      const weekStartsOn = getWeekStartsOn(settings.firstDayOfWeek);
      const weekStart = startOfWeek(new Date(currentYear), { weekStartsOn });
      stat.weeklyCompletions = stat.weeklyTrendData
        .find((w: any) => isWithinInterval(new Date(), {
          start: new Date(w.tooltip.split(' - ')[0] + `, ${currentYear}`), 
          end: new Date(w.tooltip.split(' - ')[1] + `, ${currentYear}`)
        }))?.value || 0;
      
      stat.monthlyCompletions = stat.monthlyTrendData[new Date().getMonth()].completedDays || 0;
      
      stat.yearlyCompletions = stat.monthlyTrendData.reduce((sum: number, month: any) => 
        sum + (month.completedDays || 0), 0);
      
      if (stat.activeDaysInYear > 0) {
        stat.yearlyAvgCompletion = Math.round((stat.yearlyCompletions / stat.activeDaysInYear) * 100);
      } else {
        stat.yearlyAvgCompletion = 0;
      }
    });
    
    setHabitStats(statsArray);
  }, [habits, currentYear, settings.firstDayOfWeek]);

  const getSelectedHabitStats = () => {
    if (!selectedHabit || !habitStats.length) return null;
    return habitStats.find(stat => stat.id === selectedHabit) || habitStats[0];
  };

  const selectedStats = getSelectedHabitStats();

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

          {/* Completion Trend Graph section has been removed */}

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
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
