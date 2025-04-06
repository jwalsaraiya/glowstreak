
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  CheckCheck, Clock, Flame, TrendingUp, 
  ArrowRight, ArrowUp, Zap, PieChart, Calendar
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { format, subDays, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, differenceInDays, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [habits, setHabits] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [habitStats, setHabitStats] = useState<any[]>([]);

  // Fetch user's habits, events, and tasks data
  useEffect(() => {
    if (user) {
      const userData = localStorage.getItem(`userData_${user.id}`);
      if (userData) {
        const parsedData = JSON.parse(userData);
        const habitsData = parsedData.habits || [];
        setHabits(habitsData);
        setEvents(parsedData.events || []);
        setTasks(parsedData.tasks || []);
        
        // Set the first habit as selected by default if available
        if (habitsData.length > 0 && !selectedHabit) {
          setSelectedHabit(habitsData[0].id);
        }
      }
    }
  }, [user, selectedHabit]);

  // Calculate statistics for each habit
  useEffect(() => {
    if (!habits.length) return;

    const today = new Date();
    const statsArray = habits.map(habit => {
      const completionDates = habit.completionDates || [];
      const startDate = habit.startDate ? new Date(habit.startDate) : today;
      const daysToConsider = Math.max(1, differenceInDays(today, startDate) + 1);
      
      // Count successful days (completions)
      const successDays = new Set();
      completionDates.forEach((dateStr: string) => {
        const dateObj = new Date(dateStr);
        successDays.add(format(dateObj, 'yyyy-MM-dd'));
      });
      
      // Calculate current streak
      let currentStreak = 0;
      if (successDays.has(format(today, 'yyyy-MM-dd'))) {
        currentStreak = 1;
        let checkDate = today;
        
        for (let i = 1; i < 1000; i++) { // Limiting to prevent infinite loops
          checkDate = subDays(checkDate, 1);
          if (successDays.has(format(checkDate, 'yyyy-MM-dd'))) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
      
      // Calculate completions for different time periods
      const thisWeek = eachDayOfInterval({
        start: startOfWeek(today),
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
      
      // Calculate fail days (days since start that weren't completed)
      const failDays = daysToConsider - successDays.size;
      
      // Calculate success to fail ratio
      const successToFailRatio = failDays > 0 
        ? (successDays.size / failDays).toFixed(2)
        : successDays.size > 0 ? "∞" : "0";
      
      // Calculate completion rate
      const completionRate = Math.round((successDays.size / daysToConsider) * 100);
      
      // Generate weekly trend data
      const weeklyTrendData = [];
      for (let i = 6; i >= 0; i--) {
        const weekStart = subDays(today, i * 7 + 6);
        const weekEnd = subDays(today, i * 7);
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
        
        const completedDays = weekDays.filter(day => 
          successDays.has(format(day, 'yyyy-MM-dd'))
        ).length;
        
        const weekCompletionRate = Math.round((completedDays / weekDays.length) * 100);
        
        weeklyTrendData.push({
          name: `W${i+1}`,
          value: weekCompletionRate,
          tooltip: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`
        });
      }
      
      // Generate monthly trend data
      const monthlyTrendData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(today);
        monthDate.setMonth(today.getMonth() - i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        // Only count days up to today for the current month
        const effectiveEndDate = i === 0 ? today : monthEnd;
        
        const monthDays = eachDayOfInterval({ 
          start: monthStart, 
          end: effectiveEndDate 
        });
        
        const completedDays = monthDays.filter(day => 
          successDays.has(format(day, 'yyyy-MM-dd'))
        ).length;
        
        const monthCompletionRate = Math.round((completedDays / monthDays.length) * 100);
        
        monthlyTrendData.push({
          name: format(monthDate, 'MMM'),
          value: monthCompletionRate
        });
      }
      
      // Get longest streak
      let longestStreak = 0;
      const dateObjects = completionDates.map((d: string) => new Date(d))
        .sort((a: Date, b: Date) => a.getTime() - b.getTime());
      
      if (dateObjects.length > 0) {
        let currentStreakCount = 1;
        
        for (let i = 1; i < dateObjects.length; i++) {
          const prevDate = dateObjects[i-1];
          const currDate = dateObjects[i];
          
          // Check if dates are consecutive
          const diffDays = differenceInDays(currDate, prevDate);
          
          if (diffDays === 1) {
            currentStreakCount++;
          } else {
            // Reset streak count if dates aren't consecutive
            longestStreak = Math.max(longestStreak, currentStreakCount);
            currentStreakCount = 1;
          }
        }
        
        // Check final streak
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
        successToFailRatio,
        weeklyCompletions,
        monthlyCompletions,
        yearlyCompletions,
        weeklyTrendData,
        monthlyTrendData
      };
    });
    
    setHabitStats(statsArray);
  }, [habits]);

  // Get the currently selected habit stats
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
                  Success to Fail Ratio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">{selectedStats.successToFailRatio}</div>
                <p className="text-sm text-muted-foreground mb-4">Success vs Failure Rate</p>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-500">Success</Badge>
                  <span className="text-sm">vs</span>
                  <Badge variant="outline" className="text-red-500">Fail</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {parseFloat(selectedStats.successToFailRatio) >= 1 ? 
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

          <div className="grid grid-cols-1 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Completion Trend
                  </CardTitle>
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
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={range === 'weekly' ? selectedStats.weeklyTrendData : selectedStats.monthlyTrendData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis unit="%" domain={[0, 100]} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Completion Rate']}
                        contentStyle={{ borderRadius: '0.5rem' }}
                      />
                      <Bar
                        dataKey="value"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
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
