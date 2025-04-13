
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Label
} from 'recharts';
import { useTheme } from '@/hooks/use-theme';

interface DataItem {
  name: string;
  value: number;
  tooltip?: string;
  totalDays?: number;
  completedDays?: number;
}

interface CompletionTrendGraphProps {
  data: DataItem[];
  range: 'weekly' | 'monthly';
  isDarkTheme: boolean;
}

export const CompletionTrendGraph: React.FC<CompletionTrendGraphProps> = ({
  data,
  range,
  isDarkTheme
}) => {
  const primaryColor = '#0d968b';
  
  // Calculate the average completion rate
  const avgCompletion = data.length 
    ? Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length) 
    : 0;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const item = payload[0].payload;
    
    return (
      <div className={`px-3 py-2 rounded-md shadow-lg ${isDarkTheme ? 'bg-background border border-border' : 'bg-white'}`}>
        <p className="font-medium text-sm">
          {range === 'weekly' 
            ? item.tooltip || label 
            : `${label}: ${item.completedDays || 0}/${item.totalDays || 0} days`}
        </p>
        <p className="font-bold text-lg mt-1 text-primary">
          {payload[0].value}% <span className="text-xs font-normal text-muted-foreground">completed</span>
        </p>
      </div>
    );
  };

  return (
    <div className="w-full" style={{ height: range === 'weekly' ? '350px' : '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 30 }}
          barCategoryGap={range === 'weekly' ? 10 : 20}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkTheme ? '#33333a' : '#eee'} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }} 
            tickMargin={10}
            axisLine={{ stroke: isDarkTheme ? '#33333a' : '#eee' }}
          />
          <YAxis 
            unit="%" 
            domain={[0, 100]} 
            tickMargin={10} 
            tick={{ fontSize: 12 }} 
            axisLine={{ stroke: isDarkTheme ? '#33333a' : '#eee' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine 
            y={avgCompletion} 
            stroke={isDarkTheme ? '#ddd' : '#888'} 
            strokeDasharray="3 3" 
            strokeWidth={1.5} 
          >
            <Label 
              value={`Avg: ${avgCompletion}%`} 
              position="right"
              fill={isDarkTheme ? '#ddd' : '#888'} 
              fontSize={12}
              fontWeight={500}
            />
          </ReferenceLine>
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]} 
            className="hover:opacity-80 transition-opacity"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.value >= avgCompletion ? primaryColor : (isDarkTheme ? '#555' : '#d4d4d8')} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
