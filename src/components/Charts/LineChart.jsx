import { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import { lifeAreas } from '../../data/lifeAreas';
import { useReviews } from '../../hooks/useReviews';
import { formatDate } from '../../utils/dateHelpers';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function LineChart() {
  const { reviews } = useReviews();
  const [typeFilter, setTypeFilter] = useState('all');
  const [visibleAreas, setVisibleAreas] = useState(
    new Set(lifeAreas.map(a => a.id))
  );

  const toggleArea = (areaId) => {
    setVisibleAreas(prev => {
      const next = new Set(prev);
      if (next.has(areaId)) {
        next.delete(areaId);
      } else {
        next.add(areaId);
      }
      return next;
    });
  };

  const data = useMemo(() => {
    const filtered = typeFilter === 'all'
      ? [...reviews].reverse()
      : [...reviews].filter(r => r.reviewType === typeFilter).reverse();

    const labels = filtered.map(r =>
      formatDate(r.createdAt || r.date)
    );

    const datasets = lifeAreas
      .filter(a => visibleAreas.has(a.id))
      .map(area => ({
        label: area.name,
        data: filtered.map(r => r.scores[area.id] || 0),
        borderColor: area.color,
        backgroundColor: area.color + '20',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: area.color,
        tension: 0.3
      }));

    return { labels, datasets };
  }, [reviews, typeFilter, visibleAreas]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
      x: {
        ticks: { color: '#475569', font: { size: 10 }, maxRotation: 45 },
        grid: { color: '#1e293b' }
      },
      y: {
        min: 0,
        max: 10,
        ticks: { color: '#475569', stepSize: 2 },
        grid: { color: '#1e293b' }
      }
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Complete reviews over time to see your trends</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-slate-200">Score Trends</h3>

        <div className="flex gap-1.5">
          {['all', 'weekly', 'monthly', 'quarterly'].map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                ${typeFilter === f
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:text-slate-300'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Area Toggles */}
      <div className="flex flex-wrap gap-2">
        {lifeAreas.map(area => (
          <button
            key={area.id}
            onClick={() => toggleArea(area.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
              border transition-all
              ${visibleAreas.has(area.id)
                ? 'border-opacity-50 text-white'
                : 'border-slate-700 text-slate-500 opacity-50'
              }`}
            style={{
              borderColor: visibleAreas.has(area.id) ? area.color : undefined,
              backgroundColor: visibleAreas.has(area.id) ? area.color + '20' : undefined
            }}
          >
            <span>{area.icon}</span>
            <span>{area.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[350px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
