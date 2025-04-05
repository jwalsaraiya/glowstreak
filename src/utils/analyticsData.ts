
import { addDays, format, startOfMonth, subDays, subMonths } from "date-fns";

// Function to generate random data for analytics
export const generateAnalyticsData = (userId: string = 'default') => {
  // Use a seed based on userId to generate consistent random data
  const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Seeded random function
  const random = (min: number, max: number) => {
    const x = Math.sin(seed + Date.now()) * 10000;
    const rand = x - Math.floor(x);
    return Math.floor(rand * (max - min + 1)) + min;
  };
  
  // Weekly completion data (last 7 days)
  const weeklyCompletionData = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const day = format(date, 'EEE');
    weeklyCompletionData.push({
      name: day,
      value: random(60, 100),
      date: date.toISOString(),
    });
  }
  
  // Category data
  const categoryData = [
    { name: 'Health', value: random(20, 40) },
    { name: 'Fitness', value: random(15, 30) },
    { name: 'Learning', value: random(10, 25) },
    { name: 'Mindfulness', value: random(10, 20) },
    { name: 'Productivity', value: random(5, 15) },
  ];
  
  // Normalize category percentages to sum to 100
  const categorySum = categoryData.reduce((sum, item) => sum + item.value, 0);
  categoryData.forEach(item => {
    item.value = Math.round((item.value / categorySum) * 100);
  });
  
  // Habit strength data
  const habitStrengthData = [
    { name: 'Morning Meditation', value: random(80, 95), streak: random(10, 15) },
    { name: 'Read a Book', value: random(70, 85), streak: random(5, 12) },
    { name: 'Exercise', value: random(75, 90), streak: random(7, 14) },
    { name: 'Drink Water', value: random(85, 100), streak: random(12, 20) },
    { name: 'Journal', value: random(50, 70), streak: random(3, 8) },
  ];
  
  // Calculate overall completion rate
  const overallCompletionRate = Math.round(
    weeklyCompletionData.reduce((sum, item) => sum + item.value, 0) / weeklyCompletionData.length
  );
  
  // Find longest streak
  const longestStreakHabit = habitStrengthData.reduce(
    (max, habit) => (habit.streak > max.streak ? habit : max),
    habitStrengthData[0]
  );
  
  // Calculate daily time spent (in minutes)
  const dailyTimeSpent = random(60, 90);
  
  // Monthly trend data (last 30 days)
  const monthlyTrendData = [];
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i);
    monthlyTrendData.push({
      date: date.toISOString(),
      completion: random(50, 100),
    });
  }
  
  // Monthly habit completion
  const monthlyHabitCompletion = [];
  const currentMonth = startOfMonth(new Date());
  const previousMonth = startOfMonth(subMonths(new Date(), 1));
  
  const currentMonthCompletion = random(75, 95);
  const previousMonthCompletion = random(65, 85);
  
  monthlyHabitCompletion.push(
    {
      month: format(previousMonth, 'MMM'),
      completion: previousMonthCompletion,
    },
    {
      month: format(currentMonth, 'MMM'),
      completion: currentMonthCompletion,
    }
  );
  
  return {
    weeklyCompletionData,
    categoryData,
    habitStrengthData,
    overallCompletionRate,
    longestStreakHabit,
    dailyTimeSpent,
    monthlyTrendData,
    monthlyHabitCompletion,
  };
};
