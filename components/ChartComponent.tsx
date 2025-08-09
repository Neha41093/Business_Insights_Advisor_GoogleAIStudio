import React from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { ChartData } from '../types';

interface ChartComponentProps {
  data: ChartData;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
        <p className="label text-gray-700">{`${label}`}</p>
        <p className="intro text-gray-500">{`Value : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const ChartComponent: React.FC<ChartComponentProps> = ({ data }) => {
    const { type, title, data: chartData } = data;

    const renderChart = () => {
        switch (type) {
            case 'bar':
                return (
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#6b7280" tick={{ fontSize: 12 }}/>
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(148, 163, 184, 0.1)'}}/>
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }}/>
                        <YAxis stroke="#6b7280" tick={{ fontSize: 12 }}/>
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label={(entry) => entry.name}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                );
            default:
                return <p className="text-red-500">Unsupported chart type: {type}</p>
        }
    }

    return (
        <div className="w-full h-80">
            <h4 className="text-md font-semibold text-gray-700 mb-4 text-center">{title}</h4>
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};

export default ChartComponent;