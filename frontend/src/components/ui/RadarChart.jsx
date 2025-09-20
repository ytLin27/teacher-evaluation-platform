import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const RadarChart = ({ data, className = '', title = '' }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#374151',
          font: {
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#6366f1',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.r}/5.0`;
          }
        }
      },
    },
    scales: {
      r: {
        angleLines: {
          color: '#e5e7eb',
        },
        grid: {
          color: '#e5e7eb',
        },
        pointLabels: {
          color: '#374151',
          font: {
            size: 11,
            weight: '500',
          },
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 10,
          },
          backdropColor: 'transparent',
          beginAtZero: true,
          min: 0,
          max: 5,
          stepSize: 1,
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  return (
    <div className={`relative ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      <div style={{ height: '300px' }}>
        <Radar data={data} options={options} />
      </div>
    </div>
  );
};

export default RadarChart;