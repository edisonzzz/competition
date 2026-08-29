import { useEffect, useState } from 'react';
import { LineChart, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TeamProgressChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // 模拟数据 - 每小时的得分变化
    const timeLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    const teams = [
      { name: 'Blue Shield Team Alpha', color: '#3b82f6', data: generateProgressData(24, 500) },
      { name: 'Cyber Guardians', color: '#10b981', data: generateProgressData(24, 350) },
      { name: 'Security Vanguard', color: '#8b5cf6', data: generateProgressData(24, 300) },
      { name: 'Digital Defenders', color: '#f59e0b', data: generateProgressData(24, 250) },
      { name: 'Hack Hunters', color: '#06b6d4', data: generateProgressData(24, 200) }
    ];

    const data = {
      labels: timeLabels,
      datasets: teams.map(team => ({
        label: team.name,
        data: team.data,
        borderColor: team.color,
        backgroundColor: team.color + '20',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: team.color,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2
      }))
    };

    setChartData(data);
  }, []);

  function generateProgressData(points, maxScore) {
    const data = [0];
    let current = 0;

    for (let i = 1; i < points; i++) {
      // 随机增长，但有些时段增长更快
      const increase = Math.random() * (maxScore / points) * (1 + Math.sin(i / 3));
      current = Math.min(maxScore, current + increase);
      data.push(Math.round(current));
    }

    return data;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e2e8f0',
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(10, 14, 39, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: '#3b82f6',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y + ' points';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(59, 130, 246, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: 'Points',
          color: '#e2e8f0'
        }
      },
      x: {
        grid: {
          color: 'rgba(59, 130, 246, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#94a3b8',
          maxRotation: 0,
          font: {
            size: 10
          }
        },
        title: {
          display: true,
          text: 'Competition Time (Hours)',
          color: '#e2e8f0'
        }
      }
    }
  };

  if (!chartData) {
    return <div className="text-gray-400">Loading chart...</div>;
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <LineChart className="w-6 h-6 text-cyan-500" />
        <div>
          <h3 className="text-xl font-semibold text-gray-100">Team Progress Over Time</h3>
          <p className="text-sm text-gray-400">Real-time competition dynamics</p>
        </div>
      </div>
      <div className="h-[400px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
