import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#F5C518', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#f97316'];

const AllocationChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px' }}
          itemStyle={{ color: '#fff' }}
        />
        <Legend verticalAlign="bottom" height={36}/>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default AllocationChart;