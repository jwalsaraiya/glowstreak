
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, CheckCheck, Clock, Flame, PieChart as PieChartIcon, TrendingUp, ArrowRight, ArrowUp, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { generateAnalyticsData } from '@/utils/analyticsData';

const COLORS = ['#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1'];

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [range, setRange] = useState<'week' | 'month' | 'year'>('week');
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const data = generateAnalyticsData(user.id);
      setAnalyticsData(data);
    }
  }, [user, range]);

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your progress and see your habits analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <span>7% better than last week</span>
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
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Daily Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{analyticsData.dailyTimeSpent} min</div>
            <p className="text-sm text-muted-foreground mb-4">Spent on habits daily</p>
            <Progress value={(analyticsData.dailyTimeSpent / 120) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 flex items-center">
              <ArrowRight className="h-3 w-3 mr-1 text-primary" />
              <span>Consistent with your goals</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Completion Trend
              </CardTitle>
              <Select 
                value={range} 
                onValueChange={(value: 'week' | 'month' | 'year') => setRange(value)}
              >
                <SelectTrigger className="w-32 h-8">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.weeklyCompletionData}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5" />
              Habits by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <div className="w-full max-w-xs">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
