/**
 * StudentProgressChart Component
 * Line chart showing progress over time using recharts
 */

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export interface ProgressDataPoint {
  date: string;
  progress: number;
  timeSpent: number;
}

export interface StudentProgressChartProps {
  data: ProgressDataPoint[];
  title?: string;
  height?: number;
  showTimeSpent?: boolean;
}

export const StudentProgressChart: React.FC<StudentProgressChartProps> = ({
  data,
  title = 'Progress Over Time',
  height = 300,
  showTimeSpent = true,
}) => {
  if (data.length === 0) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value) => {
                if (value === 'progress') return 'Course Progress (%)';
                if (value === 'timeSpent') return 'Time Spent (hours)';
                return value;
              }}
            />
            <Line
              type="monotone"
              dataKey="progress"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="progress"
              dot={{ fill: 'hsl(var(--primary))' }}
              activeDot={{ r: 6 }}
            />
            {showTimeSpent && (
              <Line
                type="monotone"
                dataKey="timeSpent"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="timeSpent"
                dot={{ fill: 'hsl(var(--chart-2))' }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
