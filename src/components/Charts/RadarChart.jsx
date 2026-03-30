import { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { lifeAreas } from '../../data/lifeAreas';
import { useReviews } from '../../hooks/useReviews';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function RadarChart() {
  const { reviews } = useReviews();

  const data = useMemo(() => {
    const labels = lifeAreas.map(a => a.name.split(' ')[0]);

    const getLatestByType = (type) => {
      const found = reviews.find(r => r.reviewType === type);
      if (!found) return null;
      return lifeAreas.map(a => found.scores[a.id] || 0);
    };

    const datasets = [];

    const weekly = getLatestByType('weekly');
    if (weekly) {
      datasets.push({
        label: 'Latest Weekly',
        data: weekly,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
        pointRadius: 3
      });
    }

    const monthly = getLatestByType('monthly');
    if (monthly) {
      datasets.push({
        label: 'Latest Monthly',
        data: monthly,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderWidth: 2,
        pointBackgroundColor: '#10b981',
        pointRadius: 3
      });
    }

    const quarterly = getLatestByType('quarterly');
    if (quarterly) {
      datasets.push({
        label: 'Latest Quarterly',
        data: quarterly,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderWidth: 2,
        pointBackgroundColor: '#f59e0b',
        pointRadius: 3
      });
    }

    return { labels, datasets };
  }, [reviews]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          padding: 16,
          usePointStyle: true,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#e2e8f0',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          color: '#475569',
          backdropColor: 'transparent',
          font: { size: 10 }
        },
        grid: {
          color: '#1e293b'
        },
        angleLines: {
          color: '#1e293b'
        },
        pointLabels: {
          color: '#94a3b8',
          font: { size: 11 }
        }
      }
    }
  };

  if (data.datasets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Complete a review to see your life balance radar</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Life Balance Radar</h3>
      <div className="h-[400px]">
        <Radar data={data} options={options} />
      </div>
    </div>
  );
}
