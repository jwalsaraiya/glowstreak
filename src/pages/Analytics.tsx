
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  CheckCheck, Clock, Flame, TrendingUp, 
  ArrowRight, ArrowUp, Zap 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { format, subDays, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, differenceInDays } from 'date-fns';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  // Fetch user's habits, events, and tasks data
  useEffect(() => {
    if (user) {
      const userData = localStorage.getItem(`userData_${user.id}`);
      if (userData) {
        const parsedData = JSON.parse(userData);
        setHabits(parsedData.habits || []);
        setEvents(parsedData.events || []);
        setTasks(parsedData.tasks || []);
      }
    }
  }, [user]);

  // Calculate real analytics data based on actual habits, events, and tasks
  useEffect(() => {
    if (!user) return;

    // Calculate date ranges based on selected range
    const today = new Date();
    let dateRange;
    let dateFormat;
    
    if (range === 'daily') {
      // Last 7 days
      const startDate = subDays(today, 6);
      dateRange = eachDayOfInterval({ start: startDate, end: today });
      dateFormat = 'EEE';
    } else if (range === 'weekly') {
      // Last 4 weeks
      const startDate = subDays(today, 28);
      dateRange = [];
      for (let i = 0; i < 4; i++) {
        const weekStart = subDays(today, 28 - i * 7);
        dateRange.push(weekStart);
      }
      dateFormat = 'MMM d';
    } else {
      // Last 6 months
      dateRange = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        dateRange.push(date);
      }
      dateFormat = 'MMM';
    }

    // Completion data for the selected time range
    const completionData = dateRange.map(date => {
      // For daily and weekly, we check exact days
      // For monthly, we check the entire month
      const startDate = range === 'monthly' 
        ? startOfMonth(date) 
        : range === 'weekly' 
          ? startOfWeek(date)
          : date;
      
      const endDate = range === 'monthly' 
        ? endOfMonth(date) 
        : range === 'weekly' 
          ? endOfWeek(date)
          : date;
      
      const periodDays = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Total possible habit completions in this period
      // Number of habits × number of days
      const totalPossibleCompletions = habits.length * periodDays.length;
      
      // Count actual completions
      let completedCount = 0;
      habits.forEach(habit => {
        periodDays.forEach(day => {
          const isCompleted = habit.completionDates?.some((dateStr: string) => 
            isSameDay(new Date(dateStr), day)
          );
          if (isCompleted) completedCount++;
        });
      });
      
      // Calculate completion percentage
      const completionPercentage = totalPossibleCompletions > 0 
        ? Math.round((completedCount / totalPossibleCompletions) * 100) 
        : 0;
      
      return {
        name: format(date, dateFormat),
        value: completionPercentage,
        date: date.toISOString(),
      };
    });

    // Calculate overall completion rate (average)
    const overallCompletionRate = completionData.length > 0 
      ? Math.round(completionData.reduce((sum, item) => sum + item.value, 0) / completionData.length)
      : 0;

    // Calculate habit strength data - accurately capped at 100%
    const habitStrengthData = habits.map(habit => {
      // Calculate completion percentage
      const completionDates = habit.completionDates || [];
      const startDate = habit.startDate ? new Date(habit.startDate) : today;
      const daysToConsider = Math.max(1, differenceInDays(today, startDate) + 1);
      
      // Count unique days completed
      const uniqueDates = new Set();
      completionDates.forEach((dateStr: string) => {
        const date = new Date(dateStr);
        uniqueDates.add(format(date, 'yyyy-MM-dd'));
      });
      
      const uniqueCompletedDays = uniqueDates.size;
      
      // Calculate percentage, capped at 100%
      const completionPercentage = Math.min(100, Math.round((uniqueCompletedDays / daysToConsider) * 100));

      // Calculate current streak
      const sortedCompletionDates = [...completionDates]
        .map((dateStr: string) => new Date(dateStr))
        .sort((a: Date, b: Date) => b.getTime() - a.getTime());
      
      let streak = 0;
      if (sortedCompletionDates.length > 0) {
        // Check if habit completed today
        const isCompletedToday = sortedCompletionDates.some(date => 
          isSameDay(date, today)
        );

        if (isCompletedToday) {
          streak = 1;
          let previousDate = today;
          
          // Count back from yesterday
          for (let i = 0; i < 365; i++) {
            const expectedDate = subDays(previousDate, 1);
            const isCompleted = sortedCompletionDates.some(date => 
              isSameDay(date, expectedDate)
            );
            
            if (isCompleted) {
              streak++;
              previousDate = expectedDate;
            } else {
              break;
            }
          }
        }
      }

      return {
        name: habit.title,
        value: completionPercentage,
        streak: streak,
      };
    });

    // Find longest streak
    const longestStreakHabit = habitStrengthData.length > 0 
      ? habitStrengthData.reduce((max, habit) => (habit.streak > max.streak ? habit : max), habitStrengthData[0])
      : { name: 'No habits yet', streak: 0, value: 0 };

    setAnalyticsData({
      completionData,
      habitStrengthData,
      overallCompletionRate,
      longestStreakHabit,
    });
  }, [habits, tasks, events, user, range]);

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your progress and see your habits analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center">
              <CheckCheck className="mr-2 h-5 w-5" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{analyticsData.overallCompletionRate}%</div>
            <p className="text-sm text-muted-foreground mb-4">Overall habit completion rate</p>
            <Progress value={analyticsData.overallCompletionRate} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1 text-primary" />
              <span>Keep up the good work!</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Flame className="mr-2 h-5 w-5" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{analyticsData.longestStreakHabit.streak} days</div>
            <p className="text-sm text-muted-foreground mb-4">{analyticsData.longestStreakHabit.name}</p>
            <Progress value={(analyticsData.longestStreakHabit.streak / 30) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 flex items-center">
              <Zap className="h-3 w-3 mr-1 text-primary" />
              <span>Keep going to reach 30 days!</span>
            </p>
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
                  <SelectItem value="daily">Daily</SelectItem>
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
                  data={analyticsData.completionData}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Habit Strength
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.habitStrengthData.map((habit: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{habit.name}</div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="rounded-full">
                      {habit.streak} days
                    </Badge>
                    <span className="text-sm font-semibold">{habit.value}%</span>
                  </div>
                </div>
                <Progress value={habit.value} className="h-2" />
              </div>
            ))}
            
            {analyticsData.habitStrengthData.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No habits data available yet. Start adding habits to see your analytics!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
