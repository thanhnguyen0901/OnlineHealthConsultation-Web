import React, { useEffect } from 'react';
import { Card } from 'primereact/card';
import { PieChartWidget } from '@/components/charts/PieChartWidget';
import { BarChartWidget } from '@/components/charts/BarChartWidget';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadReportsRequested } from '../redux/reports.slice';
import { selectReportsData } from '../redux/reports.selectors';

export const ReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const reportsData = useAppSelector(selectReportsData);

  useEffect(() => {
    dispatch(loadReportsRequested({}));
  }, [dispatch]);

  const pieData = [
    { name: 'Appointments', value: 45 },
    { name: 'Questions', value: 30 },
    { name: 'Users', value: 25 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Distribution">
          <PieChartWidget data={pieData} />
        </Card>
        <Card title="Trends">
          <BarChartWidget data={reportsData} dataKeys={['appointments', 'questions']} xAxisKey="date" />
        </Card>
      </div>
    </div>
  );
};
